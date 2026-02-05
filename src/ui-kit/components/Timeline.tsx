'use client';

import React from 'react';
import { formatDateTime } from '../lib/format';

interface TimelineItem {
  phase: string;
  startedAt?: string;
  endedAt?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {items.map((item, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx < items.length - 1 && (
                <div
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <span className="h-3 w-3 rounded-full bg-white" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center pt-1.5">
                  <p className="text-sm font-medium text-gray-900">{item.phase}</p>
                  {item.startedAt && (
                    <p className="text-xs text-gray-500">
                      Started: {formatDateTime(item.startedAt)}
                    </p>
                  )}
                  {item.endedAt && (
                    <p className="text-xs text-gray-500">
                      Ended: {formatDateTime(item.endedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

