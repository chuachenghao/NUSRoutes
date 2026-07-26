# New Features

Notes for the README / write-up. Two features were added on top of the existing
route search, sheltered routing and community reports.

## 1. Announcement & Incident Layer

Admins can post temporary announcements (closures, congestion, general notices).
They show up as pins on the map, and closures actually change the route the app
gives you.

### How it works

An announcement is a point on the map with a title, a type and an optional
expiry time. The type decides what it does:

| Type | Effect on routing |
| --- | --- |
| `closure` | Blocks routing. Paths near it are removed before the shortest path is worked out. |
| `congestion` | None. Shown as an advisory so the user knows to expect heavy foot traffic. |
| `disruption`, `warning`, `info` | None. Map pin only. |

Only closures affect routing. Congestion is deliberately advisory only, because a
crowded path is still walkable, and rerouting everyone away from a crowd just
moves the crowd somewhere else.

### Backend

When a route is requested, the backend loads the announcements that are still
active and not expired, then:

1. Every OSM node within **30m** of a closure is collected into a blocked set
   (`CLOSURE_BLOCK_RADIUS_M` in `routing.service.js`).
2. While the routing graph is built, any edge touching a blocked node is skipped,
   so Dijkstra never sees it.
3. If that leaves no possible route, it runs again with nothing blocked and sets
   `closure_ignored`, so the user gets a usable route with a warning instead of
   an error.
4. Announcements within **150m** of the finished route are returned as
   `closures_nearby` and `congestion_nearby` so the app can explain the detour.

The start and end nodes are never blocked, otherwise posting a closure on top of
somebody's destination would make every route to it fail.

### App

- The Admin tab is behind a passcode, and has a form to post an announcement
  (title, description, type, location, expiry).
- Location is set either by picking a campus place or by using the phone's
  current location.
- Live announcements are listed under the form with a delete button.
- The route summary card shows "Routed around: ..." for closures and
  "Heavy foot traffic near ..." for congestion.

### Files changed

| File | What changed |
| --- | --- |
| `backend/src/db/schema.sql` | Added `congestion` to the announcement type constraint |
| `backend/src/services/routing.service.js` | Closure blocking, fallback retry, nearby announcement lookup |
| `mobile/src/types/announcement.ts` | `AnnouncementType`, `NewAnnouncement` |
| `mobile/src/types/route.ts` | `closures_nearby`, `congestion_nearby`, `closure_ignored` |
| `mobile/src/api/announcementsApi.ts` | `createAnnouncement`, `deleteAnnouncement` |
| `mobile/src/api/routesApi.ts` | Normalising the new route fields |
| `mobile/src/hooks/useAnnouncements.ts` | `addAnnouncement`, `removeAnnouncement`, `refresh` |
| `mobile/src/components/NusMap.tsx` | Purple pin for congestion |
| `mobile/src/components/RouteSummaryCard.tsx` | Closure and congestion notes |
| `mobile/src/app/(tabs)/admin.tsx` | Passcode gate, post form, live announcement list |

## 2. Downloadable User Data (CSV)

The Profile tab has an "Export my data (CSV)" button. It writes the user's
profile, saved places and saved journeys into a CSV file and opens the normal
share sheet, so it can be saved to Files, emailed or sent to Drive.

All of this data lives on the phone in AsyncStorage, not on the server, so the
export is done entirely in the app with no backend involved.

### Format

One file with a `section` column saying what each row is:

```
section,name,type,start,end,created_at
profile,Sean,,,,2026-03-01
place,Central Library,library,,,
journey,,,COM1,UTown,2026-07-20
```

Values containing a comma, quote or newline are wrapped in quotes, and quotes
inside a value are doubled, which is what CSV expects.

### Files changed

| File | What changed |
| --- | --- |
| `mobile/src/utils/csv.ts` | New. Builds the CSV text |
| `mobile/src/app/(tabs)/profile.tsx` | Export button, writes the file and shares it |
| `mobile/app.config.js` | Added the `expo-sharing` plugin |
| `mobile/package.json` | Added `expo-sharing` and `expo-file-system` |

## Setup notes

- Re-run `backend/src/db/schema.sql` against the database so the announcement
  type constraint allows `congestion`.
- `expo-sharing` is a native module, so the dev client needs rebuilding
  (`npx expo run:android` / `run:ios`). A hot reload is not enough.
- The admin passcode is `NUSRoutes123`, set in `mobile/src/app/(tabs)/admin.tsx`.
  It ships inside the app bundle so it is not real security, it only stops
  casual users from posting announcements. The backend announcement endpoints
  are still open.
