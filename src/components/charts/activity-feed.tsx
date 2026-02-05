'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const chartColors = {
  primary: '#66FCF1',
  secondary: '#45A29E',
  warning: '#FF6B00',
  critical: '#FF2E2E',
  grid: '#384656',
  text: '#C5C6C7',
  flash: '#EAEAEA',
  void: '#0B0C10',
};

type EventType = 'info' | 'success' | 'warning' | 'error';

interface ActivityEvent {
  id: string;
  timestamp: string | Date;
  type: EventType;
  title: string;
  description?: string;
  signer?: string;
  policyRef?: string;
  hashPrefix?: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxHeight?: number;
  autoScroll?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4" />;
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getEventColor = (type: EventType): string => {
  switch (type) {
    case 'info':
      return chartColors.primary;
    case 'success':
      return chartColors.secondary;
    case 'warning':
      return chartColors.warning;
    case 'error':
      return chartColors.critical;
  }
};

const formatTimestamp = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export function ActivityFeed({
  events,
  maxHeight = 400,
  autoScroll = true,
  showTimestamp = true,
  className = '',
}: ActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const prevEventsLength = useRef(events.length);
  const [latestEventIsNew, setLatestEventIsNew] = useState(false);

  useEffect(() => {
    const hasNewEvent = events.length > prevEventsLength.current;
    if (autoScroll && feedRef.current && hasNewEvent) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
    setLatestEventIsNew(hasNewEvent);
    prevEventsLength.current = events.length;
  }, [events.length, autoScroll]);

  return (
    <div
      className={`rounded-lg border bg-[#0B0C10]/50 backdrop-blur-sm ${className}`}
      style={{ borderColor: chartColors.grid }}
    >
      <div
        className="border-b px-4 py-3"
        style={{ borderColor: chartColors.grid }}
      >
        <div
          className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider"
          style={{
            color: chartColors.flash,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <Clock className="h-4 w-4" />
          Activity Feed
        </div>
      </div>

      <div
        ref={feedRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {events.length === 0 ? (
          <div
            className="flex items-center justify-center py-8 text-sm"
            style={{
              color: chartColors.text,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            No recent activity
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: chartColors.grid }}>
            {events.map((event, index) => {
              const color = getEventColor(event.type);
              const isNew = index === events.length - 1 && latestEventIsNew;

              return (
                <div
                  key={event.id}
                  className={`relative px-4 py-3 transition-all duration-300 hover:bg-[#0B0C10]/30 cursor-pointer group ${
                    isNew ? 'animate-in slide-in-from-bottom-2' : ''
                  }`}
                  style={{
                    animation: isNew ? 'slideIn 0.3s ease-out' : 'none',
                    borderLeft: `2px solid ${color}`,
                  }}
                  title={event.signer ? `Signer: ${event.signer} | Policy: ${event.policyRef || 'N/A'} | Hash: ${event.hashPrefix || 'N/A'}` : undefined}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Badge */}
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {getEventIcon(event.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="text-sm font-medium"
                          style={{
                            color: chartColors.flash,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          {event.title}
                        </div>
                        {showTimestamp && (
                          <div
                            className="flex-shrink-0 text-xs tabular-nums"
                            style={{
                              color: chartColors.text,
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                          >
                            {formatTimestamp(event.timestamp)}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <div
                          className="mt-1 text-xs"
                          style={{
                            color: chartColors.text,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          {event.description}
                        </div>
                      )}

                      {/* Provenance Peek - Shows on hover */}
                      {(event.signer || event.policyRef || event.hashPrefix) && (
                        <div
                          className="mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] space-y-0.5"
                          style={{
                            borderColor: `${color}20`,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          {event.signer && (
                            <div style={{ color: chartColors.text }}>
                              <span style={{ color: `${color}80` }}>Signer:</span> {event.signer}
                            </div>
                          )}
                          {event.policyRef && (
                            <div style={{ color: chartColors.text }}>
                              <span style={{ color: `${color}80` }}>Policy:</span> {event.policyRef}
                            </div>
                          )}
                          {event.hashPrefix && (
                            <div style={{ color: chartColors.text }}>
                              <span style={{ color: `${color}80` }}>Hash:</span> {event.hashPrefix}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// CSS animation keyframes - add this to your global styles or use Tailwind config
const styles = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
