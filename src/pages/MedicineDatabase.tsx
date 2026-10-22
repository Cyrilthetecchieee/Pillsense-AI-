import React, { useState, useEffect } from 'react';
import { medicineService } from '../services/medicineService';
import { MedicineRecord } from '../types';
import {
  Database,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const MedicineDatabase: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<MedicineRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'reviewed'>('all');

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    const list = await medicineService.getAllMedicines();
    setMedicines(list);
  };

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.imprint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : m.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-blue" />
            Verified Reference Database
          </h1>
          <p className="text-sm text-slate-500">
            Curated clinical references from openFDA and DailyMed labels. No AI hallucination source.
          </p>
        </div>
        <div className="text-xs bg-blue-50 text-brand-blue border border-blue-200 px-3 py-1.5 rounded-xl font-semibold">
          {medicines.length} Formulations Cataloged
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine name, generic ingredient, or imprint (e.g. TYLENOL 500, M 500)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue shadow-2xs"
          />
        </div>
        <div className="sm:col-span-4 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-brand-blue shadow-2xs"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Pharmacist Verified</option>
            <option value="reviewed">Clinically Reviewed</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table / Cards List */}
        <div className="lg:col-span-8 bg-white rounded-card border border-brand-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Medicine & Generic</th>
                  <th className="py-3 px-4">Imprint</th>
                  <th className="py-3 px-4">Strength / Form</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      selectedMed?.id === med.id ? 'bg-blue-50/80 font-medium' : ''
                    }`}
                    onClick={() => setSelectedMed(med)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-brand-navy">{med.medicineName}</div>
                      <div className="text-[11px] text-slate-500">{med.genericName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {med.imprint}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {med.strength} ({med.dosageForm})
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          med.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {med.verificationStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMed(med);
                        }}
                        className="text-brand-blue hover:underline font-semibold text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-card border border-brand-border p-5 shadow-subtle space-y-4 sticky top-20">
          {selectedMed ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Selected Formulation</div>
                <h3 className="text-base font-bold text-brand-navy mt-0.5">{selectedMed.medicineName}</h3>
                <div className="text-xs text-slate-500">{selectedMed.manufacturer}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Description:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{selectedMed.description}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block">Indications:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                    {selectedMed.commonUses.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Warnings:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-rose-800">
                    {selectedMed.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>Source: {selectedMed.source}</span>
                  <a
                    href={selectedMed.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-blue hover:underline inline-flex items-center gap-1"
                  >
                    DailyMed Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs">Select any medicine to view detailed clinical specifications.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
