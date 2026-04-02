import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { EXISTING_USER_BY_EMAIL, EXISTING_USER_BY_ID } from "@/lib/graphql/queries";
import { CREATE_INTERN_AND_USER, CREATE_USER, LOG_ACTIVITY } from "@/lib/graphql/mutations";
import { hash } from "bcryptjs";
import { sendCredentialsEmail } from "@/lib/email/emailService";
import { generateId } from "@/lib/db";

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function generatePassword() {
  return `Pass@${randomSuffix(8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    
    // Assume header: Name, Email, Role, Department, Phone, [MentorEmail/ID]
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const dataLines = lines.slice(1);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const line of dataLines) {
      const values = line.split(",").map(v => v.trim());
      if (values.length < 3) continue;

      const userData: any = {};
      header.forEach((h, i) => {
        userData[h] = values[i];
      });

      const { name, email, role, department, phone, mentor_email } = userData;

      if (!name || !email || !role) {
        results.failed++;
        results.errors.push(`Missing required fields for ${email || 'unknown row'}`);
        continue;
      }

      try {
        // Check if user exists
        const existingEmail = await hasuraQuery<{ users: Array<{ id: string }> }>(
          EXISTING_USER_BY_EMAIL,
          { email: email.toLowerCase() }
        );

        if (existingEmail.users.length > 0) {
          results.failed++;
          results.errors.push(`User with email ${email} already exists`);
          continue;
        }

        // Role Restriction (Security)
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'admin') {
          results.failed++;
          results.errors.push(`Security Violation: Admin role assignment blocked for ${email}`);
          continue;
        }

        if (!['intern', 'mentor'].includes(lowerRole)) {
          results.failed++;
          results.errors.push(`Invalid role for ${email}: ${role}. Only intern/mentor allowed.`);
          continue;
        }

        // Handle Mentor Assignment
        let mentorId = null;
        if (lowerRole === 'intern' && mentor_email) {
          const mentorCheck = await hasuraQuery<{ users: Array<{ id: string }> }>(
            EXISTING_USER_BY_EMAIL,
            { email: mentor_email.toLowerCase() }
          );
          if (mentorCheck.users.length > 0) {
            mentorId = mentorCheck.users[0].id;
          }
        }

        // Generate ID
        let id = generateId();
        const plainPassword = generatePassword();
        const hashedPassword = await hash(plainPassword, 10);

        // Map department
        const dept = (department || "AI").toUpperCase();
        const finalDept = DEPARTMENTS.includes(dept) ? dept : "AI";

        // Create User
        if (lowerRole === 'intern') {
            await hasuraMutation(CREATE_INTERN_AND_USER, {
                id,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'intern',
                name,
                department: finalDept,
                phone: phone || "",
                internStatus: 'active',
                startDate: new Date().toISOString().split('T')[0],
                mentorId: mentorId
            });
        } else {
            await hasuraMutation(CREATE_USER, {
                id,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: lowerRole,
                name,
                department: finalDept,
                phone: phone || "",
            });
        }

        // Log Activity
        await hasuraMutation(LOG_ACTIVITY, {
            userId: (session.user as any).id,
            action: `Bulk imported user: ${email}`,
            entityType: 'user',
            entityId: id,
            metadata: { role, email }
        });

        // Send Email
        await sendCredentialsEmail({
          to: email.toLowerCase(),
          credentials: { id, password: plainPassword },
          userInfo: { name, email: email.toLowerCase() },
          userType: role === 'admin' ? 'mentor' : role as 'mentor' | 'intern',
          includeResetLink: true
        });

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Error creating ${email}: ${err.message}`);
      }
    }

    return NextResponse.json({
        message: `Import completed. Success: ${results.success}, Failed: ${results.failed}`,
        results
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
