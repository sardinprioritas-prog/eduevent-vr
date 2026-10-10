import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export const OperatorAssignmentForm = ({ selectedDates, availableOperators, initialAssignments = [], onAssignmentsChange }) => {
  const [assignments, setAssignments] = useState([]);

  // Sync state dengan selectedDates dari luar
  useEffect(() => {
    setAssignments(prev => {
      // Sumber data: prev jika ada, atau initialAssignments
      const source = (prev && prev.length > 0) ? prev : (initialAssignments || []);
      const newAssignments = selectedDates.map((date, index) => {
        // Coba cari data lama berdasarkan tanggal atau day
        const existing = source.find(a => a.date === date || a.day === index + 1);
        if (existing) {
          return {
            ...existing,
            day: index + 1,
            date: date,
            operators: existing.isFullTeam ? availableOperators.map(op => op.id) : (existing.operators || [])
          };
        }
        // Jika belum ada, buat baru: Hari ke-1 Full Team, sisanya Partial
        return {
          day: index + 1,
          date: date,
          isFullTeam: index === 0,
          operators: index === 0 ? availableOperators.map(op => op.id) : []
        };
      });
      return newAssignments;
    });
  }, [selectedDates, availableOperators]);

  // Informasikan perubahan ke parent setiap ada perubahan di assignments
  useEffect(() => {
    if (assignments.length > 0) {
      onAssignmentsChange(assignments);
    }
  }, [assignments, onAssignmentsChange]);

  const handleTeamTypeChange = (index, isFullTeam) => {
    const newAssignments = [...assignments];
    newAssignments[index].isFullTeam = isFullTeam;
    if (isFullTeam) {
      newAssignments[index].operators = availableOperators.map(op => op.id);
    } else {
      newAssignments[index].operators = [];
    }
    setAssignments(newAssignments);
  };

  const handleOperatorToggle = (index, operatorId) => {
    const newAssignments = [...assignments];
    const currentOps = newAssignments[index].operators;
    
    if (currentOps.includes(operatorId)) {
      newAssignments[index].operators = currentOps.filter(id => id !== operatorId);
    } else {
      newAssignments[index].operators = [...currentOps, operatorId];
    }
    setAssignments(newAssignments);
  };

  if (selectedDates.length === 0) return null;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
        <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Penugasan Tim Operator</h2>
          <p className="text-xs text-slate-500">
            {assignments.length > 1 ? 'Pilih tim yang bertugas untuk setiap hari pelaksanaan kegiatan.' : 'Pilih tim yang bertugas untuk pelaksanaan kegiatan.'}
          </p>
        </div>
      </div>
      
      {assignments.map((assign, index) => (
        <div key={index} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-sky-400">
              {assignments.length > 1 ? `Hari ke-${assign.day} (${assign.date})` : `Penugasan Operator (${assign.date})`}
            </h4>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all">
              <input 
                type="radio" 
                name={`team-type-${assign.date}`}
                checked={assign.isFullTeam}
                onChange={() => handleTeamTypeChange(index, true)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 bg-slate-800 border-slate-700"
              />
              <span className="text-sm text-slate-300">Full Team (Semua Operator)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all">
              <input 
                type="radio" 
                name={`team-type-${assign.date}`}
                checked={!assign.isFullTeam}
                onChange={() => handleTeamTypeChange(index, false)}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 bg-slate-800 border-slate-700"
              />
              <span className="text-sm text-slate-300">Pilih Spesifik (Partial)</span>
            </label>
          </div>

          {!assign.isFullTeam && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800/80">
              {availableOperators.map(op => (
                <label key={op.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      checked={assign.operators.includes(op.id)}
                      onChange={() => handleOperatorToggle(index, op.id)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-800 border-slate-700 transition-all"
                    />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{op.name}</span>
                </label>
              ))}
            </div>
          )}
          
          {!assign.isFullTeam && assign.operators.length === 0 && (
            <p className="text-rose-500 text-xs mt-3 flex items-center gap-1.5">
              ⚠️ Pilih minimal 1 operator untuk bertugas.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
