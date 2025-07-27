# Power Apps Code Apps Setup

## Overview
This DIGS (Digital Investigation and Grievance System) application has been configured to run in the Power Apps Code Apps environment with Office365 Users connectivity.

## Current Configuration

### App Details
- **App ID**: 6c97d515-6288-4ddb-9cc9-10a63982db43
- **Environment**: DIGS-DEV (189e6486-e123-e7a7-b745-314857769903)
- **Power Apps SDK**: @pa-client/power-code-sdk v0.0.2

### Connected Services
- **Office365 Users**: dff6f892df604fbf95784a27a99a71cd
  - Auto-generated strongly-typed services
  - User profile and search functionality
  - Available methods: MyProfile_V2, UserPhoto_V2, SearchUser, etc.

## Development Setup

### Prerequisites
1. Power Platform CLI installed and authenticated
2. Node.js 18+ installed
3. Access to the DIGS-DEV Power Platform environment

### Local Development
1. **Start both servers simultaneously**:
   ```bash
   npm run dev
   ```
   This runs both the Vite dev server (port 3000) and Power Apps proxy (port 8081)

2. **Or start servers individually**:
   ```bash
   # Terminal 1: Start Vite dev server
   npm run dev:vite

   # Terminal 2: Start Power Apps proxy
   npm run dev:powerapi
   ```

### Testing in Power Apps Environment
Once both servers are running, test the app at:
**https://apps.powerapps.com/play/e/189e6486-e123-e7a7-b745-314857769903/a/6c97d515-6288-4ddb-9cc9-10a63982db43?_localAppUrl=http://localhost:3000&_localConnectionUrl=http://localhost:8081/**

## Features
- ✅ React 18 + TypeScript + Vite
- ✅ Power Apps SDK integration
- ✅ Office365 Users connectivity
- ✅ Strongly-typed generated services
- ✅ PowerProvider wrapper component
- ✅ Timeline calculator with date range exclusions
- ✅ Case and grievance management UI
- ✅ Office365Test component for testing connectivity

## Testing Office365 Integration
Navigate to "Tools" → "Office 365 Test" in the sidebar to:
- Load current user profile
- Test user search functionality
- Verify Office365 Users connector is working

## Power Apps Configuration Files
- `power.config.json`: Generated app configuration
- `PowerProvider.tsx`: SDK initialization wrapper
- `Office365UsersService.ts`: Auto-generated service methods
- `Office365UsersModel.ts`: Auto-generated type definitions

## Next Steps
1. Test all Office365 connectivity features
2. Deploy to Power Apps environment
3. Configure additional connectors as needed
4. Set up CI/CD pipeline for Power Apps deployment
