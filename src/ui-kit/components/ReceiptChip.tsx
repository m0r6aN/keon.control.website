'use client';

import React from 'react';

interface ReceiptChipProps {
  receiptId: string;
  className?: string;
}

export function ReceiptChip({ receiptId, className = '' }: ReceiptChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 ${className}`}
    >
      Receipt: {receiptId.slice(0, 8)}...
    </span>
  );
}

