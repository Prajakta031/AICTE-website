import React, { useState } from 'react';
import { X, Building2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DepartmentIntake } from '../../types';

interface InstitutionRegistrationModalProps {
  onClose: () => void;
}

export const InstitutionRegistrationModal: React.FC<InstitutionRegistrationModalProps> = ({ onClose }) => {
  const { registerInstitution, switchRole, setActiveTab } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState(`AICTE-1-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'Autonomous Institute' | 'State University' | 'Deemed University' | 'Affiliated College'>('Autonomous Institute');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [establishedYear, setEstablishedYear] = useState(2005);

  const [departments, setDepartments] = useState<DepartmentIntake[]>([
    { department: 'Computer Science & Engineering', approvedIntake: 120 },
    { department: 'Electronics & Communication', approvedIntake: 60 },
    { department: 'Mechanical Engineering', approvedIntake: 60 }
  ]);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptIntake, setNewDeptIntake] = useState(60);

  const totalIntake = departments.reduce((acc, d) => acc + d.approvedIntake, 0);

  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    setDepartments(prev => [...prev, { department: newDeptName.trim(), approvedIntake: Number(newDeptIntake) || 60 }]);
    setNewDeptName('');
    setNewDeptIntake(60);
  };

  const handleRemoveDept = (idx: number) => {
    setDepartments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || departments.length === 0) return;

    const newInst = registerInstitution({
      code,
      name,
      state,
      city: city.trim() || 'Central Campus',
      type,
      approvedTotalIntake: totalIntake,
      establishedYear,
      contactPerson: contactPerson || 'Principal / Academic Head',
      contactEmail: contactEmail || `registrar@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      status: 'Active',
      departments
    });

    // Switch to this new institution as College Admin
    switchRole('college_admin', newInst.id);
    setActiveTab('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New AICTE-Approved Institution</h3>
              <p className="text-xs text-slate-500">Institutional Onboarding & Intake Quota Sanction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name & Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institution Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Indian Institute of Information Technology Pune"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AICTE Approval Reference ID
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution Classification
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Autonomous Institute">Autonomous Institute</option>
                <option value="State University">State University</option>
                <option value="Deemed University">Deemed University</option>
                <option value="Affiliated College">Affiliated College</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Telangana">Telangana</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Punjab">Punjab</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / District <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune, Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department-wise Sanctioned Intake Quotas */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900">
                Approved Department Intake Quotas
              </label>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Total Sanctioned: {totalIntake} Seats
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {departments.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{d.department}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-700 font-bold">{d.approvedIntake} seats</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDept(i)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add department inline */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="New Department (e.g. Chemical Engineering)"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                className="flex-1 text-xs p-2 rounded border border-slate-300 focus:outline-teal-500"
              />
              <input
                type="number"
                placeholder="Seats"
                value={newDeptIntake}
                onChange={e => setNewDeptIntake(Number(e.target.value))}
                className="w-20 text-xs p-2 rounded border border-slate-300 focus:outline-teal-500"
              />
              <button
                type="button"
                onClick={handleAddDept}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registrar / Dean Academics Contact
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. A. P. Joshi"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Institutional Email
              </label>
              <input
                type="email"
                placeholder="registrar@institute.edu.in"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-teal-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Institution Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
