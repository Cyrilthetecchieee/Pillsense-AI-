import React, { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';
import { ScanRecord } from '../types';
import { useScanStore } from '../store/scanStore';
import { useNavigate } from 'react-router-dom';
import { getStatusBadgeProps } from '../utils';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';

export const ScanHistory: React.FC = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { loadSavedScan } = useScanStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const list = await historyService.getScans('guest');
    setScans(list);
  };

  const handleOpenScan = (scan: ScanRecord) => {
    loadSavedScan(scan);
    navigate('/result');
  };

  const handleDelete = async (e: React.MouseEvent, scanId: string) => {
    e.stopPropagation();
    if (confirm('Delete this scan record permanently?')) {
      await historyService.deleteScan('guest', scanId);
      await fetchHistory();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear entire local scan history?')) {
      historyService.clearAll('guest');
      setScans([]);
    }
  };

  const filteredScans = scans.filter((s) => {
    const medName = s.matchedMedicine?.medicineName || 'Inconclusive Specimen';
    return (
      medName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ocr.cleanText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-brand-blue" />
            Scan History
          </h1>
          <p className="text-sm text-slate-500">
            Review previous scans, restore evidence breakdown, or verify pharmacist notes.
          </p>
        </div>
        {scans.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter history by medicine or imprint text..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue shadow-2xs"
        />
      </div>

      {/* Scans Grid */}
      {filteredScans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-card border border-brand-border p-8 max-w-md mx-auto shadow-subtle">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy">No Scan Records Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            New medicine identifications will be automatically recorded here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/detect')}
            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-medium"
          >
            Start a New Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScans.map((scan) => {
            const statusProps = getStatusBadgeProps(scan.overallStatus);
            return (
              <div
                key={scan.id}
                onClick={() => handleOpenScan(scan)}
                className="bg-white rounded-card border border-brand-border p-4 shadow-subtle hover:border-brand-blue cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex gap-3 items-start">
                  {scan.thumbnailDataUrl ? (
                    <img
                      src={scan.thumbnailDataUrl}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                      <HistoryIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h3 className="text-sm font-bold text-brand-navy truncate mt-0.5">
                      {scan.matchedMedicine?.medicineName || 'Inconclusive Specimen'}
                    </h3>
                    <div className="text-xs text-slate-500 truncate">
                      {scan.matchedMedicine?.genericName || 'No verified catalog match'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${statusProps.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusProps.dot}`} />
                    {scan.overallStatus}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-brand-blue group-hover:underline text-[11px] font-semibold flex items-center gap-1">
                      Restore <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
