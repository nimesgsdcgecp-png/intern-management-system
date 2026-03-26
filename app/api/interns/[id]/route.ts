import { getInternById } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation } from "@/lib/hasura";
import {
  DELETE_INTERN_AND_USER,
  UPDATE_INTERN_AND_USER,
} from "@/lib/graphql/mutations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const intern = await getInternById(id);

    if (!intern) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    return NextResponse.json(intern);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch intern" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    const existing = await getInternById(id);
    if (!existing) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    const payload = {
      name: updates?.name ?? existing.name,
      email: updates?.email ?? existing.email,
      phone: updates?.phone ?? existing.phone,
      department: updates?.department ?? existing.department,
      mentorId: updates?.mentorId ?? existing.mentorId,
      adminId: updates?.adminId ?? existing.adminId,
      startDate: updates?.startDate ?? existing.startDate,
      endDate: updates?.endDate ?? existing.endDate,
      status: updates?.status ?? existing.status,
      collegeName: updates?.collegeName ?? existing.collegeName,
      university: updates?.university ?? existing.university,
    };

    await hasuraMutation(
      UPDATE_INTERN_AND_USER,
      {
        id,
        name: payload.name,
        email: String(payload.email || "").toLowerCase(),
        department: payload.department || null,
        phone: payload.phone || null,
        mentorId: payload.mentorId || null,
        adminId: payload.adminId || null,
        startDate: payload.startDate || null,
        endDate: payload.endDate || null,
        status: payload.status || null,
        collegeName: payload.collegeName || null,
        university: payload.university || null,
      }
    );

    const updated = await getInternById(id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update intern" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getInternById(id);
    if (!existing) {
      return NextResponse.json({ error: "Intern not found" }, { status: 404 });
    }

    await hasuraMutation(
      DELETE_INTERN_AND_USER,
      { id }
    );

    return NextResponse.json({ message: "Intern deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete intern" },
      { status: 500 }
    );
  }
}
