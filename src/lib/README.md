# Keon Command Center - Utility Library

High-assurance utility library for the Keon Command Center dashboard.

## Files

### `utils.ts`
Core utilities for the application.

- **`cn(...inputs)`** - Tailwind CSS class merging utility

```typescript
import { cn } from "@/lib"

<div className={cn("px-4 py-2", isActive && "bg-blue-500")} />
```

### `format.ts`
Data formatting utilities for consistent display.

- **`formatTimestamp(date)`** - ISO 8601 with milliseconds
- **`formatHash(hash, length?)`** - Truncate hashes with ellipsis
- **`formatNumber(num)`** - Locale-aware number formatting
- **`formatDuration(ms)`** - Human-readable durations (e.g., "5s", "1m 30s")
- **`formatBytes(bytes)`** - File sizes with binary prefixes (KiB, MiB, etc.)

```typescript
import { formatTimestamp, formatHash, formatDuration } from "@/lib"

formatTimestamp(new Date()) // "2025-01-04T14:30:45.123Z"
formatHash("a1b2c3d4e5f6g7h8") // "a1b2c3d4..."
formatDuration(65000) // "1m 5s"
```

### `keyboard.ts`
Keyboard navigation hooks and constants.

- **`KEYS`** - Keyboard key constants
- **`useKeyboardNavigation(options)`** - J/K vim-style list navigation
- **`useCommandPalette(options)`** - Cmd+K / Ctrl+K command palette trigger

```typescript
import { useKeyboardNavigation, useCommandPalette, KEYS } from "@/lib"

// List navigation
const [selectedIndex, setSelectedIndex] = useKeyboardNavigation({
  itemCount: items.length,
  onSelect: (index) => handleSelect(items[index]),
  enabled: isOpen,
})

// Command palette
useCommandPalette({
  onOpen: () => setCommandPaletteOpen(true),
  enabled: !commandPaletteOpen,
})
```

### `types.ts`
Shared type definitions for the Keon system.

**Enums:**
- `SystemStatus` - System health states
- `DecisionOutcome` - Authorization decisions
- `ExecutionState` - Execution lifecycle
- `SeverityLevel` - Alert/event severity

**Interfaces:**
- `MetricValue` - Dashboard metrics
- `Receipt` - Authorization receipts
- `Execution` - Execution traces
- `TimeSeriesPoint` - Chart data
- `Alert` - System alerts
- `AuditLogEntry` - Audit logs

```typescript
import type { Receipt, Execution, SystemStatus } from "@/lib"

const receipt: Receipt = {
  id: "rcpt_123",
  hash: "a1b2c3d4...",
  timestamp: new Date(),
  decision: "approved",
  authority: "key-001",
  scope: "/api/deploy",
}
```

### `index.ts`
Barrel export for convenient imports.

```typescript
// Import everything from one place
import {
  cn,
  formatTimestamp,
  formatHash,
  useKeyboardNavigation,
  KEYS,
  type Receipt,
  type Execution,
} from "@/lib"
```

## Type Safety

All utilities are built with strict TypeScript:
- Full type inference
- Comprehensive JSDoc documentation
- Runtime type guards for enums
- No implicit `any` types

## Usage Example

```typescript
"use client"

import {
  cn,
  formatTimestamp,
  formatHash,
  useKeyboardNavigation,
  type Receipt,
  type SystemStatus,
} from "@/lib"

export function ReceiptList({ receipts }: { receipts: Receipt[] }) {
  const [selectedIndex, setSelectedIndex] = useKeyboardNavigation({
    itemCount: receipts.length,
    onSelect: (index) => console.log("Selected:", receipts[index]),
  })

  return (
    <div className="space-y-2">
      {receipts.map((receipt, index) => (
        <div
          key={receipt.id}
          className={cn(
            "p-4 border rounded",
            index === selectedIndex && "bg-blue-50 border-blue-500"
          )}
        >
          <div className="font-mono text-sm">
            {formatHash(receipt.hash)}
          </div>
          <div className="text-xs text-gray-500">
            {formatTimestamp(receipt.timestamp)}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Testing

All utilities include comprehensive type definitions and can be tested with standard testing frameworks:

```typescript
import { formatDuration, formatBytes } from "@/lib/format"

describe("formatDuration", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms")
    expect(formatDuration(5000)).toBe("5s")
    expect(formatDuration(65000)).toBe("1m 5s")
  })
})
```
