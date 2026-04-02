import { generateId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  GET_ALL_REPORTS,
  GET_INTERN_REPORTS,
  GET_MENTOR_INTERN_IDS,
  GET_MENTOR_REPORTS,
} from "@/lib/graphql/queries";
import { CREATE_REPORT } from "@/lib/graphql/mutations";

/**
 * Handle report submissions and retrieval.
 * Supports GET (list reports) and POST (interns submit new report).
 */

const mapReport = (r: any) => ({
  id: r.id,
  internId: r.intern_id,
  date: r.report_date,
  workDescription: r.work_description,
  hoursWorked: r.hours_worked,
  mentorFeedback: r.mentor_feedback || "",
  submittedAt: r.submitted_at,
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: userId, role: userRole } = session.user as any;
    let reports: any[] = [];

    if (userRole === "admin") {
      const data = await hasuraQuery(GET_ALL_REPORTS, {});
      reports = data.reports;
    } else if (userRole === "mentor") {
      const internData = await hasuraQuery(GET_MENTOR_INTERN_IDS, { mentorId: userId });
      const ids = internData.users.map((i: any) => i.id);
      if (ids.length > 0) {
        const data = await hasuraQuery(GET_MENTOR_REPORTS, { internIds: ids });
        reports = data.reports;
      }
    } else {
      const data = await hasuraQuery(GET_INTERN_REPORTS, { internId: userId });
      reports = data.reports;
    }

    return NextResponse.json(reports.map(mapReport));
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session?.user as any)?.role !== "intern") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const inserted = await hasuraMutation(CREATE_REPORT, {
      id: generateId(),
      internId: (session.user as any).id,
      reportDate: body.date,
      workDescription: body.workDescription,
      hoursWorked: Number(body.hoursWorked || 0),
    });

    return NextResponse.json(mapReport(inserted.insert_reports_one), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
