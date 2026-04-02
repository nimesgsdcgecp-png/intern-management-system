import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { DELETE_EVENT } from "@/lib/graphql/mutations";
import { GET_EVENTS } from "@/lib/graphql/queries";

/**
 * Handle individual event deletion.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = session.user as any;
        const role = user.role;
        const { id } = await params;

        if (role === "intern") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch event to check ownership
        const data = await hasuraQuery(GET_EVENTS, { where: { id: { _eq: id } } });
        const event = data?.events?.[0];

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Deletion permissions
        if (role !== "admin" && event.created_by !== user.id) {
            return NextResponse.json({ error: "Forbidden ownership" }, { status: 403 });
        }

        await hasuraMutation(DELETE_EVENT, { id });

        return NextResponse.json({ message: "Event deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
