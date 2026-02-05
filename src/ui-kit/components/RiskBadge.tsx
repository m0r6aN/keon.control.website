'use client';

import React from 'react';
import { RiskLevel } from '@/lib/contracts/common';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskColors: Record<RiskLevel, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${riskColors[level]} ${className}`}
    >
      {level}
    </span>
  );
}

