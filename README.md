# NUSRoutes

NUSRoutes is a mobile campus navigation application built to help students find practical routes between locations across the National University of Singapore (NUS).

Unlike a standard map application, NUSRoutes is designed around campus-specific needs. It combines NUS venue data with pedestrian route data to provide faster navigation, weather-aware route choices, personalised preferences, saved places, and frequently used journeys.


## Key Features

- **Campus route planning** — Find routes between NUS buildings, facilities, and other campus locations.
- **Multiple starting points** — Match a selected place to suitable nearby route nodes before calculating the journey.
- **Weather-aware navigation** — Adjust route recommendations according to current weather conditions.
- **Personalised routes** — Account for user preferences when selecting a suitable route.
- **Saved places** — Store commonly visited destinations for quicker access.
- **Frequent journeys** — Reuse regular trips without entering the same locations again.
- **Interactive mobile map** — Display locations and route polylines in a React Native interface.
- **Admin dashboard** — Manage and review application data through a dedicated administrative interface.

## Screenshots

<img width="312" height="644" alt="截圖 2026-08-04 07 12 54" src="https://github.com/user-attachments/assets/1d13bbfd-5a61-4c05-b342-8a7107125fc8" />
<img width="310" height="649" alt="截圖 2026-08-04 07 13 02" src="https://github.com/user-attachments/assets/6e178de0-e98a-4486-807c-e4bd580c0e4c" />
<img width="310" height="646" alt="截圖 2026-08-04 07 13 09" src="https://github.com/user-attachments/assets/b181dc43-d331-427c-83e6-d252104d11b1" />


## Why NUSRoutes?

General-purpose map applications do not always represent the details that matter on a university campus. A route that appears shortest may involve an inconvenient building entrance, an unsuitable walking segment, or too much exposure during bad weather.

NUSRoutes models NUS as a route graph and combines that graph with campus location data. This allows the application to generate routes that are more useful within the NUS environment.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Mobile application | React Native, Expo |
| Backend API | Node.js, Express.js |
| Database | PostgreSQL |
| Mapping | React Native Maps |
| Route data | OpenStreetMap-derived data |
| Campus locations | NUS venue data |
| Routing | Graph search using Dijkstra's algorithm and multi-start traversal |


## Getting Started

### Prerequisites

Install the following software:

- Node.js
- npm
- PostgreSQL
- Expo Go or an iOS/Android simulator

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/NUSRoutes.git
cd NUSRoutes
```

### 2. Configure the backend

Navigate to the backend directory and install its dependencies:

```bash
cd <backend-directory>
npm install
```

Create a `.env` file using the environment variables expected by the backend. A typical configuration may include:

```env
PORT=3000
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database>
```

Create the PostgreSQL database, apply the project's schema or migrations, and run the available data-import scripts for campus places and route data.

Start the backend using the script defined in `package.json`, for example:

```bash
npm run dev
```

### 3. Configure the mobile application

From the repository root, navigate to the mobile application directory:

```bash
cd <mobile-directory>
npm install
```

Set the API base URL to the address of the running backend.

Start Expo:

```bash
npx expo start
```

Open the application with Expo Go or a compatible simulator/development build.


## Acknowledgements

- National University of Singapore venue information
- OpenStreetMap contributors for geographic route data

NUSRoutes is an independent student project and is not an official NUS application.

