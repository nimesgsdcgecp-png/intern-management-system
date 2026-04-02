"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Modal } from "@/app/components/ui/Modal";
import { showToast } from "@/lib/notifications";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Edit3, Trash2, PlusCircle, Users, Mail, GraduationCap, Building2, Calendar, Search } from "lucide-react";
import { SearchHeader } from "@/app/components/features/SearchHeader";
import { Select } from "@/app/components/ui/Select";
import { QuickViewModal } from "@/app/components/features/QuickViewModal";
import { BulkActionBar } from "@/app/components/features/BulkActionBar";
import { downloadCSV } from "@/lib/utils/csv-utils";
import Swal from "sweetalert2";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentialNotice, setCredentialNotice] = useState<CredentialNotice | null>(null);
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string, type: 'intern' | 'mentor' | 'task' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    collegeName: "",
    department: "",
    mentorName: "",
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInterns.length && filteredInterns.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInterns.map(i => i.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+91 ",
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
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch interns", "error");
    } finally { setLoading(false); }
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

    if (!formData.collegeName.trim()) errors.collegeName = "Institution name is required";
    if (!formData.mentorId) errors.mentorId = "Please assign a mentor";
    if (!formData.startDate) errors.startDate = "Start date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Logic: Registration/Update Execution
   * Handles the persistence layer for intern records. 
   * Includes post-registration credential generation for new accounts.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setCredentialNotice(null);
    setLoading(true);

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
        showToast(err?.error || "Operation failed", "error");
        return;
      }

      const data = await res.json();
      await fetchInterns();
      setIsFormOpen(false);

      showToast(editingId ? "Profile updated successfully" : "Intern registered successfully", "success");

      setEditingId(null);
      setFormData({ name: "", email: "", phone: "+91 ", department: "AI", mentorId: "", startDate: "", collegeName: "" });
      setFormErrors({});

      if (!editingId && data?.credentials) {
        setCredentialNotice({
          role: "intern",
          name: payload.name,
          email: payload.email,
          id: data.credentials.id,
          password: data.credentials.password,
        });
      }
    } catch (error) {
      showToast("A communication error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (intern: Intern) => {
    setFormData({
      name: intern.name,
      email: intern.email,
      phone: formatPhoneNumber(intern.phone || ""),
      department: intern.department,
      mentorId: intern.mentorId,
      startDate: intern.startDate,
      collegeName: intern.collegeName || intern.university || "",
    });
    setEditingId(intern.id);
    setIsFormOpen(true);
  };

  /**
   * Logic: Record Neutralization
   * Purges intern data from the system with cascading deletion 
   * for associated logs and reports.
   */
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to remove this intern? All associated records will be purged.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/interns/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInterns(interns.filter(i => i.id !== id));
        if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
        Swal.fire("Deleted!", "The intern record has been successfully purged.", "success");
      } else {
        Swal.fire("Error", "Action denied: System protection active.", "error");
      }
    } catch (e) {
      Swal.fire("Critical Error", "Network failure: Communication with server lost.", "error");
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Bulk Deletion",
      text: `Prepare to purge ${selectedIds.length} intern records. This action is irreversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Execute Purge",
      cancelButtonText: "Abort"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/interns/${id}`, { method: "DELETE" })));
      setInterns(interns.filter(i => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      Swal.fire("Purge Complete", "The selected records have been neutralized.", "success");
    } catch (e) {
      Swal.fire("Error", "Bulk operation encountered interference.", "error");
    } finally {
      setLoading(false);
    }
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

  const handleExport = () => {
    const selectedInterns = interns.filter(i => selectedIds.includes(i.id));
    const exportData = selectedInterns.map(i => ({
      Name: i.name,
      Email: i.email,
      Department: i.department,
      Institution: i.collegeName || i.university || "N/A",
      Mentor: getMentorLabel(i.mentorId),
      StartDate: i.startDate,
      Status: i.status
    }));
    downloadCSV(exportData, `interns-export-${new Date().toISOString().split('T')[0]}`);
    Swal.fire("Export Ready", "CSV file has been generated.", "success");
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
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingId ? "Update Intern Profile" : "Register New Candidate"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" error={formErrors.name} />
              <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="email@address.com" error={formErrors.email} />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 xxxxx xxxxx" error={formErrors.phone} />
              <Input label="Educational Institution" name="collegeName" value={formData.collegeName} onChange={handleInputChange} required placeholder="College/University" error={formErrors.collegeName} />
              <Select label="Assigned Department" name="department" value={formData.department} onChange={handleInputChange} error={formErrors.department}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Input label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} error={formErrors.startDate} />
              <div className="md:col-span-2">
                <Select
                  label="Assign Training Mentor"
                  name="mentorId"
                  value={formData.mentorId}
                  onChange={handleInputChange}
                  error={formErrors.mentorId}
                  disabled={!formData.department}
                >
                  <option value="">{formData.department ? "Select a supervisor..." : "Please select a department first"}</option>
                  {mentors
                    .filter(m => !formData.department || m.department === formData.department)
                    .map(m => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} className="px-8">Cancel</Button>
              <Button type="submit" className="px-10 shadow-lg shadow-indigo-200">{editingId ? "Update Profile" : "Register Candidate"}</Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={!!credentialNotice}
          onClose={() => setCredentialNotice(null)}
          title="Security Credentials Generated"
          size="md"
        >
          {credentialNotice && (
            <div className="space-y-8">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <p className="text-sm text-emerald-800 font-medium mb-6">These credentials have been generated for <span className="font-bold underline">{credentialNotice.name}</span>. Please share them securely.</p>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Portal Identifier</p>
                    <div className="bg-white/50 px-5 py-4 rounded-2xl border border-emerald-200 font-mono font-bold text-slate-800 text-lg tracking-wider shadow-sm">{credentialNotice.id}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">One-Time Password</p>
                    <div className="bg-white/50 px-5 py-4 rounded-2xl border border-emerald-200 font-mono font-bold text-slate-800 text-lg tracking-wider shadow-sm">{credentialNotice.password}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={copyCredentials} className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 font-bold">Copy Credentials</Button>
                <Button variant="secondary" onClick={() => setCredentialNotice(null)} className="w-full py-4 border-slate-200">Close Notice</Button>
              </div>
            </div>
          )}
        </Modal>

        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 text-slate-900">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">
              Intern <span className="text-indigo-600">Directory</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium opacity-80">Manage all registered interns and their placement details.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingId(null); setIsFormOpen(true); }}
              className="py-5 px-12 shadow-2xl shadow-indigo-100 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3"
            >
              <PlusCircle className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        <div className="bg-white rounded-4xl p-10 border border-gray-100 shadow-sm mb-16 group hover:shadow-xl transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform">
            <Search className="w-48 h-48 text-indigo-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Search Identity</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ex: John Doe"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Institution</label>
              <input
                type="text"
                placeholder="Ex: MIT Boston"
                value={filters.collegeName}
                onChange={(e) => setFilters({ ...filters, collegeName: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-200" />
                Search Directory
              </label>
              <div className="relative">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Streams</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Manager</label>
              <div className="relative">
                <select
                  value={filters.mentorName}
                  onChange={(e) => setFilters({ ...filters, mentorName: e.target.value })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Managers</option>
                  {mentors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
              <p className="text-lg font-medium tracking-tight">Accessing intern database...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-24 text-center border border-gray-100 shadow-sm">
              <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No interns recorded</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Try adjusting your search criteria or register a new candidate to get started.</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100"
              >
                Add First Intern
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                      <th className="px-8 py-6">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all bg-white"
                          checked={filteredInterns.length > 0 && selectedIds.length === filteredInterns.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em]">Deploy Unit</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em]">Nexus Placement</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em]">Mentor</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em] text-center">Protocol Stream</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em] text-center">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 tracking-[0.2em] text-right pr-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInterns.map((intern) => (
                      <tr
                        key={intern.id}
                        className={`group transition-all duration-200 hover:bg-gray-50/30 ${selectedIds.includes(intern.id) ? 'bg-indigo-50/30' : ''}`}
                      >
                        <td className="px-8 py-4">
                          <input
                            type="checkbox"
                            className="w-4.5 h-4.5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer transition-all"
                            checked={selectedIds.includes(intern.id)}
                            onChange={() => toggleSelectRow(intern.id)}
                          />
                        </td>

                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm shadow-slate-200">
                              {intern.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{intern.name}</span>
                              <span className="text-xs text-gray-400 font-medium">{intern.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-gray-700">{intern.collegeName || intern.university || "N/A"}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{intern.startDate}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                          {getMentorLabel(intern.mentorId)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {intern.department}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${intern.status === "active" ? "bg-emerald-50 text-emerald-600" :
                            intern.status === "onleave" ? "bg-blue-50 text-blue-600" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                            {intern.status === "active" ? "Active" : intern.status === "onleave" ? "On Leave" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-8 py-4">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => setQuickViewEntity({ id: intern.id, type: 'intern' })}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 active:scale-95"
                              title="Details"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(intern)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-all border border-gray-100 active:scale-95"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(intern.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-gray-100 active:scale-95"
                              title="Delete"
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
