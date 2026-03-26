import { generateId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  EXISTING_USER_BY_EMAIL,
  EXISTING_USER_BY_ID,
  GET_USERS,
} from "@/lib/graphql/queries";
import { CREATE_USER } from "@/lib/graphql/mutations";
import { hash } from "bcryptjs";
import { sendCredentialsEmail } from "@/lib/email/emailService";

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function generatePassword() {
  return `Pass@${randomSuffix(8)}`;
}

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  profile: {
    name: string;
    department?: string;
    phone?: string;
  };
};

export async function GET() {
  try {
    const data = await hasuraQuery<{ users: UserRow[] }>(GET_USERS);

    const safeUsers = data.users.map(({ password_hash, ...user }) => ({
      id: user.id,
      name: user.profile.name,
      email: user.email,
      role: user.role,
      department: user.profile.department || "",
      phone: user.profile.phone || "",
    }));
    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = body?.role;
    const department = String(body?.department || "").trim().toUpperCase();
    const phone = String(body?.phone || "").trim();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    if (role !== "mentor" && role !== "intern" && role !== "admin") {
      return NextResponse.json(
        { error: "Only admin, mentor, or intern accounts can be created" },
        { status: 400 }
      );
    }

    if (!DEPARTMENTS.includes(department)) {
      return NextResponse.json(
        { error: "Invalid department" },
        { status: 400 }
      );
    }

    const existingEmail = await hasuraQuery<{ users: Array<{ id: string }> }>(
      EXISTING_USER_BY_EMAIL,
      { email }
    );

    if (existingEmail.users.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    let id = generateId();
    while (true) {
      const existingId = await hasuraQuery<{ users_by_pk: { id: string } | null }>(
        EXISTING_USER_BY_ID,
        { id }
      );

      if (!existingId.users_by_pk) {
        break;
      }
      id = generateId();
    }

    const plainPassword = generatePassword();
    const hashedPassword = await hash(plainPassword, 10);

    const inserted = await hasuraMutation<{
      insert_users_one: { id: string; email: string; role: string };
      insert_profiles_one: { user_id: string; name: string; department: string; phone: string };
    }>(CREATE_USER, {
      id,
      email,
      password: hashedPassword,
      role,
      name,
      department,
      phone,
    });

    const safeUser = {
      id: inserted.insert_users_one.id,
      name: inserted.insert_profiles_one.name,
      email: inserted.insert_users_one.email,
      role: inserted.insert_users_one.role,
      department: inserted.insert_profiles_one.department,
      phone: inserted.insert_profiles_one.phone,
    };

    // Send credentials email with reset link
    console.log(`Sending credentials email to new ${role}:`, email);

    try {
      // Map admin role to mentor for email template purposes (both are staff roles)
      const emailUserType = role === 'admin' ? 'mentor' : role as 'mentor' | 'intern';

      const emailResult = await sendCredentialsEmail({
        to: email,
        credentials: {
          id,
          password: plainPassword,
        },
        userInfo: {
          name,
          email,
        },
        userType: emailUserType,
        includeResetLink: true, // Include reset link for immediate password change
      });

      if (emailResult.success) {
        console.log(`Credentials email sent successfully to ${email}, messageId:`, emailResult.messageId);

        return NextResponse.json(
          {
            user: safeUser,
            credentials: {
              id,
              password: plainPassword,
            },
            message: `${role} account created successfully. Credentials have been sent to ${email}.`,
            emailSent: true,
          },
          { status: 201 }
        );
      } else {
        console.error(`Failed to send credentials email to ${email}:`, emailResult.error);

        // Still return success but include credentials since email failed
        return NextResponse.json(
          {
            user: safeUser,
            credentials: {
              id,
              password: plainPassword,
            },
            message: `${role} account created successfully, but email delivery failed. Please share these credentials manually.`,
            emailSent: false,
            emailError: emailResult.error,
          },
          { status: 201 }
        );
      }
    } catch (emailError) {
      console.error('Error sending credentials email:', emailError);

      // Fallback to returning credentials if email fails
      return NextResponse.json(
        {
          user: safeUser,
          credentials: {
            id,
            password: plainPassword,
          },
          message: `${role} account created successfully, but email service failed. Please share these credentials manually.`,
          emailSent: false,
          emailError: emailError instanceof Error ? emailError.message : 'Unknown email error',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create user", details: message },
      { status: 500 }
    );
  }
}
