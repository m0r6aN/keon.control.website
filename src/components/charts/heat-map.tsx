'use client';

import React, { useState } from 'react';

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

interface HeatMapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
}

interface HeatMapProps {
  data: HeatMapCell[];
  xLabels?: string[];
  yLabels?: string[];
  minValue?: number;
  maxValue?: number;
  cellSize?: number;
  cellGap?: number;
  showValues?: boolean;
  showLabels?: boolean;
  colorScheme?: 'blue-red' | 'green-red' | 'blue-only';
  className?: string;
}

const getColor = (
  value: number,
  min: number,
  max: number,
  scheme: 'blue-red' | 'green-red' | 'blue-only'
): string => {
  const normalized = (value - min) / (max - min);
  const clampedValue = Math.max(0, Math.min(1, normalized));

  if (scheme === 'blue-only') {
    // Blue gradient from dark to bright
    const r = Math.round(102 * clampedValue);
    const g = Math.round(252 * clampedValue);
    const b = Math.round(241 * clampedValue);
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (scheme === 'green-red') {
    // Green to Red gradient
    if (clampedValue < 0.5) {
      // Green to Yellow
      const r = Math.round(102 + (255 - 102) * (clampedValue * 2));
      const g = 252;
      const b = 241 - Math.round(241 * (clampedValue * 2));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Red
      const r = 255;
      const g = Math.round(252 - (252 - 46) * ((clampedValue - 0.5) * 2));
      const b = Math.round((clampedValue - 0.5) * 2 * 46);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // Default: blue-red gradient
  if (clampedValue < 0.5) {
    // Blue to Orange
    const r = Math.round(102 + (255 - 102) * (clampedValue * 2));
    const g = Math.round(252 - (252 - 107) * (clampedValue * 2));
    const b = Math.round(241 * (1 - clampedValue * 2));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Orange to Red
    const r = 255;
    const g = Math.round(107 - (107 - 46) * ((clampedValue - 0.5) * 2));
    const b = Math.round(46 * (1 - (clampedValue - 0.5) * 2));
    return `rgb(${r}, ${g}, ${b})`;
  }
};

export function HeatMap({
  data,
  xLabels = [],
  yLabels = [],
  minValue,
  maxValue,
  cellSize = 60,
  cellGap = 4,
  showValues = true,
  showLabels = true,
  colorScheme = 'blue-red',
  className = '',
}: HeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null);

  // Calculate min/max if not provided
  const values = data.map((cell) => cell.value);
  const min = minValue !== undefined ? minValue : Math.min(...values);
  const max = maxValue !== undefined ? maxValue : Math.max(...values);

  // Get grid dimensions
  const maxX = Math.max(...data.map((cell) => cell.x));
  const maxY = Math.max(...data.map((cell) => cell.y));

  // Create a map for quick lookup
  const cellMap = new Map<string, HeatMapCell>();
  data.forEach((cell) => {
    cellMap.set(`${cell.x}-${cell.y}`, cell);
  });

  const labelOffset = showLabels ? 40 : 0;
  const containerWidth = (maxX + 1) * (cellSize + cellGap) + labelOffset;
  const containerHeight = (maxY + 1) * (cellSize + cellGap) + labelOffset;

  return (
    <div className={`relative ${className}`}>
      <div
        className="overflow-x-auto rounded-lg border bg-[#0B0C10]/50 p-4 backdrop-blur-sm"
        style={{ borderColor: chartColors.grid }}
      >
        <div
          className="relative"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {/* Y-axis labels */}
          {showLabels &&
            yLabels.map((label, index) => (
              <div
                key={`y-label-${index}`}
                className="absolute flex items-center justify-end text-xs"
                style={{
                  top: labelOffset + index * (cellSize + cellGap) + cellSize / 2 - 8,
                  left: 0,
                  width: labelOffset - 8,
                  color: chartColors.text,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {label}
              </div>
            ))}

          {/* X-axis labels */}
          {showLabels &&
            xLabels.map((label, index) => (
              <div
                key={`x-label-${index}`}
                className="absolute text-xs"
                style={{
                  top: 0,
                  left: labelOffset + index * (cellSize + cellGap) + cellSize / 2,
                  transform: 'translateX(-50%)',
                  color: chartColors.text,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {label}
              </div>
            ))}

          {/* Heat map cells */}
          {Array.from({ length: maxY + 1 }, (_, y) =>
            Array.from({ length: maxX + 1 }, (_, x) => {
              const cell = cellMap.get(`${x}-${y}`);
              if (!cell) return null;

              const color = getColor(cell.value, min, max, colorScheme);
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

              return (
                <div
                  key={`cell-${x}-${y}`}
                  className="absolute cursor-pointer transition-all"
                  style={{
                    left: labelOffset + x * (cellSize + cellGap),
                    top: labelOffset + y * (cellSize + cellGap),
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: color,
                    boxShadow: isHovered ? `0 0 12px ${color}` : `0 0 4px ${color}40`,
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    border: `1px solid ${color}80`,
                  }}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {showValues && (
                    <div
                      className="flex h-full w-full items-center justify-center text-xs font-bold tabular-nums"
                      style={{
                        color: cell.value > (min + max) / 2 ? '#000' : chartColors.flash,
                        fontFamily: 'JetBrains Mono, monospace',
                        textShadow:
                          cell.value > (min + max) / 2
                            ? '0 0 2px rgba(255,255,255,0.3)'
                            : '0 0 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {cell.value.toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Hover tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 rounded border bg-[#0B0C10]/95 px-3 py-2 shadow-xl backdrop-blur-sm"
            style={{
              borderColor: chartColors.grid,
              pointerEvents: 'none',
              top: 'var(--mouse-y, 0)',
              left: 'var(--mouse-x, 0)',
              transform: 'translate(10px, 10px)',
            }}
            onMouseMove={(e) => {
              e.currentTarget.style.setProperty('--mouse-x', `${e.clientX}px`);
              e.currentTarget.style.setProperty('--mouse-y', `${e.clientY}px`);
            }}
          >
            <div
              className="text-xs font-medium"
              style={{
                color: chartColors.flash,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {hoveredCell.label || `Cell (${hoveredCell.x}, ${hoveredCell.y})`}
            </div>
            <div
              className="text-sm font-bold tabular-nums"
              style={{
                color: getColor(hoveredCell.value, min, max, colorScheme),
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {hoveredCell.value.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span
          className="text-xs"
          style={{
            color: chartColors.text,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {min.toFixed(1)}
        </span>
        <div
          className="h-4 w-48 rounded"
          style={{
            background: `linear-gradient(to right, ${getColor(
              min,
              min,
              max,
              colorScheme
            )}, ${getColor((min + max) / 2, min, max, colorScheme)}, ${getColor(
              max,
              min,
              max,
              colorScheme
            )})`,
          }}
        />
        <span
          className="text-xs"
          style={{
            color: chartColors.text,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {max.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
