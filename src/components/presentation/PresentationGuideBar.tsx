import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PresentationGuideBar: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const { switchRole, setActiveTab, activeTab, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    {
      id: 1,
      title: 'Step 1: College Login',
      action: () => {
        switchRole('college_admin', 'inst-dtu');
        setActiveTab('overview');
      },
      isActive: currentUser.role === 'college_admin' && activeTab === 'overview'
    },
    {
      id: 2,
      title: 'Step 2: Upload Excel File',
      action: () => {
        switchRole('college_admin', 'inst-dtu');
        setActiveTab('upload');
      },
      isActive: activeTab === 'upload'
    },
    {
      id: 3,
      title: 'Step 3: Check for Errors',
      action: () => {
        setActiveTab('validation');
      },
      isActive: activeTab === 'validation'
    },
    {
      id: 4,
      title: 'Step 4: Find Duplicate IDs',
      action: () => {
        setActiveTab('duplicates');
      },
      isActive: activeTab === 'duplicates'
    },
    {
      id: 5,
      title: 'Step 5: Fix a Record',
      action: () => {
        setActiveTab('students');
      },
      isActive: activeTab === 'students'
    },
    {
      id: 6,
      title: 'Step 6: AICTE National View',
      action: () => {
        switchRole('aicte_admin');
        setActiveTab('overview');
      },
      isActive: currentUser.role === 'aicte_admin' && activeTab === 'overview'
    },
    {
      id: 7,
      title: 'Step 7: Print Report',
      action: () => {
        setActiveTab('reports');
      },
      isActive: activeTab === 'reports'
    }
  ];

  if (!isOpen) {
    return (
      <div className="bg-amber-50 text-slate-800 px-4 py-1.5 flex items-center justify-between text-xs border-b border-amber-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-bold text-slate-900">SIH 2026 Presentation Tour:</span>
          <span className="text-slate-600">Click to expand 7-step evaluation walkthrough</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer bg-amber-100/80 px-2.5 py-0.5 rounded"
        >
          <span>Open Guide</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 text-slate-900 px-4 py-2 border-b border-amber-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/60">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold font-mono text-[10px]">
              SIH JURY TOUR
            </span>
            <span className="text-slate-800 font-bold text-xs">
              Live Demonstration Guide: Click any step below to see the workflow in action:
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-slate-800 p-1 rounded cursor-pointer"
            title="Minimize guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={step.action}
                className={`shrink-0 px-3 py-1 rounded-lg text-left transition-all cursor-pointer text-xs font-semibold ${
                  step.isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-1 ring-amber-500'
                    : 'bg-white hover:bg-amber-100 text-slate-700 hover:text-slate-950 border border-amber-200'
                }`}
              >
                <span>{step.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
