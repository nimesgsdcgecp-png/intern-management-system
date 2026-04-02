"use client";

import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { 
  Building2, Mail, Phone, Calendar, 
  GraduationCap, User, CheckSquare, 
  Clock, AlertCircle, ArrowUpRight,
  Edit3
} from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string | null;
  entityType: 'intern' | 'mentor' | 'task' | null;
  onEdit?: (id: string) => void;
}

export function QuickViewModal({ isOpen, onClose, entityId, entityType, onEdit }: QuickViewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && entityId && entityType) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/search/details?id=${entityId}&type=${entityType}`);
          if (res.ok) {
            const json = await res.json();
            setData(json.data);
          }
        } catch (err) {
          console.error("Quick view details failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, entityId, entityType]);

  const getHref = () => {
    if (entityType === 'intern') return '/dashboard/admin/interns';
    if (entityType === 'mentor') return '/dashboard/admin/mentors';
    if (entityType === 'task') return '/dashboard/admin/tasks';
    return '#';
  };

  const getThemeColor = () => {
    if (entityType === 'intern') return 'indigo';
    if (entityType === 'mentor') return 'purple';
    if (entityType === 'task') return 'fuchsia';
    return 'slate';
  };

  const theme = getThemeColor();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : 'User'} Overview`}
      size="md"
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold dm-text-muted uppercase tracking-widest">Accessing records...</p>
        </div>
      ) : data ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header Info */}
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-3xl bg-${theme}-50 flex items-center justify-center shrink-0 border border-${theme}-100 shadow-sm shadow-${theme}-50`}>
              {entityType === 'intern' ? <User className={`w-10 h-10 text-${theme}-600`} /> :
               entityType === 'mentor' ? <GraduationCap className={`w-10 h-10 text-${theme}-600`} /> :
               <CheckSquare className={`w-10 h-10 text-${theme}-600`} />}
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <h4 className="text-2xl font-black dm-text leading-tight mb-2 truncate">
                {entityType === 'task' ? data.title : data.profile?.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-0.5 rounded-full bg-${theme}-50 text-${theme}-600 text-[10px] font-black uppercase tracking-wider`}>
                  {(data.intern?.status || data.status || 'Active').toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full dm-badge text-[10px] font-bold uppercase tracking-wider">
                  ID: {data.id.split('-')[0]}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px dm-divider" style={{ borderBottom: '1px solid var(--dm-divider)' }} />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-12 px-2">
            <DetailItem 
              icon={<Mail className="w-4 h-4" />} 
              label={entityType === 'task' ? 'Assigned By' : 'Contact Email'} 
              value={entityType === 'task' ? data.assigned_by?.split('-')[0] : data.email} 
            />
            <DetailItem 
              icon={<Building2 className="w-4 h-4" />} 
              label={entityType === 'task' ? 'Priority Tiers' : 'Department/Stream'} 
              value={entityType === 'task' ? (data.priority || 'standard') : (data.profile?.department || 'N/A')} 
            />
            <DetailItem 
              icon={<Calendar className="w-4 h-4" />} 
              label={entityType === 'task' ? 'Publishing Date' : 'Registration Date'} 
              value={entityType === 'task' ? new Date(data.created_at).toLocaleDateString() : (data.intern?.start_date || 'N/A')} 
            />
            <DetailItem 
              icon={<Clock className="w-4 h-4" />} 
              label={entityType === 'task' ? 'Deadline' : 'Target Position'} 
              value={entityType === 'task' ? data.deadline : (entityType === 'intern' ? 'Junior Intern' : 'Senior Mentor')} 
            />
          </div>

          {/* Call to Action */}
          <div className="pt-8 border-t dm-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={getHref()} onClick={onClose}>
                <Button variant="secondary" className="px-6 py-2.5 flex items-center gap-2 group">
                  Go to Management <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              {onEdit && entityId && (
                <Button 
                  onClick={() => {
                    onClose();
                    onEdit(entityId);
                  }}
                  className={`px-6 py-2.5 bg-${theme}-600 hover:bg-${theme}-700 shadow-lg shadow-${theme}-100 flex items-center gap-2`}
                >
                  <Edit3 className="w-4 h-4" /> Edit Details
                </Button>
              )}
            </div>
            <Button onClick={onClose} variant="ghost" className="dm-text-muted font-bold uppercase tracking-widest text-[10px]">Close Peeking</Button>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 dm-text-muted mx-auto" />
          <p className="text-sm font-bold dm-text-muted">Unable to retrieve detailed records at this time.</p>
        </div>
      )}
    </Modal>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 dm-text-muted">
        <span className="opacity-75">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-sm font-extrabold dm-text-secondary truncate">{value}</p>
    </div>
  );
}
