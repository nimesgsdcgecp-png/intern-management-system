"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Edit3, Trash2, PlusCircle, Users, Mail, GraduationCap, Search, ShieldCheck } from "lucide-react";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { Select } from "@/app/components/ui/Select";
import { Modal } from "@/app/components/ui/Modal";
import { QuickViewModal } from "@/app/components/features/QuickViewModal";
import { BulkActionBar } from "@/app/components/features/BulkActionBar";
import { showToast } from "@/lib/notifications";
import { downloadCSV } from "@/lib/utils/csv-utils";
import Swal from "sweetalert2";

interface Mentor {
  id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
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
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentialNotice, setCredentialNotice] = useState<CredentialNotice | null>(null);
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string, type: 'intern' | 'mentor' | 'task' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    department: "",
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMentors.length && filteredMentors.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMentors.map(m => m.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91 ",
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
      showToast("Could not retrieve mentor database", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Preserve prefix by default
    const digits = value.replace(/\D/g, "");
    let raw = digits;

    // Extract only the 10 local digits
    if (digits.startsWith("91")) {
      raw = digits.slice(2);
    }
    raw = raw.slice(0, 10);

    if (raw.length === 0) return "+91 ";
    if (raw.length <= 5) return `+91 ${raw}`;
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone") {
      // Prevent deletion of prefix
      if (!value.startsWith("+91 ")) {
        newValue = "+91 " + value.replace(/^\+?9?1?\s?/, "");
      }
      newValue = formatPhoneNumber(newValue);
    }

    setFormData({ ...formData, [name]: newValue });
    if (formErrors[name]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";

    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, "");
      const raw = digits.startsWith("91") ? digits.slice(2) : digits;
      if (raw.length !== 10) errors.phone = "Phone must be exactly 10 digits";
    }

    if (!formData.department) errors.department = "Specialization is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Logic: Mentor Onboarding & Update
   * Orchestrates the registration of specialized mentors 
   * and handles credential delivery for secure access.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setCredentialNotice(null);
    setLoading(true);

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
        showToast(err?.error || "Registration failed", "error");
        return;
      }

      const data = await res.json();
      await fetchMentors();
      setIsFormOpen(false);

      showToast(editingId ? "Profile updated successfully" : "Mentor registered successfully", "success");

      setEditingId(null);
      setFormData({ name: "", email: "", phone: "+91 ", department: "AI" });
      setFormErrors({});

      if (!editingId && data?.credentials) {
        setCredentialNotice({
          role: "mentor",
          name: payload.name,
          email: payload.email,
          id: data.credentials.id,
          password: data.credentials.password,
        });
      }
    } catch (error) {
      showToast("Access error: Connection lost", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mentor: Mentor) => {
    setFormData({
      name: mentor.name,
      email: mentor.email,
      phone: formatPhoneNumber(mentor.phone || ""),
      department: mentor.department || "AI",
    });
    setEditingId(mentor.id);
    setIsFormOpen(true);
  };

  /**
   * Logic: Access Revocation
   * Removes mentor administrative privileges and purges 
   * identity records from the active directory.
   */
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Remove Manager Access?",
      text: "This will remove all access for this mentor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, remove",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/mentors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMentors(mentors.filter(m => m.id !== id));
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
        Swal.fire("Removed", "Mentor access has been revoked.", "success");
      } else {
        Swal.fire("Failure", "Could not complete removal.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Connection lost. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Bulk Removal",
      text: `Are you sure you want to remove access for ${selectedIds.length} mentors?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Remove All",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/mentors/${id}`, { method: "DELETE" })));
      setMentors(mentors.filter(m => !selectedIds.includes(m.id)));
      setSelectedIds([]);
      Swal.fire("Success", "All selected accesses revoked.", "success");
    } catch (e) {
      Swal.fire("Partial Failure", "Some access revocations failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((m) =>
    (m.name || "").toLowerCase().includes(filters.name.toLowerCase()) &&
    (m.email || "").toLowerCase().includes(filters.email.toLowerCase()) &&
    (m.department || "").toLowerCase().includes(filters.department.toLowerCase())
  );

  const handleExport = () => {
    const selectedMentors = mentors.filter(m => selectedIds.includes(m.id));
    const exportData = selectedMentors.map(m => ({
      Name: m.name,
      Email: m.email,
      Department: m.department || "N/A",
      Phone: m.phone || "N/A"
    }));
    downloadCSV(exportData, `mentors-export-${new Date().toISOString().split('T')[0]}`);
    Swal.fire("Export Ready", "CSV file generated.", "success");
  };

  const copyCredentials = () => {
    if (!credentialNotice) return;
    const text = `Name: ${credentialNotice.name}\nID: ${credentialNotice.id}\nPassword: ${credentialNotice.password}`;
    navigator.clipboard.writeText(text);
    showToast("Credentials copied to clipboard", "success");
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Modals */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingId ? "Update Mentor Profile" : "Onboard New Mentor"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Dr. Alice Johnson" error={formErrors.name} />
              <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="alice@university.edu" error={formErrors.email} />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 xxxxx xxxxx" error={formErrors.phone} />
              <Select label="Specialization/Department" name="department" value={formData.department} onChange={handleInputChange} required error={formErrors.department}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="px-8">Cancel</Button>
              <Button type="submit" className="px-10 shadow-lg shadow-indigo-200">{editingId ? "Update Profile" : "Register Mentor"}</Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={!!credentialNotice}
          onClose={() => setCredentialNotice(null)}
          title="Account Details"
          size="md"
        >
          {credentialNotice && (
            <div className="space-y-8">
              <div className="p-8 bg-indigo-50/50 rounded-4xl border border-indigo-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                   <ShieldCheck className="w-32 h-32 text-indigo-600" />
                </div>
                <div className="relative z-10">
                   <p className="text-[11px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-8">Access credentials for <span className="text-indigo-600">{credentialNotice.name}</span></p>
                   <div className="space-y-6">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-1">Access ID</label>
                       <div className="bg-white px-6 py-4 rounded-2xl border border-indigo-100 font-mono font-bold text-slate-800 text-xl tracking-widest shadow-sm group-hover:shadow-indigo-100 transition-all">{credentialNotice.id}</div>
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-1">Default Password</label>
                       <div className="bg-white px-6 py-4 rounded-2xl border border-indigo-100 font-mono font-bold text-slate-800 text-xl tracking-widest shadow-sm group-hover:shadow-indigo-100 transition-all">{credentialNotice.password}</div>
                     </div>
                   </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={copyCredentials} 
                  className="w-full bg-slate-900 text-white rounded-2xl py-5 text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all outline-none"
                >
                  Copy Credentials
                </button>
                <button 
                  onClick={() => setCredentialNotice(null)} 
                  className="w-full bg-white text-indigo-600 border border-indigo-100 rounded-2xl py-5 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Manager <span className="text-indigo-600">Directory</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Manage and coordinate your mentoring team.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => { setEditingId(null); setIsFormOpen(true); }}
              icon={<PlusCircle className="w-5 h-5" />}
              className="py-3 px-8 shadow-xl shadow-indigo-200 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[10px]"
            >
              Add Manager
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-4xl p-8 border border-gray-100 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Search Names</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ex: Dr. Smith"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Search</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Ex: smith@mentor.com"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Expertise/Stream</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer outline-none"
              >
                <option value="">All Streams</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
              <p className="text-lg font-medium tracking-tight">Accessing mentor records...</p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <Card className="text-center py-24 border-dashed border-2 bg-slate-50/20 rounded-4xl">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No mentors found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Update your query or register a new facilitator.</p>
              <Button onClick={() => setIsFormOpen(true)}>Add First Mentor</Button>
            </Card>
          ) : (
            <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                      <th className="px-8 py-5 w-20">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                            checked={filteredMentors.length > 0 && selectedIds.length === filteredMentors.length}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Manager Details</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMentors.map((mentor) => (
                      <tr key={mentor.id} className={`group transition-all duration-300 hover:bg-gray-50/30 ${selectedIds.includes(mentor.id) ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                              checked={selectedIds.includes(mentor.id)}
                              onChange={() => toggleSelectRow(mentor.id)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 min-w-[300px]">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
                              {mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight text-base">{mentor.name}</span>
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-indigo-400" />
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter opacity-80">{mentor.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2 w-fit">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {mentor.department || "General"}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(mentor)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 active:scale-95 shadow-sm"
                              title="Edit Manager"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mentor.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100 active:scale-95 shadow-sm"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        isOpen={!!quickViewEntity}
        onClose={() => setQuickViewEntity(null)}
        entityId={quickViewEntity?.id || null}
        entityType={quickViewEntity?.type || null}
        onEdit={(id) => {
          setEditingId(id);
          setIsFormOpen(true);
        }}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onExport={handleExport}
      />
    </DashboardLayout>
  );
}
