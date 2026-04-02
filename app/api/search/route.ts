import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraQuery } from "@/lib/hasura";
import { GLOBAL_SEARCH } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

    const data = await hasuraQuery(GLOBAL_SEARCH, { query: `%${q}%` });
    
    const results = [
      ...(data?.interns || []).map((i: any) => ({
        id: i.id,
        title: i.profile?.name || i.email,
        type: 'intern',
        subtitle: i.email,
        href: `/dashboard/admin/interns` // In a real app, maybe a specific profile page
      })),
      ...(data?.mentors || []).map((m: any) => ({
        id: m.id,
        title: m.profile?.name || m.email,
        type: 'mentor',
        subtitle: m.email,
        href: `/dashboard/admin/mentors`
      })),
      ...(data?.tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        type: 'task',
        subtitle: `Status: ${t.status}`,
        href: `/dashboard/admin/tasks`
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
