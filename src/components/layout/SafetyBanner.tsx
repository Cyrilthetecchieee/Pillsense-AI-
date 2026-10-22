import React from 'react';
import { AlertCircle } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 select-none"
    >
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        <strong>Preliminary AI Identification</strong> – Informational aid only. Not a medical device or diagnosis. Always verify medications with a licensed doctor or pharmacist.
      </span>
    </div>
  );
};
