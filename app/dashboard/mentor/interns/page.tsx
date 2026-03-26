"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";

interface Intern {
  id: string;
  name: string;
  email: string;
  department: string;
  university?: string;
  collegeName?: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function MyInternsPage() {
  const { data: session } = useSession();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const mentorId = (session?.user as any)?.id;
        const res = await fetch("/api/interns");
        if (res.ok) {
          const allInterns = await res.json();
          const myInterns = allInterns.filter((i: any) => i.mentorId === mentorId);
          setInterns(myInterns);
        }
      } catch (error) {
        console.error("Failed to fetch interns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, [session]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Interns</h1>

        {loading ? (
          <p>Loading interns...</p>
        ) : interns.length === 0 ? (
          <Card>
            <p className="text-gray-600">No interns assigned to you yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interns.map((intern) => (
              <Card key={intern.id}>
                <h3 className="text-lg font-bold text-gray-900">{intern.name}</h3>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Email:</strong> {intern.email}
                  </p>
                  <p>
                    <strong>Department:</strong> {intern.department}
                  </p>
                  <p>
                    <strong>College:</strong> {intern.collegeName || intern.university || "N/A"}
                  </p>
                  <p>
                    <strong>Start Date:</strong> {intern.startDate}
                  </p>
                  <p>
                    <strong>End Date:</strong> {intern.endDate}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {intern.status}
                    </span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
