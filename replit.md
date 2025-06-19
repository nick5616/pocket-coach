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

- June 19, 2025: **COMPLETED** - Comprehensive UX overhaul addressing mobile-first design philosophy
- June 19, 2025: **COMPLETED** - Stream-of-consciousness journal redesign with manual send functionality
- June 19, 2025: **COMPLETED** - Removed timed game feeling from continuous journaling system
- June 19, 2025: **COMPLETED** - Added numbered badge indicator for accumulated thoughts with expandable section
- June 19, 2025: **COMPLETED** - Replaced "End Workout" button with safer "Complete Workout" option
- June 19, 2025: **COMPLETED** - Mobile-first width optimization eliminating unnecessary horizontal spacing
- June 19, 2025: **COMPLETED** - Individual exercise set rows display with compact mobile layout
- June 19, 2025: **COMPLETED** - Streamlined exercise cards with center-aligned tabular data
- June 19, 2025: **COMPLETED** - Dialog optimization for small phone screens (95vw width)
- June 19, 2025: **COMPLETED** - Application ethos documentation emphasizing skill development over convenience
- June 19, 2025: **COMPLETED** - Borderless full-width journal input maximizing screen real estate
- June 19, 2025: **COMPLETED** - Fixed save indicator timing: typing dots immediately, "✓ saved!" after 500ms debounce
- June 19, 2025: **COMPLETED** - Continuous thought batching system with drag-and-drop merge functionality
- June 19, 2025: **COMPLETED** - Corner numeric indicator navigation to bottom thought batches section
- June 19, 2025: **COMPLETED** - Pending thoughts accumulation with manual batch creation and AI sending
- June 19, 2025: **COMPLETED** - Workout journal refinements: removed auto-AI sending, added linear batching progress, fixed input clearing issues
- June 19, 2025: **COMPLETED** - Input validation before AI sending and linear progress bar repositioning underneath input
- June 18, 2025: Real-time debounced journaling system with auto-save (500ms) and AI parsing (5s)
- June 18, 2025: Stream of consciousness write-up feature with automatic regrouping
- June 18, 2025: Linear progress indicators for save and parse operations with checkmark animations
- June 18, 2025: Home page workout resumption for ongoing sessions
- June 18, 2025: Enhanced save status with iMessage-style typing dots and "✓ Saved!" indicator
- June 18, 2025: Input field auto-clear after AI parsing with maintained focus for seamless flow
- June 18, 2025: Exercise editing and deletion functionality with edit/delete buttons
- June 18, 2025: Navigation redesign prioritizing active workout flow over program exploration
- June 18, 2025: Enhanced OpenAI service with sophisticated workout history context
- June 18, 2025: Fixed mobile viewport constraints for toasts and floating elements
- June 18, 2025: Added current date display on workout creation screen
- June 18, 2025: Implemented AI workout name generation checkbox and backend support

## Next Priority Feature

**Interactive Body Heat Map Visualization System (June 18, 2025)**
- **Status**: **IN DEVELOPMENT** - Planned for next development session
- **Scope**: Complete overhaul of Progress tab with 3D human body component
- **Core Features**:
  - Interactive 3D human body model with clickable muscle regions
  - Workout progress heat map overlay showing training intensity per muscle group
  - Dynamic camera system with zoom and rotation for muscle group focus
  - Direct muscle selection for goal setting and program generation
  - AI integration for program creation based on selected muscle targets

### Technical Implementation Details
- **3D Rendering**: SVG-based human anatomy model with detailed muscle group mapping
- **Data Integration**: Exercise-to-muscle-group mapping system for accurate progress visualization
- **Camera Controls**: Smooth zoom/pan animations with predefined muscle group focus positions
- **Heat Map Logic**: Color intensity based on workout frequency, volume, and recency
- **User Interaction**: Touch-friendly muscle selection with visual feedback
- **AI Integration**: Enhanced program generation based on selected muscle targets and current progress data

### Database Schema Extensions Required
- **Muscle Groups**: New table for muscle group definitions and exercise mappings
- **Progress Tracking**: Enhanced exercise data with muscle group associations
- **Goal Integration**: Updated goal system to support muscle-specific targets

### Component Architecture
- **BodyVisualization**: Main 3D body component with muscle region definitions
- **ProgressHeatMap**: Overlay system for visualizing workout data
- **MuscleSelector**: Interactive selection interface for goal setting
- **CameraController**: Animation system for smooth transitions between views

## UI/UX Improvements (June 18, 2025)

**User Feedback**: Text readability issues, unclear navigation, non-cohesive experience

**Solutions Implemented**:
- **Text Contrast**: Upgraded all light text (text-gray-500) to darker variants (text-gray-600/700) for better readability
- **Mobile Constraints**: Fixed toast viewport to respect max-width mobile container
- **Navigation Clarity**: Replaced "Programs" with "Journal" in bottom navigation for direct workout notes access
- **Unified Design**: Simplified quick actions from dual buttons to single prominent "Start New Workout" button
- **Stats Visibility**: Enhanced welcome section stats with stronger contrast (bg-white/30, text-white with font-medium)

## Enhanced AI Context System (June 18, 2025)

**OpenAI Service Improvements**:
- **Historical Context**: Workout analysis now includes last 5 workouts for pattern recognition
- **Sophisticated Prompts**: Added comparative analysis requirements for performance trends
- **Goal Integration**: Enhanced goal progress tracking with current/target value context
- **Recovery Analysis**: AI considers rest time between sessions and muscle groups
- **Progressive Overload**: Recommendations based on performance data patterns

## Data Storage Architecture Decision

**User Question**: Store workouts locally in IndexedDB and call OpenAI directly from browser?

**Decision**: Hybrid approach for security and functionality:
- **Local Storage**: Use IndexedDB for offline workout logging via service worker
- **API Security**: Keep OpenAI calls server-side to protect API keys and implement rate limiting
- **Sync Strategy**: Store locally when offline, sync to server when online for AI processing
- **PWA Benefits**: Allows gym use without internet while maintaining AI features when connected

## Application Ethos

**Core Philosophy**: The application promotes lasting growth in the user's fitness journey, both physically and mentally. This follows the principle of "teaching how to fish rather than giving a fish." Skills are like muscles and need to be trained. AI implementation walks a fine line, since convenience can be the killer of skills, the same way it is the killer of hard-earned muscles, feats of strength, and general athleticism.

## User Experience Philosophy

**Design Principles**:
- **Skill Development**: AI enhances learning rather than replacing user competence
- **Mobile-First**: Optimized for small phone screens with minimal width waste
- **Unified Workflow**: Seamless integration between continuous journaling and exercise entry
- **Clear Navigation**: Direct access to core features without confusion
- **Readable Text**: Sufficient contrast for all text elements
- **Progressive Enhancement**: AI features enhance but don't block core functionality

## Changelog

- June 18, 2025: Major application overhaul for cohesive user experience
- June 18, 2025: Initial setup and core functionality implementation