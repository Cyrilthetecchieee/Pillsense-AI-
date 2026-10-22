import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getStatusBadgeProps(status: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT') {
  switch (status) {
    case 'HIGH':
      return {
        label: 'High Confidence Match',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'MODERATE':
      return {
        label: 'Moderate Confidence Match',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'LOW':
      return {
        label: 'Low Confidence – Inconclusive',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'INSUFFICIENT':
    default:
      return {
        label: 'Unable to Identify Reliably',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
  }
}
