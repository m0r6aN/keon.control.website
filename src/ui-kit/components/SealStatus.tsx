'use client';

import React from 'react';
import { RunStatus } from '@/lib/contracts/common';

interface SealStatusProps {
  status: RunStatus;
  className?: string;
}

const statusColors: Record<RunStatus, string> = {
  QUEUED: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  GATE_REQUIRED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
  SEALED: 'bg-purple-100 text-purple-800',
};

export function SealStatus({ status, className = '' }: SealStatusProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

