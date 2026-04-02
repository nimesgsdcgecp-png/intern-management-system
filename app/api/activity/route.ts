import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraQuery } from "@/lib/hasura";
import { GET_ACTIVITY_LOGS } from "@/lib/graphql/queries";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = (session.user as any).role;
    const department = (session.user as any).department;

    if (role === "intern") {
      return NextResponse.json([]); // Interns don't see the feed
    }

    let data;
    if (role === "admin") {
      data = await hasuraQuery<{ activity_logs: any[] }>(GET_ACTIVITY_LOGS, { limit });
    } else if (role === "mentor" && department) {
      const { GET_ACTIVITY_LOGS_BY_DEPT } = await import("@/lib/graphql/queries");
      data = await hasuraQuery<{ activity_logs: any[] }>(GET_ACTIVITY_LOGS_BY_DEPT, { 
        limit, 
        department 
      });
    } else {
      return NextResponse.json([]); 
    }

    return NextResponse.json(data?.activity_logs || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
