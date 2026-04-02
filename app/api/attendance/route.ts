import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { GET_USER_ATTENDANCE } from "@/lib/graphql/queries";
import { INSERT_ATTENDANCE, UPDATE_ATTENDANCE } from "@/lib/graphql/mutations";
import { logActivity } from "@/services/activityService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];
    const fetchAll = searchParams.get("all") === "true";
    const department = searchParams.get("department");

    const isAdminOrMentor = ["admin", "mentor"].includes((session.user as any).role);

    if (fetchAll && isAdminOrMentor) {
      const isMentor = (session.user as any).role === "mentor";
      let conditions: any[] = [{ date: { _eq: date } }];

      if (isMentor) {
        // Fetch mentor's department first
        const mentorData = await hasuraQuery<{ users_by_pk: any }>(`
          query GetMentorDept($id: uuid!) {
            users_by_pk(id: $id) {
              profile {
                department
              }
            }
          }
        `, { id: (session.user as any).id });
        
        const dept = mentorData.users_by_pk?.profile?.department;
        if (dept) {
          conditions.push({ user: { profile: { department: { _eq: dept } } } });
        }
      } else if (department) {
        // Admin filtering by department
        conditions.push({ user: { profile: { department: { _ilike: `%${department}%` } } } });
      }

      const data = await hasuraQuery<{ attendance: any[] }>(`
        query GetallAttendance($where: attendance_bool_exp) {
          attendance(where: $where, order_by: {clock_in: desc}) {
            id
            user_id
            date
            clock_in
            clock_out
            status
            total_hours
            user {
              profile {
                name
                department
              }
            }
          }
        }
      `, { where: { _and: conditions } });
      return NextResponse.json(data.attendance);
    }

    const targetUserId = userId || (session.user as any).id;
    const data = await hasuraQuery<{ attendance: any[] }>(GET_USER_ATTENDANCE, {
      userId: targetUserId,
      date
    });

    return NextResponse.json(data.attendance[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { action } = body; // "clock-in" or "clock-out"
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    if (action === "clock-in") {
      const existing = await hasuraQuery<{ attendance: any[] }>(GET_USER_ATTENDANCE, {
        userId,
        date: today
      });

      if (existing.attendance.length > 0) {
        return NextResponse.json({ error: "Already clocked in for today" }, { status: 400 });
      }

      const result = await hasuraMutation(INSERT_ATTENDANCE, {
        userId,
        date: today,
        clockIn: now,
        status: "present"
      });

      await logActivity({
        userId,
        action: "Clocked In",
        entityType: "attendance",
        entityId: (result as any).insert_attendance_one.id
      });

      return NextResponse.json(result);
    } else if (action === "clock-out") {
      const existing = await hasuraQuery<{ attendance: any[] }>(GET_USER_ATTENDANCE, {
        userId,
        date: today
      });

      if (existing.attendance.length === 0) {
        return NextResponse.json({ error: "No clock-in record found for today" }, { status: 400 });
      }

      const record = existing.attendance[0];
      if (record.clock_out) {
        return NextResponse.json({ error: "Already clocked out for today" }, { status: 400 });
      }

      const clockIn = new Date(record.clock_in);
      const clockOut = new Date(now);
      const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      const result = await hasuraMutation(UPDATE_ATTENDANCE, {
        id: record.id,
        clockOut: now,
        totalHours: parseFloat(hours.toFixed(2))
      });

      await logActivity({
        userId,
        action: "Clocked Out",
        entityType: "attendance",
        entityId: record.id,
        metadata: { totalHours: hours.toFixed(2) }
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
