import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InstitutionDirectoryViewProps {
  onOpenRegister: () => void;
}

export const InstitutionDirectoryView: React.FC<InstitutionDirectoryViewProps> = ({ onOpenRegister }) => {
  const { institutions, students, switchRole, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');

  const filtered = institutions.filter(inst => {
    if (searchQuery.trim()) {
      const matchName = inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCode = inst.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = inst.city.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchName && !matchCode && !matchCity) return false;
    }
    if (selectedState !== 'all' && inst.state !== selectedState) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AICTE Approved Institutions Directory
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
              National Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered technical universities, autonomous colleges, and polytechnics under APAAR mandate
          </p>
        </div>

        <button
          onClick={onOpenRegister}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Campus</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search institution by name, code, or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">State:</span>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All States</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>
      </div>

      {/* Institutions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(inst => {
          const instStudents = students.filter(s => s.institutionId === inst.id);
          const enrolled = instStudents.length;
          const approved = inst.approvedTotalIntake;
          const occupancy = approved > 0 ? (enrolled / approved) * 100 : 0;
          const flagged = instStudents.filter(s => s.validationStatus !== 'valid').length;

          return (
            <div
              key={inst.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {inst.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inst.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}>
                    {inst.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{inst.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inst.city}, {inst.state}</span>
                    <span>·</span>
                    <span>{inst.type}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Approved Intake</span>
                    <span className="font-bold font-mono text-slate-900">{approved} seats</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Actual Enrolled</span>
                    <span className="font-bold font-mono text-teal-800">{enrolled} students</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Quota Occupancy</span>
                    <span className="font-mono font-bold text-slate-800">{occupancy.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${enrolled > approved ? 'bg-rose-600' : 'bg-teal-600'}`}
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {flagged > 0 ? (
                    <span className="text-rose-600 font-semibold">{flagged} Flagged</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">No Flags</span>
                  )}
                </span>

                <button
                  onClick={() => {
                    switchRole('college_admin', inst.id);
                    setActiveTab('dashboard');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Portal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
