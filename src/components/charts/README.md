# Keon Command Center - Chart Components

HUD-style data visualization components designed for mission-critical cockpit interfaces. Think SpaceX Mission Control meets Bloomberg Terminal.

## Design Philosophy

- **SKELETAL**: Thin lines, dark backgrounds, neon data paths
- **NO FILL**: Area charts only if opacity < 10%
- **MONOSPACE**: All values use JetBrains Mono
- **TACTICAL COLORS**: Reactor Blue, Safety Orange, Ballistic Red

## Color Palette

```typescript
const chartColors = {
  primary: '#66FCF1',    // Reactor Blue
  secondary: '#45A29E',  // Teal
  warning: '#FF6B00',    // Safety Orange
  critical: '#FF2E2E',   // Ballistic Red
  grid: '#384656',       // Tungsten
  text: '#C5C6C7',       // Steel
  flash: '#EAEAEA',      // Flash White
  void: '#0B0C10',       // Void Black
};
```

## Components

### 1. LineChart

Time-series visualization with thin neon lines and optional glow effects.

```typescript
import { LineChart } from '@/components/charts';

<LineChart
  data={[
    { time: '00:00', cpu: 45, memory: 62 },
    { time: '00:05', cpu: 52, memory: 58 },
    { time: '00:10', cpu: 48, memory: 65 },
  ]}
  lines={[
    { dataKey: 'cpu', color: '#66FCF1', name: 'CPU Usage' },
    { dataKey: 'memory', color: '#FF6B00', name: 'Memory' },
  ]}
  xAxisKey="time"
  height={300}
  showGrid={true}
  glowEffect={true}
/>
```

**Props:**
- `data`: Array of data points
- `lines`: Array of line configurations (dataKey, color, name, strokeWidth)
- `xAxisKey`: Key for X-axis values
- `height`: Chart height in pixels (default: 300)
- `showGrid`: Display grid lines (default: true)
- `showLegend`: Display legend (default: false)
- `glowEffect`: Add glow to data points (default: false)

---

### 2. MetricCard

Single-value HUD panel with optional trend indicator and sparkline.

```typescript
import { MetricCard } from '@/components/charts';

<MetricCard
  label="CPU USAGE"
  value={87.5}
  unit="%"
  trend={{ direction: 'up', value: '+5.2%' }}
  sparklineData={[
    { value: 82 },
    { value: 85 },
    { value: 84 },
    { value: 87.5 },
  ]}
  status="warning"
/>
```

**Props:**
- `label`: Metric label (uppercase recommended)
- `value`: Primary value (string or number)
- `unit`: Unit of measurement (optional)
- `trend`: Trend indicator (optional)
  - `direction`: 'up' | 'down' | 'neutral'
  - `value`: Change percentage (optional)
- `sparklineData`: Array of values for mini line chart (optional)
- `status`: 'healthy' | 'warning' | 'critical' | 'none' (affects glow color)

---

### 3. Gauge

Radial arc gauge for percentage or ratio visualization.

```typescript
import { Gauge } from '@/components/charts';

<Gauge
  value={78}
  max={100}
  label="REACTOR CORE"
  unit="TEMP"
  size={180}
  thresholds={{
    warning: 70,
    critical: 90,
  }}
  showPercentage={true}
/>
```

**Props:**
- `value`: Current value
- `max`: Maximum value (default: 100)
- `label`: Gauge label (optional)
- `unit`: Unit of measurement (optional)
- `size`: Gauge diameter in pixels (default: 180)
- `thresholds`: Color change thresholds (optional)
  - `warning`: Warning threshold
  - `critical`: Critical threshold
- `showPercentage`: Display as percentage (default: true)

---

### 4. ActivityFeed

Real-time event stream with auto-scroll and animated new entries.

```typescript
import { ActivityFeed } from '@/components/charts';

<ActivityFeed
  events={[
    {
      id: '1',
      timestamp: new Date(),
      type: 'success',
      title: 'Deployment Complete',
      description: 'Version 2.1.0 deployed to production',
    },
    {
      id: '2',
      timestamp: new Date(),
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Node-3 at 85% capacity',
    },
  ]}
  maxHeight={400}
  autoScroll={true}
  showTimestamp={true}
/>
```

**Props:**
- `events`: Array of activity events
  - `id`: Unique identifier
  - `timestamp`: Date or string
  - `type`: 'info' | 'success' | 'warning' | 'error'
  - `title`: Event title
  - `description`: Event details (optional)
- `maxHeight`: Maximum height in pixels (default: 400)
- `autoScroll`: Auto-scroll on new events (default: true)
- `showTimestamp`: Display timestamps (default: true)

---

### 5. SystemStatus

Grid-based system health monitor with expandable subsystems.

