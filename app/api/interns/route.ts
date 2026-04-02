import { generateId, mapInternRow } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  EXISTING_USER_BY_EMAIL,
  EXISTING_USER_BY_ID,
  GET_ALL_INTERNS,
  GET_INTERN_PROFILE,
  GET_MENTOR_INTERNS,
} from "@/lib/graphql/queries";
import { CREATE_INTERN_AND_USER } from "@/lib/graphql/mutations";
import { hash } from "bcryptjs";
import { sendCredentialsEmail } from "@/lib/email/emailService";

/**
 * Handle intern data management.
 * Supports GET (list interns based on role) and POST (admin creates new intern).
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: userId, role: userRole } = session.user as any;
    let data: any = { users: [] };

    if (userRole === "admin") {
      data = await hasuraQuery(GET_ALL_INTERNS, {});
    } else if (userRole === "mentor") {
      data = await hasuraQuery(GET_MENTOR_INTERNS, { mentorId: userId });
    } else if (userRole === "intern") {
      data = await hasuraQuery(GET_INTERN_PROFILE, { id: userId });
    }

    return NextResponse.json(data.users.map(mapInternRow));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const email = body.email?.toLowerCase().trim();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Check if email already exists
    const existing = await hasuraQuery(EXISTING_USER_BY_EMAIL, { email });
    if (existing.users.length > 0) return NextResponse.json({ error: "Email exists" }, { status: 409 });

    // Generate credentials
    const plainPassword = `Intern@${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await hash(plainPassword, 10);
    const internId = generateId();

    // Create Intern & User in a single mutation
    const inserted = await hasuraMutation(CREATE_INTERN_AND_USER, {
      id: internId,
      name: body.name,
      email,
      password: hashedPassword,
      role: "intern",
      department: body.department?.toUpperCase() || "ENGINEERING",
      phone: body.phone,
      mentorId: body.mentorId,
      startDate: body.startDate,
      internStatus: "active",
      collegeName: body.collegeName,
      university: body.university || body.collegeName,
      adminId: (session.user as any).id,
    });

    const newIntern = mapInternRow({
      ...inserted.insert_profiles_one,
      id: internId,
      email,
      intern: inserted.insert_interns_one,
      profile: inserted.insert_profiles_one
    });

    // Attempt to send credentials email
    let emailSent = false;
    try {
      const result = await sendCredentialsEmail({
        to: email,
        credentials: { id: internId, password: plainPassword },
        userInfo: { name: body.name, email },
        userType: 'intern',
        includeResetLink: true
      });
      emailSent = result.success;
    } catch (e) {
      console.error("Email delivery failed", e);
    }

    return NextResponse.json({
      intern: newIntern,
      credentials: { id: internId, password: plainPassword },
      emailSent,
      message: emailSent ? "Account created and email sent" : "Account created (email failed)"
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
