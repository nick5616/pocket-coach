# Pocket Coach Fitness Application

## Overview
A comprehensive mobile-first fitness tracking Progressive Web App (PWA) with AI-powered workout analysis, personalized training programs, goal tracking, and detailed progress monitoring.

## Critical Architecture Rules
**⚠️ DO NOT APPEND CHANGELOGS OR LENGTHY UPDATES TO THIS FILE ⚠️**
Keep this document concise and focused on essential project information only.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and caching
- **Styling**: CSS Modules ONLY - NO Tailwind CSS, NO shadcn/ui, NO @radix-ui components
- **Forms**: React Hook Form with Zod validation
- **PWA Features**: Service worker registration and install prompts

### Backend
- **Runtime**: Node.js with Express.js, TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (Neon Database provider)
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Hot module replacement via Vite in development

### Build System
- **Frontend Build**: Vite with React plugin → `dist/public`
- **Backend Build**: esbuild for production bundling → `dist/index.js`
- **Development**: Concurrent development server with Vite middleware

## Database Schema
Core entities: Users, Goals, Workouts, Exercises, Programs, Achievements, MuscleGroups, ExerciseMuscleMapping

## External Dependencies
- **Database**: Neon Database (requires DATABASE_URL environment variable)
- **AI Services**: OpenAI GPT-4o (requires OPENAI_API_KEY environment variable)
- **UI**: Lucide React icons, Recharts for data visualization

## User Preferences
- **Communication Style**: Simple, everyday language (non-technical)
- **Styling System**: CSS Modules ONLY - Complete removal of Tailwind CSS and shadcn/ui
- **UI Improvements**: Show current date on workout creation screen
- **Workout Naming**: AI-generated workout names based on exercises
- **Data Storage**: Hybrid approach with offline capabilities

## Styling Guidelines (MANDATORY)
⚠️ **STRICTLY FORBIDDEN**: 
- Never use Tailwind CSS classes (bg-, text-, flex, etc.)
- Never install or use shadcn/ui components
- Never install or use @radix-ui components
- Never install utility-first CSS frameworks

✅ **APPROVED STYLING APPROACH**:
- CSS Modules only (.module.css files)
- Custom CSS with semantic class names
- CSS custom properties for theming
- Inline styles for dynamic values only
- All CSS modules MUST include both dark and light mode styles using @media (prefers-color-scheme: dark)

## Authentication
Email/password authentication with bcrypt hashing and PostgreSQL session store using connect-pg-simple.

## Key Features
- AI-powered workout analysis and personalized recommendations
- Program-to-workout integration with RPE guidance and exercise progression
- Mobile-first design with PWA capabilities
- Achievement system with gamification elements
- Comprehensive progress tracking and visualization
- Exercise swapping with AI-powered alternatives
- Muscle group mapping and visualization system

## Development Commands
- `npm run dev` - Start development server (both frontend and backend)
- `npm run db:push` - Push schema changes to database (no manual SQL migrations)

## Production Deployment
- Express serves on port 5000, mapped to external port 80
- Static files served from `dist/public`
- Replit Autoscale deployment target

### Desktop Browser Cache Issue - FIXED ✅
**Issue**: Desktop browsers (Chrome, Firefox) showing blank screens with "Unexpected token '<'" errors due to cached asset filenames that no longer exist.

**Root Cause**: Browser cache contains old asset URLs (e.g. `index-CgyiaBAf.js`) but current build has different hashes (e.g. `index-DIztqsJr.js`). When browser requests cached URL, development server returns HTML instead of 404, causing syntax errors.

**Multi-Layer Solution Implemented (July 25, 2025)**:
- ✅ **Client-Side Error Handling**: Global error detection with user-friendly cache clear instructions
- ✅ **Fetch Override**: Prevents HTML responses for expected JS/CSS assets  
- ✅ **Server Cache Control**: No-cache headers for development to prevent future issues
- ✅ **Graceful Error Display**: Shows helpful instructions instead of blank screen
- ✅ **Service Worker 404 Handling**: Proper JSON responses for missing sw.js requests

