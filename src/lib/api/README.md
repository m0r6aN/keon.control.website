# KEON Control API Client

Team Alpha's API substrate for KEON Control.

## Overview

This directory contains the complete API client infrastructure for communicating with the KEON Control backend.

## Features

- **Typed API Clients**: Full TypeScript types for all endpoints
- **Error Handling**: Centralized error handling with specific error types
- **Correlation ID Support**: Automatic request correlation for tracing
- **Timeout Management**: Configurable request timeouts
- **Mock Fallback**: Automatic fallback to mock data when API is unavailable
- **Live/Mock Mode Toggle**: Environment-based mode switching

## Directory Structure

```
api/
├── client.ts          # Base HTTP client with error handling
├── config.ts          # API configuration and environment vars
├── errors.ts          # Error types and parsing
├── types.ts           # TypeScript types for API contracts
├── receipts.ts        # Receipts API client
├── executions.ts      # Executions API client
├── traces.ts          # Observability/Traces API client
├── alerts.ts          # Alerts API client (stub)
├── policies.ts        # Policies API client (stub)
├── tenants.ts         # Tenants API client (stub)
└── index.ts           # Barrel exports
```

## Usage

### Basic API Call

```typescript
import { listReceipts } from '@/lib/api';

const receipts = await listReceipts({
  correlationId: 'abc-123',
  tenantId: 'tenant-1',
  limit: 50
});
```

### Using the useApi Hook (Recommended)

```typescript
import { useApi } from '@/lib/state';
import { listReceipts } from '@/lib/api';
import { mockReceipts } from '@/lib/mock-data';

function MyComponent() {
  const { data, isLoading, error, isUsingMock } = useApi({
    fetcher: () => listReceipts({ correlationId: 'abc-123' }),
    mockData: { items: mockReceipts, nextPageToken: null },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isUsingMock && <div>⚠️ Using mock data</div>}
      {data?.items.map(item => <div key={item.receiptId}>{item.receiptId}</div>)}
    </div>
  );
}
```

## Configuration

Set environment variables in `.env.local`:

```bash
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Request Timeout (ms)
NEXT_PUBLIC_API_TIMEOUT=10000

# Use mock fallback on API errors
NEXT_PUBLIC_API_USE_MOCK_FALLBACK=true

# Enable live mode (true = real API, false = mock data)
NEXT_PUBLIC_API_LIVE_MODE=false
```

## API Endpoints

### ✅ Implemented (Backend Ready)

- **Receipts**
  - `GET /governance/receipts` - List receipts
  - `GET /governance/receipts/{id}` - Get receipt by ID

- **Executions**
  - `GET /runtime/executions` - List executions
  - `GET /runtime/executions/{id}` - Get execution by ID
  - `GET /runtime/executions/{id}/trace` - Get execution trace

- **Traces/Observability**
  - `GET /observability/spines/{correlationId}` - Get receipt spine
  - `GET /observability/correlations` - List correlations

### 🚧 Stub (Backend Not Ready)

- **Alerts** - Will throw error until backend implements
- **Policies** - Will throw error until backend implements
- **Tenants** - Will throw error until backend implements

## Error Handling

The API client provides typed errors:

```typescript
import { ApiError, NetworkError, NotFoundError } from '@/lib/api';

try {
  const receipt = await getReceipt({ receiptId: 'xyz', correlationId: 'abc' });
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Receipt not found');
  } else if (error instanceof NetworkError) {
    console.log('Network issue - check backend');
  } else if (error instanceof ApiError) {
    console.log('API error:', error.statusCode, error.message);
  }
}
```

## For Team Bravo and Charlie

When building features:

1. **Import from `@/lib/api`** for all API calls
2. **Use `useApi` hook** from `@/lib/state` for automatic mock fallback
3. **Check `isUsingMock`** in the UI to show indicators
4. **Provide mock data** for development without backend
5. **Request new endpoints** by opening an issue with Team Alpha

## Adding New Endpoints

1. Add types to `types.ts`
2. Create new client file (e.g., `my-feature.ts`)
3. Export from `index.ts`
4. Update this README

## Testing

Test with backend:
```bash
# Start backend API
cd src/Keon.Control.API
dotnet run

# In another terminal, start frontend in live mode
cd src/Keon.Control.Website
NEXT_PUBLIC_API_LIVE_MODE=true npm run dev
```

Test with mocks:
```bash
# Frontend only, uses mock data
cd src/Keon.Control.Website
npm run dev
```

## Support

Questions? Contact Team Alpha or check:
- API client code: `src/lib/api/`
- State management: `src/lib/state/`
- Mock data: `src/lib/mock-data.ts`
