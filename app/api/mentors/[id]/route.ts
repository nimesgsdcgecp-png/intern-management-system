import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { GET_MENTOR_BY_ID } from "@/lib/graphql/queries";
import { UPDATE_MENTOR_USER, DELETE_MENTOR_USER } from "@/lib/graphql/mutations";

/**
 * Manage individual mentor data.
 * Supports GET (details), PUT (update), and DELETE (remove).
 */

const mapMentor = (m: any) => ({
  id: m.id,
  name: m.profile?.name || m.name,
  email: m.email,
  role: m.role,
  department: m.profile?.department || m.department || "",
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const data = await hasuraQuery(GET_MENTOR_BY_ID, { id });
    const mentor = data.users_by_pk;

    if (!mentor || mentor.role !== "mentor") return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(mapMentor(mentor));
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    if (!body.name || !body.email) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const updated = await hasuraMutation(UPDATE_MENTOR_USER, {
      id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      department: body.department?.trim() || null,
    });

    if (!updated.update_users_by_pk) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(mapMentor(updated.update_users_by_pk));
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const deleted = await hasuraMutation(DELETE_MENTOR_USER, { id });

    if (!deleted.delete_users_by_pk) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}