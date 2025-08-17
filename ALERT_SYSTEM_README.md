# Alert System Implementation

## Overview
The alert system provides real-time location-based alerts to users. It includes backend caching for performance and frontend display with horizontal scrolling cards.

## Backend Flow

### 1. Daily Caching System
- **Location**: `backend/src/services/alertService.ts`
- **Cache File**: `backend/cache/daily_alerts.json`
- **Function**: `getCachedAlerts()`

**How it works:**
1. Backend checks if cache needs refresh (once per day)
2. If needed, loads all alerts from Firestore
3. Stores them in `daily_alerts.json` with timestamp
4. Subsequent requests use cached data until next day

### 2. Alert Creation Flow
- **Endpoint**: `POST /api/alerts`
- **Function**: `createAlert()`

**Process:**
1. Validates alert data (title, note, severity, dates, target locations)
2. Adds alert to Firestore
3. If alert is currently active (within startOn/endOn dates), adds to cache
4. Returns alert ID

### 3. Alert Retrieval Flow
- **Endpoint**: `POST /api/alerts/latest`
- **Function**: `getLatestAlert()`

**Process:**
1. Receives user location (suburb, city, town, state, region, country)
2. Gets cached alerts
3. Filters for active alerts (within date range)
4. Matches user location with alert target locations
5. Returns matching alerts

## Frontend Flow

### 1. Alert Hook
- **Location**: `apps/TaraG/hooks/useAlerts.ts`
- **Function**: `useAlerts(userLocation)`

**Features:**
- Fetches alerts based on user location
- Handles loading and error states
- Provides refresh functionality

### 2. Alert Display
- **Home Screen**: `apps/TaraG/app/(tabs)/home.tsx`
- **Alert Cards**: `apps/TaraG/components/AlertCard.tsx`
- **Alert View**: `apps/TaraG/app/account/alert-view.tsx`

**Features:**
- Horizontal scroll view of alert cards
- Clickable cards that navigate to detailed view
- Dynamic styling based on severity level
- Location-based filtering

## API Endpoints

### Create Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "title": "Typhoon Warning",
  "note": "A typhoon is approaching the area...",
  "severity": "high",
  "createdBy": "admin",
  "startOn": "2024-01-01T00:00:00Z",
  "endOn": "2024-01-08T00:00:00Z",
  "target": ["Cebu City", "Mandaue City"]
}
```

### Get Alerts for Location
```http
POST /api/alerts/latest
Content-Type: application/json

{
  "suburb": "Lahug",
  "city": "Cebu City",
  "state": "Cebu",
  "country": "Philippines"
}
```

### Delete Alert
```http
DELETE /api/alerts/{alertId}
```

### Refresh Cache (Admin)
```http
POST /api/alerts/refresh-cache
```

## Alert Data Structure

### Firestore Collection: `alerts`
```typescript
{
  title: string,           // Alert title
  note: string,           // Detailed description
  severity: string,       // "low" | "medium" | "high"
  createdBy: string,      // Creator ID/name
  startOn: timestamp,     // Start date/time
  endOn: timestamp,       // End date/time
  target: string[],       // Array of location names
  createdOn: timestamp    // Creation timestamp
}
```

## Cache Structure

### File: `backend/cache/daily_alerts.json`
```json
{
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "alerts": [
    {
      "id": "alert_id",
      "title": "Alert Title",
      "note": "Alert description",
      "severity": "high",
      "createdBy": "admin",
      "startOn": "2024-01-01T00:00:00Z",
      "endOn": "2024-01-08T00:00:00Z",
      "target": ["Cebu City"],
      "createdOn": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Testing

### Run Test Script
```bash
cd backend
node test-alerts.js
```

### Manual Testing
1. Start backend server: `npm run dev`
2. Create test alert using POST `/api/alerts`
3. Fetch alerts using POST `/api/alerts/latest`
4. Check cache file: `backend/cache/daily_alerts.json`

## Configuration

### Backend URL
- **Location**: `apps/TaraG/constants/Config.ts`
- **Variable**: `BACKEND_URL`

### Cache Settings
- **Refresh**: Once per day
- **Location**: `backend/cache/daily_alerts.json`
- **Auto-cleanup**: No (manual refresh endpoint available)

## Error Handling

### Backend Errors
- Invalid alert data: 400 Bad Request
- Alert not found: 404 Not Found
- Server errors: 500 Internal Server Error

### Frontend Errors
- Network errors: Displayed to user
- No location data: Graceful fallback
- Loading states: Activity indicators

## Performance Considerations

### Caching Benefits
- Reduced Firestore reads
- Faster response times
- Daily refresh prevents stale data

### Location Matching
- Case-insensitive matching
- Multiple location field support
- Efficient array filtering

## Security

### Input Validation
- Required field validation
- Severity level validation
- Date range validation
- Location array validation

### Access Control
- No authentication required for reading alerts
- Admin endpoints for creating/deleting alerts
- Cache refresh endpoint for maintenance