**User Fix**: Clear browser cache completely and refresh page, or use incognito mode.

**Recent Changes (August 2025)**:
- ✅ **COMPREHENSIVE EFFORT TRACKING SYSTEM (August 13, 2025)**: Implemented user-configurable effort tracking preferences
  - Added EffortTrackingPreference type with three options: RPE (1-10), RIR (reps in reserve), or none
  - Created UserPreferencesProvider context with React Query integration for global state management
  - Built EffortTrackingSettings component with radio button interface in profile page
  - Updated workout journal to conditionally display effort tracking based on user preference:
    * Headers dynamically show "RPE", "RIR", or no effort column
    * Input fields adapt with proper validation ranges (RPE: 1-10, RIR: 0-10+)
    * Display logic shows correct effort values for completed exercises
    * Summary statistics show "Avg RPE" or "Avg RIR" depending on preference
  - Enhanced database schema with RIR column and proper API validation
  - Implemented comprehensive save logic that persists RPE/RIR values to PostgreSQL
  - All preference changes propagate instantly across the entire application
- ✅ **REMOVED AI BUZZWORDS (August 12, 2025)**: Systematically removed all "AI" references from user-facing text
  - Updated program generation pages to focus on personalization and customization benefits
  - Changed "AI-powered" messaging to emphasize actual functionality and user outcomes
  - Maintained technical capabilities while presenting them in terms of user value
  - Enhanced messaging to focus on "we'll analyze" vs "our AI will analyze"
- ✅ **PRODUCTION DEPLOYMENT FIX v2.0 (August 3, 2025)**: Comprehensive solution for asset cache issues
  - Enhanced server-side build integrity verification with explicit asset validation
  - Created robust deployment script with cache-busting (clears npm, Vite, and build caches)
  - Added 404 handling for missing assets with detailed logging and available asset listing
  - Implemented deployment verification endpoint `/api/health` with build metadata
  - Enhanced HTML cache-busting with comprehensive debugging information injection
  - **Root Cause Identified**: Deployment cache conflicts between old asset references and new builds
  - **Solution**: Complete cache clearing + fresh builds + asset validation pipeline
- ✅ **PRODUCTION DEPLOYMENT FIX (August 1, 2025)**: Fixed blank screen and 404 asset errors in production
  - Restructured production static file serving to use `dist/public` directly instead of copying files
  - Added proper MIME type headers and cache control for hashed assets (JS/CSS files)  
  - Implemented cache-busting for HTML files with no-cache headers and timestamp comments
  - Fixed asset path resolution to prevent 404 errors on `/assets/index-[hash].js` files
  - Added comprehensive error handling for missing build files with proper exit codes

**Previous Changes (July 2025)**:
- ✅ **ENHANCED PROGRAM GENERATION FLOW (July 29, 2025)**: Complete overhaul of AI program creation
  - Replaced simple form with intelligent goal analysis that "sees through" surface requests  
  - Added natural language goals input with smart exercise selection (e.g., shoulder development gets all deltoid angles)
  - Implemented human-in-the-loop confirmation page with program preview and modification capability
  - Created dedicated program generation and confirmation pages with improved UX
  - Enhanced OpenAI prompts to analyze true fitness needs vs stated preferences
  - Added program modification API endpoint for iterative refinement
- ✅ Removed service worker references that caused `sw.js` errors
- ✅ Fixed demo text removal from login page  
- ✅ Enhanced production MIME type configuration
- ✅ Improved static file serving for production builds
- ✅ **MAJOR TAILWIND CSS CLEANUP (Jan 15, 2025)**: Systematically removed vestigial Tailwind CSS from entire codebase
  - Created CSS modules for body-visualization, achievement-modal, and progress-simple components
  - Replaced common Tailwind patterns (w-4 h-4, mr-2, text-* colors) with inline styles or CSS modules
  - Fixed mobile scrolling with natural content flow and overscroll prevention
  - Enforced CSS modules-only styling approach throughout application