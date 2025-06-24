# Pocket Coach Fitness Application

## Overview

Mobile-first fitness tracking PWA with AI-powered workout analysis, personalized training programs, and progress monitoring.

## Critical Architecture Constraints

### Styling System - MANDATORY
- **CSS Modules ONLY** - NO Tailwind CSS, NO shadcn/ui components
- **Theme Support**: All components must support light/dark mode via CSS variables
- **Component-scoped styling**: Each component has its own .module.css file

### Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter routing, TanStack Query
- **Backend**: Node.js + Express, PostgreSQL + Drizzle ORM
- **Database**: Neon Database (serverless PostgreSQL)
- **AI Integration**: OpenAI GPT-4 for workout analysis and program generation

## User Preferences - CRITICAL

- **Communication**: Simple, everyday language - user is non-technical
- **Styling System**: CSS Modules ONLY - absolute prohibition on Tailwind CSS or shadcn/ui
- **Theme Support**: ALL components must adapt to light/dark modes
- **Mobile-First**: Optimized for small phone screens with minimal width waste

## Current Issues - Active Development

### Critical Routing Bug (In Progress)
- `/api/programs/active/today` endpoint routing conflicts resolved
- Fixed query logic - activeProgram fetches always, enabling todaysWorkout
- Fixed database error with restTime string conversion
- Fixed exercise swap JSON parsing for AI responses

### Known Problems Still Occurring
1. **Wrong exercises displayed** - Getting burpees/planks instead of Monday's squats/lunges  
2. **Day advancement not working** - Still showing Monday after multiple completed workouts
3. **Programmed exercises not populating** - Despite API fixes, workout journal shows wrong exercises

## Recent Architecture Changes

### June 24, 2025 - Iframe Authentication & Demo Mode
- Fixed iframe authentication issues for portfolio embedding
- Added `/demo` route with auto-login for demonstration purposes
- Implemented demo banner component for iframe users
- Updated session cookies to support cross-origin embedding (sameSite: 'none' in production)
- Enhanced CORS headers to allow iframe embedding from any domain
- Added iframe detection with fallback to demo mode on login failure

### June 23, 2025 - CSS Modules Migration Complete
- Removed ALL Tailwind CSS dependencies from entire project
- All components now use CSS Modules with .module.css files
- Comprehensive light/dark mode support via CSS variables
- Component-scoped styling throughout application
