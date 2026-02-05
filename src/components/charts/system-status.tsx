'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Server, Cpu, Database, Network } from 'lucide-react';

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

type SystemHealth = 'healthy' | 'degraded' | 'critical' | 'offline';

interface SystemMetric {
  label: string;
  value: string;
}

interface Subsystem {
  id: string;
  name: string;
  status: SystemHealth;
  icon?: 'server' | 'cpu' | 'database' | 'network';
  metrics?: SystemMetric[];
  lastUpdate?: string | Date;
  message?: string;
  load?: number; // 0-100, pressure/stress level
}

interface SystemStatusProps {
  systems: Subsystem[];
  showMetrics?: boolean;
  pulseActive?: boolean;
  className?: string;
}

const getStatusColor = (status: SystemHealth): string => {
  switch (status) {
    case 'healthy':
      return chartColors.primary;
    case 'degraded':
      return chartColors.warning;
    case 'critical':
      return chartColors.critical;
    case 'offline':
      return chartColors.grid;
  }
};

const getStatusLabel = (status: SystemHealth): string => {
  switch (status) {
    case 'healthy':
      return 'OPERATIONAL';
    case 'degraded':
      return 'DEGRADED';
    case 'critical':
      return 'CRITICAL';
    case 'offline':
      return 'OFFLINE';
  }
};

const getSystemIcon = (icon?: string) => {
  const iconProps = { className: 'h-4 w-4' };
  switch (icon) {
    case 'server':
      return <Server {...iconProps} />;
    case 'cpu':
      return <Cpu {...iconProps} />;
    case 'database':
      return <Database {...iconProps} />;
    case 'network':
      return <Network {...iconProps} />;
    default:
      return <Server {...iconProps} />;
  }
};

export function SystemStatus({
  systems,
  showMetrics = true,
  pulseActive = true,
  className = '',
}: SystemStatusProps) {
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());

  const toggleSystem = (id: string) => {
    setExpandedSystems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
          className="text-sm font-medium uppercase tracking-wider"
          style={{
            color: chartColors.flash,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          System Status
        </div>
      </div>

      <div className="p-2">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((system) => {
            const isExpanded = expandedSystems.has(system.id);
            const statusColor = getStatusColor(system.status);
            const hasDetails = system.metrics && system.metrics.length > 0;

            return (
              <div
                key={system.id}
                className={`rounded-md border transition-all ${
                  hasDetails ? 'cursor-pointer hover:bg-[#0B0C10]/30' : ''
                }`}
                style={{
                  borderColor: `${statusColor}30`,
                  backgroundColor: `${statusColor}05`,
                }}
                onClick={() => hasDetails && toggleSystem(system.id)}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Status LED */}
                      <div className="relative flex-shrink-0">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: statusColor,
                            boxShadow: `0 0 8px ${statusColor}`,
                          }}
                        />
                        {pulseActive && system.status === 'healthy' && (
                          <div
                            className="absolute inset-0 h-3 w-3 animate-ping rounded-full"
                            style={{
                              backgroundColor: statusColor,
                              opacity: 0.4,
                            }}
                          />
                        )}
                      </div>

                      {/* Icon */}
                      <div style={{ color: statusColor }}>
                        {getSystemIcon(system.icon)}
                      </div>

                      {/* Name */}
                      <div
                        className="text-sm font-medium truncate"
                        style={{
                          color: chartColors.flash,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {system.name}
                      </div>
                    </div>

                    {/* Expand indicator */}
                    {hasDetails && (
                      <div style={{ color: chartColors.text }}>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Label */}
                  <div
                    className="mt-2 text-xs font-medium tabular-nums"
                    style={{
                      color: statusColor,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {getStatusLabel(system.status)}
                  </div>

                  {/* Pressure Indicator - Shows stress before alarms trip */}
                  {system.load !== undefined && (
                    <div className="mt-2 h-0.5 bg-[#1F2833] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${system.load}%`,
                          backgroundColor:
                            system.load > 80 ? chartColors.critical :
                            system.load > 60 ? chartColors.warning :
                            `${statusColor}60`,
                        }}
                      />
                    </div>
                  )}

                  {/* Message */}
                  {system.message && (
                    <div
                      className="mt-1 text-xs"
                      style={{
                        color: chartColors.text,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      {system.message}
                    </div>
                  )}

                  {/* Expanded Metrics */}
                  {isExpanded && showMetrics && system.metrics && (
                    <div
                      className="mt-3 space-y-2 border-t pt-3"
                      style={{ borderColor: `${statusColor}20` }}
                    >
                      {system.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          <span style={{ color: chartColors.text }}>
                            {metric.label}
                          </span>
                          <span
                            className="font-medium tabular-nums"
                            style={{ color: chartColors.flash }}
                          >
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Last Update */}
                  {isExpanded && system.lastUpdate && (
                    <div
                      className="mt-2 text-xs tabular-nums"
                      style={{
                        color: chartColors.text,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      Updated:{' '}
                      {typeof system.lastUpdate === 'string'
                        ? system.lastUpdate
                        : system.lastUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
