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