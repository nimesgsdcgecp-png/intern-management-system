import { generateId, getTaskById, mapTaskRow } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { GET_ALL_INTERN_IDS, GET_CREATOR_TASKS, GET_INTERN_TASKS, GET_TASK_ASSIGNMENTS_BY_TASK_IDS, GET_TASK_IDS_FOR_INTERN, GET_USER_BY_ID } from "@/lib/graphql/queries";
import { CREATE_TASK, INSERT_TASK_ASSIGNMENTS } from "@/lib/graphql/mutations";
import { getEmailService } from "@/lib/email/emailService";

/**
 * API route for managing tasks.
 * Supports GET (list tasks based on role) and POST (create new task).
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: userId, role: userRole } = session.user as any;
    let tasks: any[] = [];

    // Admin/Mentor see tasks they created
    if (userRole === "admin" || userRole === "mentor") {
      const data = await hasuraQuery(GET_CREATOR_TASKS, { creatorId: userId });
      tasks = data.tasks;
    } else {
      // Interns see tasks assigned to them
      const idData = await hasuraQuery(GET_TASK_IDS_FOR_INTERN, { internId: userId });
      const taskIds = idData.task_assignments.map((r: any) => r.task_id);
      if (taskIds.length > 0) {
        const data = await hasuraQuery(GET_INTERN_TASKS, { taskIds });
        tasks = data.tasks;
      }
    }

    if (tasks.length === 0) return NextResponse.json([]);

    // Fetch assignments separately to keep the main query simple
    const taskIds = tasks.map(t => t.id);
    const assignData = await hasuraQuery(GET_TASK_ASSIGNMENTS_BY_TASK_IDS, { taskIds });

    // Map assignments back to tasks
    const mappedTasks = tasks.map(task => mapTaskRow({
      ...task,
      task_assignments: assignData.task_assignments.filter((a: any) => a.task_id === task.id)
    }));

    return NextResponse.json(mappedTasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role === "intern") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const creatorId = (session.user as any).id;
    const taskId = generateId();

    // 1. Determine assigned interns
    let internIds: string[] = Array.isArray(body.assignedInterns) ? body.assignedInterns : [];
    if (body.assignedToAll) {
      const AllData = await hasuraQuery(GET_ALL_INTERN_IDS, {});
      internIds = AllData.users.map((i: any) => i.id);
    } else if (internIds.length === 0 && body.assignedIntern) {
      internIds = [body.assignedIntern];
    }

    if (internIds.length === 0 && !body.assignedToAll) {
      return NextResponse.json({ error: "No interns assigned" }, { status: 400 });
    }

    // 2. Create the task
    const inserted = await hasuraMutation(CREATE_TASK, {
      id: taskId,
      title: body.title,
      description: body.description,
      assignedBy: creatorId,
      assignedToAll: !!body.assignedToAll,
      deadline: body.deadline,
      priority: (body.priority || "medium").toLowerCase(),
      status: (body.status || "pending").toLowerCase(),
    });

    // 3. Create assignments
    if (internIds.length > 0) {
      await hasuraMutation(INSERT_TASK_ASSIGNMENTS, {
        objects: internIds.map(id => ({ task_id: taskId, intern_id: id }))
      });
    }

    // 4. Send Email Notifications if requested
    if (body.sendEmail && internIds.length > 0) {
      const emailService = getEmailService();
      // Fetch details for each intern and send email
      Promise.all(internIds.map(async (id) => {
        try {
          const internData = await hasuraQuery(GET_USER_BY_ID, { id });
          const user = internData.users_by_pk;
          if (user && user.email) {
            await emailService.sendTaskNotification(
              user.email,
              user.profile?.name || "Intern",
              body.title,
              body.deadline,
              body.priority || "medium"
            );
          }
        } catch (e) {
          console.error(`Failed to send task email to intern ${id}:`, e);
        }
      })).catch(e => console.error("Batch email sending failed:", e));
    }

    const newTask = await getTaskById(taskId);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
