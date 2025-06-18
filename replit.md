# Pocket Coach Fitness Application

## Overview

Pocket Coach is a comprehensive mobile-first fitness tracking application built as a Progressive Web App (PWA). The app provides AI-powered workout analysis, personalized training programs, goal tracking, and detailed progress monitoring. It features a Duolingo-inspired UI design with gamification elements to encourage consistent fitness habits.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Zod validation
- **PWA Features**: Service worker registration and install prompts

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Hot module replacement via Vite in development

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for production bundling
- **Development**: Concurrent development server with Vite middleware
- **Static Assets**: Served from Express in production

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following core entities:
- **Users**: Authentication and streak tracking
- **Goals**: User-defined fitness objectives with progress tracking
- **Workouts**: Workout sessions with AI analysis integration
- **Exercises**: Individual exercise entries within workouts
- **Programs**: AI-generated or predefined training programs
- **Achievements**: Gamification system for user engagement

### AI Integration
- **OpenAI GPT-4**: Powers workout analysis and personalized recommendations
- **Workout Analysis**: Analyzes user workout notes and exercise data
- **Program Generation**: Creates personalized training programs
- **Progress Insights**: Provides AI-driven feedback on user progress

### Mobile-First Design
- **PWA Capabilities**: Installable app with offline support
- **Responsive Design**: Optimized for mobile devices with max-width container
- **Touch-Friendly**: Large touch targets and swipe gestures
- **Bottom Navigation**: Mobile-standard navigation pattern

## Data Flow

1. **User Authentication**: Simple username/password authentication (development setup)
2. **Workout Creation**: Users can create workouts with exercises and notes
3. **AI Analysis**: Completed workouts are analyzed by OpenAI for insights
4. **Progress Tracking**: Historical data is aggregated for progress visualization
5. **Goal Management**: Users can set and track fitness goals
6. **Achievement System**: Automatic achievement detection and notification

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database operations
- **Connection**: Uses DATABASE_URL environment variable

### AI Services
- **OpenAI API**: Requires OPENAI_API_KEY environment variable
- **Model**: GPT-4o for advanced reasoning capabilities

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Recharts**: Data visualization for progress charts

## Deployment Strategy

### Development
- **Local Development**: Uses Vite dev server with Express middleware
- **Hot Reload**: Full-stack hot module replacement
- **Database**: Connects to Neon Database in development

### Production
- **Build Process**: 
  - Frontend built with Vite to `dist/public`
  - Backend bundled with esbuild to `dist/index.js`
- **Deployment Target**: Replit Autoscale
- **Port Configuration**: Express serves on port 5000, mapped to external port 80
- **Static Files**: Express serves built frontend from `dist/public`

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API key for AI features (optional)
- `NODE_ENV`: Environment indicator (development/production)

## User Preferences

Preferred communication style: Simple, everyday language.

## User Preferences

- Communication style: Simple, everyday language
- UI improvements: Show current date on workout creation screen
- Workout naming: AI-generated workout names based on exercises
- Data storage preference: Hybrid approach with offline capabilities

## Recent Changes

- June 18, 2025: Fixed TypeScript compilation errors and date formatting issues
- June 18, 2025: Added current date display on workout creation screen
- June 18, 2025: Implemented AI workout name generation checkbox and backend support
- June 18, 2025: Addressed data storage architecture with security considerations

## Data Storage Architecture Decision

**User Question**: Store workouts locally in IndexedDB and call OpenAI directly from browser?

**Decision**: Hybrid approach for security and functionality:
- **Local Storage**: Use IndexedDB for offline workout logging via service worker
- **API Security**: Keep OpenAI calls server-side to protect API keys and implement rate limiting
- **Sync Strategy**: Store locally when offline, sync to server when online for AI processing
- **PWA Benefits**: Allows gym use without internet while maintaining AI features when connected

## Changelog

- June 18, 2025: Initial setup and core functionality implementation