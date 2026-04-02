import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraQuery } from "@/lib/hasura";
import { GET_INTERN_BY_ID, GET_MENTOR_BY_ID, GET_TASK_BY_ID } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let data;
    switch (type) {
      case "intern":
        data = await hasuraQuery(GET_INTERN_BY_ID, { id });
        return NextResponse.json({ 
          type: "intern",
          data: data?.users_by_pk 
        });
      case "mentor":
        data = await hasuraQuery(GET_MENTOR_BY_ID, { id });
        return NextResponse.json({ 
          type: "mentor",
          data: data?.users_by_pk 
        });
      case "task":
        data = await hasuraQuery(GET_TASK_BY_ID, { id });
        return NextResponse.json({ 
          type: "task",
          data: data?.tasks_by_pk 
        });
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Search Details API Error:", error);
    return NextResponse.json({ error: "Details fetch failed" }, { status: 500 });
  }
}
