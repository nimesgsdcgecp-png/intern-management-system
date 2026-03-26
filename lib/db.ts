import { hasuraQuery } from "./hasura";
import {
  GET_INTERN_BY_ID,
  GET_TASK_ASSIGNMENTS_BY_TASK_ID,
  GET_TASK_BY_ID,
  GET_USER_BY_EMAIL,
  GET_USER_BY_ID,
} from "./graphql/queries";
import { v4 as uuidv4 } from "uuid";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  phone?: string;
};

/**
 * Maps a raw Hasura user row to a clean AppUser object.
 * @param row - The raw user object from Hasura.
 * @returns A standardized AppUser object.
 */
function toUser(row: any): AppUser {
  const profile = row.profile || {};
  return {
    id: row.id,
    name: profile.name || row.email.split('@')[0],
    email: row.email,
    password: row.password_hash,
    role: row.role,
    department: profile.department || "",
    phone: profile.phone || "",
  };
}

/**
 * Maps a raw Hasura intern row to a structured object for the dashboard.
 * @param row - The raw intern/user object from Hasura.
 * @returns A consolidated intern object with profile and internship details.
 */
export function mapInternRow(row: any) {
  const intern = row.intern || {};
  return {
    id: row.id,
    name: row.profile?.name || "",
    email: row.email,
    phone: row.profile?.phone || "",
    department: row.profile?.department || "",
    mentorId: intern.mentor_id || "",
    adminId: intern.admin_id || "",
    startDate: intern.start_date || "",
    endDate: intern.end_date || "",
    status: intern.status || "active",
    collegeName: intern.college_name || "",
    university: intern.university || "",
  };
}

/**
 * Standardizes a raw Task row from Hasura into a format used by the UI components.
 * 
 * @param row - The raw task object from Hasura, including optional nested assignments.
 * @returns A flattened and cleaned-up Task object for the application.
 */
export function mapTaskRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    assignedBy: row.assigned_by,
    assignedToAll: row.assigned_to_all || false,
    deadline: row.deadline || "",
    priority: row.priority || "medium",
    status: row.status || "pending",
    createdAt: row.created_at,
    assignedInterns: (row.task_assignments || []).map((a: any) => a.intern_id),
  };
}

/**
 * Retrieves a sanitized user object by their UUID.
 * @param userId - The UUID of the user.
 */
export async function getUserById(userId: string) {
  const data = await hasuraQuery(GET_USER_BY_ID, { id: userId });
  return data?.users_by_pk ? toUser(data.users_by_pk) : null;
}

/**
 * Retrieves a sanitized user object by their email address.
 * @param email - The user's email address.
 */
export async function getUserByEmail(email: string) {
  const data = await hasuraQuery(GET_USER_BY_EMAIL, { email: email.toLowerCase() });
  return data?.users && data.users.length > 0 ? toUser(data.users[0]) : null;
}

/**
 * Retrieves a consolidated intern object by their user ID.
 * @param internId - The UUID of the intern.
 */
export async function getInternById(internId: string) {
  const data = await hasuraQuery(GET_INTERN_BY_ID, { id: internId });
  return data?.users_by_pk ? mapInternRow(data.users_by_pk) : null;
}

/**
 * Fetches a complete Task object by its ID, including all assigned interns.
 * 
 * @param id - The UUID of the task to retrieve.
 * @returns A Promise resolving to the mapped Task object, or null if not found.
 */
export async function getTaskById(id: string) {
  try {
    const taskData = await hasuraQuery(GET_TASK_BY_ID, { id });
    if (!taskData.tasks_by_pk) return null;

    const assignData = await hasuraQuery(GET_TASK_ASSIGNMENTS_BY_TASK_ID, { taskId: id });
    
    return mapTaskRow({
      ...taskData.tasks_by_pk,
      task_assignments: assignData.task_assignments,
    });
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    return null;
  }
}

/**
 * Utility to generate a unique UUID for new database entities.
 * @returns A randomly generated UUID string.
 */
export const generateId = () => uuidv4();
