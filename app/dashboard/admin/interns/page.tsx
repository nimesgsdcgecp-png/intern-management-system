"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addWarning } from "@/app/lib/redux/slices/notificationSlice";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Edit3, Trash2, AlertTriangle, PlusCircle, Users, Mail, GraduationCap, Building2, Calendar } from "lucide-react";
import { SearchHeader } from "@/app/components/SearchHeader";

interface Intern {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  mentorId: string;
  startDate: string;
  status: string;
  collegeName?: string;
  university?: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface CredentialNotice {
  role: "intern";
  name: string;
  email: string;
  id: string;
  password: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

export default function InternsPage() {
  const dispatch = useAppDispatch();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternForm, setShowInternForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [credentialNotice, setCredentialNotice] = useState<CredentialNotice | null>(null);
  const [filters, setFilters] = useState({
    name: "",
    collegeName: "",
    department: "",
    mentorName: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "AI",
    mentorId: "",
    startDate: "",
    collegeName: "",
  });

  useEffect(() => {
    fetchInterns();
    fetchMentors();
  }, []);

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) setInterns(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchMentors = async () => {
    try {
      const usersRes = await fetch("/api/auth/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setMentors(data.filter((u: any) => u.role === "mentor"));
      }
    } catch (e) { console.error(e); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError("");
    setCredentialNotice(null);

    try {
      const url = editingId ? `/api/interns/${editingId}` : "/api/interns";
      const method = editingId ? "PUT" : "POST";
      const payload = { ...formData, university: formData.collegeName };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setPageError(err?.error || "Failed to save intern");
        return;
      }

      const data = await res.json();
      await fetchInterns();
      setShowInternForm(false);
      setEditingId(null);
      setFormData({ name: "", email: "", phone: "", department: "AI", mentorId: "", startDate: "", collegeName: "" });

      if (!editingId && data?.credentials) {
        setCredentialNotice({
          role: "intern",
          name: payload.name,
          email: payload.email,
          id: data.credentials.id,
          password: data.credentials.password,
        });

        if (!data?.emailSent && data?.emailError) {
          dispatch(addWarning({
            title: "Email Delivery Failed",
            message: `Failed to send credentials. Error: ${data.emailError}.`,
            duration: 8000,
          }));
        }
      }
    } catch (error) {
      setPageError("Failed to save intern");
    }
  };

  const handleEdit = (intern: Intern) => {
    setFormData({
      name: intern.name,
      email: intern.email,
      phone: intern.phone || "",
      department: intern.department,
      mentorId: intern.mentorId,
      startDate: intern.startDate,
      collegeName: intern.collegeName || intern.university || "",
    });
    setEditingId(intern.id);
    setShowInternForm(true);
  };

  const handleDelete = async (id: string) => {
    const intern = interns.find(i => i.id === id);
    if (!confirm(`Permanently delete intern "${intern?.name}"?`)) return;

    try {
      const res = await fetch(`/api/interns/${id}`, { method: "DELETE" });
      if (res.ok) await fetchInterns();
    } catch (e) { console.error(e); }
  };

  const getMentorLabel = (mentorId: string) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    return mentor ? mentor.name : "Not assigned";
  };

  const filteredInterns = interns.filter((i) => {
    const mentorLabel = getMentorLabel(i.mentorId).toLowerCase();
    return (
      i.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (i.collegeName || i.university || "").toLowerCase().includes(filters.collegeName.toLowerCase()) &&
      i.department.toLowerCase().includes(filters.department.toLowerCase()) &&
      mentorLabel.includes(filters.mentorName.toLowerCase())
    );
  });

  const copyCredentials = () => {
    if (!credentialNotice) return;
    const text = `Name: ${credentialNotice.name}\nID: ${credentialNotice.id}\nPassword: ${credentialNotice.password}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader
          title="Intern Management"
          actions={
            <div className="flex items-center gap-6">
              <Link href="/dashboard/admin/mentors" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider underline underline-offset-4 decoration-2">
                Mentor Directory
              </Link>
              <Button onClick={() => { setShowInternForm(!showInternForm); setEditingId(null); }} className="py-2.5 px-6 shadow-xl" icon={!showInternForm && <PlusCircle className="w-5 h-5" />}>
                {showInternForm ? "Cancel" : "Add Intern"}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-2">
            <Input label="Search Names" placeholder="Ex: John Doe" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
            <Input label="Search College" placeholder="Ex: MIT Boston" value={filters.collegeName} onChange={(e) => setFilters({ ...filters, collegeName: e.target.value })} />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Department</label>
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                <option value="">All Streams</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Supervisor</label>
              <select value={filters.mentorName} onChange={(e) => setFilters({ ...filters, mentorName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                <option value="">All Mentors</option>
                {mentors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </SearchHeader>

        <div className="space-y-10">
          {pageError && (
             <Card className="border-red-200 bg-red-50/40 animate-in fade-in">
              <p className="text-sm font-medium text-red-700 flex items-center gap-3"><AlertTriangle className="w-5 h-5" /> {pageError}</p>
            </Card>
          )}

          {credentialNotice && (
            <Card title="Portal Credentials Generated" className="border-emerald-200 bg-emerald-50/20 shadow-lg animate-in zoom-in-95">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Intern ID</p>
                    <code className="text-base font-mono font-bold bg-white px-3 py-1 rounded-lg border border-emerald-100">{credentialNotice.id}</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Temporary Password</p>
                    <code className="text-base font-mono font-bold bg-white px-3 py-1 rounded-lg border border-emerald-100">{credentialNotice.password}</code>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={copyCredentials} className="w-full bg-emerald-600 hover:bg-emerald-700 h-10">Copy Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {showInternForm && (
            <Card title={editingId ? "Update Intern Profile" : "Register Candidate"} className="border-blue-200 shadow-2xl animate-in slide-in-from-top-4">
              <form onSubmit={handleSubmit} className="p-2 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@address.com" />
                  <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 123 456 7890" />
                  <Input label="Educational Institution" name="collegeName" value={formData.collegeName} onChange={handleInputChange} required placeholder="College/University Name" />
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Assigned Department</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                  <div className="space-y-2 lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700">Assign Training Mentor</label>
                    <select name="mentorId" value={formData.mentorId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      <option value="">Select a supervisor...</option>
                      {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-100 pt-8">
                  <Button type="button" variant="secondary" onClick={() => setShowInternForm(false)} className="px-8">Discard</Button>
                  <Button type="submit" className="px-10 shadow-lg shadow-blue-500/20">{editingId ? "Apply Changes" : "Confirm Registration"}</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
              <p className="text-lg font-medium tracking-tight">Accessing intern database...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 bg-gray-50/20">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No interns recorded</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Try adjusting your search criteria or register a new candidate.</p>
              <Button onClick={() => setShowInternForm(true)}>Add First Intern</Button>
            </Card>
          ) : (
             <Card className="overflow-hidden border-gray-200 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">ID Reference</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Intern Identity</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Stream</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Placement</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Mentorship</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">State</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest sticky right-0 bg-gray-50/80 backdrop-blur-sm shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] min-w-[300px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInterns.map((intern) => (
                      <tr key={intern.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                        <td className="px-8 py-6">
                           <code className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md" title={intern.id}>
                            {intern.id.split("-")[0].toUpperCase()}
                          </code>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{intern.name}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {intern.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-100">{intern.department}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-gray-700 font-semibold flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {intern.collegeName || intern.university || "N/A"}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Joined {intern.startDate || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                {getMentorLabel(intern.mentorId).charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-gray-600">{getMentorLabel(intern.mentorId)}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            intern.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : 
                            intern.status === "pending" ? "bg-amber-100 text-amber-700 border border-amber-200" : 
                            "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}>
                            {intern.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 sticky right-0 bg-white/60 group-hover:bg-blue-50/60 backdrop-blur-md shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all">
                          <div className="flex items-center justify-center gap-4">
                            <button onClick={() => handleEdit(intern)} className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm">
                              <Edit3 className="w-3.5 h-3.5" /> <span>Update</span>
                            </button>
                            <button onClick={() => handleDelete(intern.id)} className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm">
                              <Trash2 className="w-3.5 h-3.5" /> <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