```typescript
import { SystemStatus } from '@/components/charts';

<SystemStatus
  systems={[
    {
      id: 'api',
      name: 'API Gateway',
      status: 'healthy',
      icon: 'server',
      metrics: [
        { label: 'Requests/sec', value: '1,247' },
        { label: 'Avg Latency', value: '45ms' },
        { label: 'Error Rate', value: '0.02%' },
      ],
      lastUpdate: new Date(),
      message: 'All systems nominal',
    },
    {
      id: 'db',
      name: 'Database Cluster',
      status: 'degraded',
      icon: 'database',
      message: 'Replica lag detected',
    },
  ]}
  showMetrics={true}
  pulseActive={true}
/>
```

**Props:**
- `systems`: Array of subsystems
  - `id`: Unique identifier
  - `name`: System name
  - `status`: 'healthy' | 'degraded' | 'critical' | 'offline'
  - `icon`: 'server' | 'cpu' | 'database' | 'network' (optional)
  - `metrics`: Array of key-value metrics (optional)
  - `lastUpdate`: Last update timestamp (optional)
  - `message`: Status message (optional)
- `showMetrics`: Show expandable metrics (default: true)
- `pulseActive`: Animate healthy status LEDs (default: true)

---

### 6. HeatMap

Grid-based heat visualization with color gradients and hover details.

```typescript
import { HeatMap } from '@/components/charts';

<HeatMap
  data={[
    { x: 0, y: 0, value: 23.5, label: 'Node A1' },
    { x: 1, y: 0, value: 45.2, label: 'Node A2' },
    { x: 0, y: 1, value: 67.8, label: 'Node B1' },
    { x: 1, y: 1, value: 89.1, label: 'Node B2' },
  ]}
  xLabels={['Region 1', 'Region 2']}
  yLabels={['Cluster A', 'Cluster B']}
  cellSize={60}
  cellGap={4}
  showValues={true}
  showLabels={true}
  colorScheme="blue-red"
/>
```

**Props:**
- `data`: Array of heat map cells
  - `x`: X coordinate
  - `y`: Y coordinate
  - `value`: Cell value
  - `label`: Cell label (optional)
- `xLabels`: X-axis labels (optional)
- `yLabels`: Y-axis labels (optional)
- `minValue`: Minimum value for color scale (optional, auto-calculated)
- `maxValue`: Maximum value for color scale (optional, auto-calculated)
- `cellSize`: Cell size in pixels (default: 60)
- `cellGap`: Gap between cells in pixels (default: 4)
- `showValues`: Display values in cells (default: true)
- `showLabels`: Display axis labels (default: true)
- `colorScheme`: 'blue-red' | 'green-red' | 'blue-only' (default: 'blue-red')

---

## Dashboard Example

```typescript
import {
  LineChart,
  MetricCard,
  Gauge,
  ActivityFeed,
  SystemStatus,
  HeatMap,
} from '@/components/charts';

export default function CommandCenter() {
  return (
    <div className="grid gap-4 p-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ACTIVE USERS"
          value={1247}
          trend={{ direction: 'up', value: '+12%' }}
          status="healthy"
        />
        <MetricCard
          label="REQUESTS/SEC"
          value={3542}
          trend={{ direction: 'down', value: '-3%' }}
          status="none"
        />
        <MetricCard
          label="ERROR RATE"
          value={0.02}
          unit="%"
          trend={{ direction: 'neutral' }}
          status="healthy"
        />
        <MetricCard
          label="LATENCY"
          value={45}
          unit="ms"
          trend={{ direction: 'up', value: '+8ms' }}
          status="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChart
          data={cpuData}
          lines={[{ dataKey: 'value', color: '#66FCF1' }]}
          xAxisKey="time"
          glowEffect
        />
        <div className="flex items-center justify-center">
          <Gauge value={78} thresholds={{ warning: 70, critical: 90 }} />
        </div>
      </div>

      {/* System Status */}
      <SystemStatus systems={systemData} />

      {/* Activity Feed */}
      <ActivityFeed events={activityData} maxHeight={300} />

      {/* Heat Map */}
      <HeatMap data={heatMapData} colorScheme="blue-red" />
    </div>
  );
}
```

## Font Setup

Add JetBrains Mono to your project:

**tailwind.config.ts:**
```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

**app/layout.tsx:**
```typescript
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});
```

## Dependencies

```bash
npm install recharts lucide-react
```

## Performance Notes

- All components use `'use client'` for Next.js App Router
- Recharts animations are optimized for 60fps
- HeatMap hover effects use CSS transforms for smooth performance
- ActivityFeed auto-scroll is throttled to prevent jank
- All monospace values use `tabular-nums` for alignment

## Mission Success Criteria

- Fast initial renders (< 100ms)
- Smooth animations at 60fps
- Responsive across all viewports
- Accessible keyboard navigation
- Clear visual hierarchy
- Zero layout shift

---

**Deployed by Frontend Combat Specialist**
