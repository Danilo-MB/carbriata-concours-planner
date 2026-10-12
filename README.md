# Event Planner — Map & Venue Layout Tool

An interactive web application for planning and laying out outdoors events, automotive concours, festivals, logistics areas, docks, and developments over high-resolution satellite basemaps.

## Features

- **Map Drawing & Layouts:** Draw real-world scaled polygons, lines, and custom points of interest with live dimension and perimeter badges.
- **Dual View Modes:**
  - **Editor Mode:** Draw, edit vertices, change colors and opacities, organize categories, and attach notes & photos.
  - **Visitor Mode:** Clean client-facing view with rich interactive element details, photo galleries, and area information.
- **NestJS Serverless Backend:** Cloud synchronization for projects, categories, and map features with JWT authentication.
- **Offline-First:** Instant local persistence with automatic cloud backup when authenticated.

## Development

```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev

# Build for production (client + serverless backend)
npm run build
```
