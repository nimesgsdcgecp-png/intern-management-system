"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { addWarning, addError } from "@/app/lib/redux/slices/notificationSlice";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Edit3, Trash2, PlusCircle, Users, Mail } from "lucide-react";
import { SearchHeader } from "@/app/components/SearchHeader";
import { Select } from "@/app/components/Select";

interface Mentor {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface CredentialNotice {
  role: "mentor";
  name: string;
  email: string;
  id: string;
  password: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE", "SAP", "QC", "PHP", "RPA"];

export default function MentorsPage() {
  const dispatch = useAppDispatch();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentialNotice, setCredentialNotice] = useState<CredentialNotice | null>(null);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "AI",
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const users = await fetch("/api/auth/users");
      if (users.ok) {
        const data = await users.json();
        setMentors(data.filter((u: any) => u.role === "mentor"));
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialNotice(null);

    try {
      const url = editingId ? `/api/mentors/${editingId}` : "/api/auth/users";
      const method = editingId ? "PUT" : "POST";

      const payload = editingId
        ? { ...formData }
        : { ...formData, role: "mentor" };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        dispatch(addError({
          title: "Failed to Save",
          message: err?.error || "Failed to save mentor",
          duration: 5000,
        }));
        return;
      }

      const data = await res.json();
      await fetchMentors();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", email: "", department: "AI" });

      if (!editingId && data?.credentials) {
        setCredentialNotice({
          role: "mentor",
          name: payload.name,
          email: payload.email,
          id: data.credentials.id,
          password: data.credentials.password,
        });

        if (!data?.emailSent && data?.emailError) {
          dispatch(addWarning({
            title: "Email Delivery Failed",
            message: `Failed to send credentials email. Error: ${data.emailError}.`,
            duration: 8000,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to save mentor:", error);
      dispatch(addError({
        title: "Error",
        message: "Failed to save mentor",
        duration: 5000,
      }));
    }
  };

  const handleEdit = (mentor: Mentor) => {
    setFormData({
      name: mentor.name,
      email: mentor.email,
      department: mentor.department || "AI",
    });
    setEditingId(mentor.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const mentor = mentors.find(m => m.id === id);
    if (!confirm(`Permanently delete mentor "${mentor?.name}"?`)) return;

    try {
      const res = await fetch(`/api/mentors/${id}`, { method: "DELETE" });
      if (res.ok) await fetchMentors();
      else {
        dispatch(addError({
          title: "Delete Failed",
          message: "Failed to delete mentor",
          duration: 5000,
        }));
      }
    } catch (error) {
      dispatch(addError({
        title: "Error",
        message: "Error deleting mentor",
        duration: 5000,
      }));
    }
  };

  const filteredMentors = mentors.filter((m) => 
    m.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    m.email.toLowerCase().includes(filters.email.toLowerCase()) &&
    (m.department || "").toLowerCase().includes(filters.department.toLowerCase())
  );

  const copyCredentials = () => {
    if (!credentialNotice) return;
    const text = `Name: ${credentialNotice.name}\nID: ${credentialNotice.id}\nPassword: ${credentialNotice.password}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        <SearchHeader
          title="Mentor Management"
          actions={
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingId(null); }}
              icon={!showForm && <PlusCircle className="w-5 h-5" />}
              className="py-2.5 px-6 shadow-xl"
            >
              {showForm ? "Cancel" : "Add Mentor"}
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 items-end">
            <Input
              label="Search by Name"
              placeholder="Ex: Dr. Smith"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              compact
            />
            <Input
              label="Search by Email"
              placeholder="Ex: smith@mentor.com"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              compact
            />
            <Select
                label="Department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                compact
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
          </div>
        </SearchHeader>

        <div className="space-y-10">
          {credentialNotice && (
            <Card title="Mentor Credentials Generated" className="border-emerald-200 bg-emerald-50/20 shadow-lg animate-in zoom-in-95">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Login ID</p>
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

          {showForm && (
            <Card title={editingId ? "Update Mentor Profile" : "Register New Mentor"} className="border-blue-200 shadow-2xl animate-in slide-in-from-top-4">
              <form onSubmit={handleSubmit} className="p-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Dr. Alice Johnson" />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="alice@university.edu" />
                  <Select label="Department" name="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="px-8">Discard</Button>
                  <Button type="submit" className="px-10 shadow-lg shadow-blue-500/20">{editingId ? "Save Changes" : "Register Mentor"}</Button>
                </div>
              </form>
            </Card>
          )}

          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
                <p className="text-lg font-medium">Fetching mentor directory...</p>
              </div>
          ) : filteredMentors.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 border-gray-200 bg-gray-50/30">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mentor not found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or register a new mentor.</p>
              <Button onClick={() => setShowForm(true)}>Add First Mentor</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden border-gray-200 shadow-xl rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">ID Reference</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Mentor Identity</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Specialization</th>
                      <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest sticky right-0 bg-gray-50/80 backdrop-blur-sm shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] min-w-[300px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMentors.map((mentor) => (
                      <tr key={mentor.id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                        <td className="px-8 py-6">
                          <code className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md" title={mentor.id}>
                            {mentor.id.split("-")[0].toUpperCase()}
                          </code>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">{mentor.name}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {mentor.email || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider">{mentor.department || "General"}</span>
                        </td>
                        <td className="px-8 py-6 sticky right-0 bg-white/60 group-hover:bg-indigo-50/60 backdrop-blur-md shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all">
                          <div className="flex items-center justify-center gap-4">
                            <button onClick={() => handleEdit(mentor)} className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm">
                              <Edit3 className="w-3.5 h-3.5" /> <span>Update</span>
                            </button>
                            <button onClick={() => handleDelete(mentor.id)} className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-xs shadow-sm">
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
