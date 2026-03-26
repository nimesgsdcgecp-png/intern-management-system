"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Input } from "@/app/components/Input";
import { Select } from "@/app/components/Select";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Users, Mail, Building2 } from "lucide-react";

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

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

export default function MyInternsPage() {
  const { data: session } = useSession();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", department: "" });

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

  const filteredInterns = interns.filter((intern) => {
    return (
      intern.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.department === "" || intern.department === filters.department)
    );
  });

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader title="My Interns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2 items-end">
            <Input
              label="Search by Name"
              placeholder="Ex: John Doe"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              compact
            />
            <Select
                label="Department Filter"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                compact
              >
                <option value="">All Streams</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
          </div>
        </SearchHeader>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
              <p className="text-lg font-medium">Loading interns...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 border-gray-200 bg-gray-50/30">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No interns found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">No interns are currently assigned to you or match your filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterns.map((intern) => (
                <Card key={intern.id} className="hover:shadow-lg transition-all duration-200 border-gray-200">
                  <div className="flex items-start gap-4 p-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{intern.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5" /> {intern.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Department</span>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-100">{intern.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">College</span>
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {intern.collegeName || intern.university || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Duration</span>
                      <span className="text-sm text-gray-600">{intern.startDate} - {intern.endDate || "Present"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        intern.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}>
                        {intern.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
