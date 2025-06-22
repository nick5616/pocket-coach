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
- **CSS Modules**: Component-scoped styling system
- **Lucide React**: Icon library
- **Recharts**: Data visualization for progress charts
- **Custom Components**: Built with CSS Modules (no external UI libraries)

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

- Communication style: Simple, everyday language
- UI improvements: Show current date on workout creation screen
- Workout naming: AI-generated workout names based on exercises
- Data storage preference: Hybrid approach with offline capabilities
- Resume workout button: Truncate workout name with ellipsis at 350px width
- **Styling System**: CSS Modules only - NO Tailwind CSS or shadcn/ui components
- **Architecture Decision**: Complete removal of Tailwind CSS in favor of component-scoped CSS Modules

## Recent Changes

- June 22, 2025: **COMPLETED** - Fixed Viewport Height Issue by Removing PWA Status Bar
  - Removed 2rem PWA status bar from App.tsx that prevented pages from extending to full viewport
  - Pages now properly utilize complete viewport height with no artificial spacing at top
  - Enhanced user experience with full-screen page layout for mobile-first design
- June 22, 2025: **COMPLETED** - Complete Tailwind CSS Removal from Home Page
  - Converted entire home.tsx from Tailwind CSS to CSS Modules architecture
  - Created comprehensive home.module.css with proper light/dark mode theming
  - Maintained all existing functionality while eliminating Tailwind dependencies
  - Fixed hardcoded progress insights displaying fake workout data for users with no workouts
  - Enhanced styling consistency with component-scoped CSS approach
  - All home page elements now use authentic user data without placeholder content
- June 22, 2025: **COMPLETED** - Enhanced Home Page Button States and Program-Specific Workout Pages
  - Implemented context-aware home page buttons based on program status
  - Added "You do not appear to be in a program" state with numbered buttons for users without active programs
  - Created program-specific workout flow with coaching insights and pre-workout briefings
  - Added /workouts/program/:programId route with comprehensive workout preparation page
  - Implemented backend API endpoint for enhanced program workout data with AI coaching insights
  - Created ProgramWorkout component with difficulty ratings, focus areas, challenge previews, and encouragement
  - Users with active programs see "Begin: [workout name]" instead of generic workout naming
  - Enhanced button hierarchy: program workouts → freestyle workouts → view programs
  - Fixed hardcoded progress insights - now generates dynamic AI recommendations based on user's actual workout history
  - Today's stats now calculate real exercise counts, workout duration, and session data from user's workouts
- June 22, 2025: **COMPLETED** - Full Viewport Height Optimization Across All Pages
  - Fixed viewport height issues across entire application for proper mobile display
  - Updated App.tsx main container to use h-screen with flexbox layout for full viewport utilization
  - Modified landing page to properly extend to full viewport height within app container
  - Updated home page structure with flex-1 overflow-auto for proper scrolling behavior
  - Enhanced page layout consistency with flex-shrink-0 headers and flexible content areas
  - All pages now properly fill available viewport space without height gaps
- June 22, 2025: **COMPLETED** - Replit Auth Integration with OpenID Connect Authentication System
  - Implemented complete Replit Auth system using OpenID Connect for secure user authentication
  - Updated database schema from integer to string user IDs for compatibility with Replit Auth
  - Created sessions table for secure session storage with PostgreSQL backend
  - Added authentication middleware and protected route system throughout application
  - Updated client-side authentication hooks and components for proper login/logout flow
  - Created landing page for unauthenticated users with direct login integration
  - Modified App.tsx router to handle authentication states and redirect users appropriately
  - Removed obsolete username/password authentication system in favor of Replit's secure OAuth
  - All user data operations now use string-based user IDs from Replit's authentication claims
  - Added comprehensive error handling for unauthorized access with proper user feedback
- June 22, 2025: **COMPLETED** - Enhanced Styling Consistency, Theme Support, and User Experience Improvements
  - Fixed section header size inconsistency - both "Programmed Exercises" and "Completed Exercises" now use same title styling
  - Standardized horizontal spacing across page sections using consistent CSS Modules section padding (1.5rem 1rem)
  - Added comprehensive blue border system for visual consistency across all components
  - Programmed exercise cards: White/dark gray backgrounds with blue borders (#3b82f6 light, #60a5fa dark)
  - Completed exercise cards: White/dark gray backgrounds with blue borders for visual distinction
  - Muscle group badges: Enhanced with blue borders matching card styling system
  - Added comprehensive light/dark mode support for all exercise cards with proper theme-dependent colors
  - Converted completed exercise cards to dedicated CSS Modules components with proper theming
  - Applied consistent styling structure: header, stats, and actions sections with proper spacing
  - Enhanced text contrast and readability across both light and dark modes for all exercise card elements
  - Replaced browser confirmation dialog with proper app-based confirmation modal for exercise deletion
  - Added DialogDescription component for accessibility compliance in delete confirmation modal
  - Delete confirmation modal features proper red styling and loading states for better user feedback
  - Updated action button layout to 2x2 grid with darker secondary variant colors (#64748b light, #475569 dark)
  - Removed hover effects from action buttons for consistent appearance across interactions
  - Enhanced Card Spacing and CSS Modules Migration in Workout Journal
  - Added consistent 1rem margin spacing between both programmed and completed exercise cards
  - Converted all exercise cards from mixed Tailwind/inline styles to clean CSS Modules architecture
  - Replaced space-y-6 and space-y-3 containers with dedicated CSS classes for uniform spacing
  - Applied programmedExerciseCard and completedExerciseCard classes with identical 1rem bottom margins
  - Converted exercise notes div component at line 698 from Tailwind CSS to CSS Modules architecture
  - Added exerciseNotesContainer, exerciseNotesLabel, exerciseNotesText CSS classes with proper theme support
  - Converted div component at line 520 from Tailwind CSS to CSS Modules architecture
  - Added exerciseStatsContainer, exerciseStatsText, exerciseStatsTextSkipped CSS classes with proper light/dark mode support  
  - Applied theme-dependent colors: blue tones in light mode (#1d4ed8), lighter blue in dark mode (#93c5fd)
  - Maintained consistent skipped state styling with gray colors across themes
- June 22, 2025: **COMPLETED** - Complete Tailwind CSS Removal and Enhanced UI Spacing
  - Completely removed Tailwind CSS from project and converted to CSS Modules architecture
  - Enhanced exercise card spacing with 2rem gaps and increased padding (1.25rem)
  - Improved dark mode theming with proper text contrast ratios
  - Added comprehensive CSS Modules with proper light/dark mode support
  - Cards now have proper breathing room with enhanced visual hierarchy
- June 22, 2025: **COMPLETED** - Fixed Critical App Startup Issues
  - Resolved JavaScript initialization error in WorkoutJournal component (variable hoisting)
  - Created missing exercise-swap service file for AI-powered exercise alternatives
  - Added DialogDescription component for accessibility compliance
  - Fixed PostgreSQL database query type issues and null checks
  - App successfully running with all major features functional
- June 22, 2025: **COMPLETED** - Implemented Consistent Muscle Group System with Database/AI Integration
  - Created intelligent muscle group detection service that checks database first, then uses AI to populate missing mappings
  - Added /api/exercises/:exerciseName/muscle-groups endpoint for consistent muscle group retrieval
  - Implemented ExerciseMuscleGroups component for unified muscle group display across all exercise interactions
  - Fixed inconsistency where "squats" showed different muscle groups in programmed vs completed sections
  - System automatically stores AI-generated muscle group mappings in database for all users, ensuring consistency
  - Enhanced exact completion handler to include proper muscle group data from database/AI system
- June 22, 2025: **COMPLETED** - Optimized Programmed Exercises Layout and Space Utilization
  - Redesigned exercise cards with compact inline layout using space-between distribution for stats
  - Combined sets and reps into single line (e.g., "3 sets × 12 reps") to reduce vertical space
  - Replaced 2x2 button grid with inline 4-button row using flex layout and flex-1 for equal spacing
  - Reduced card padding from p-4 to p-3 for tighter spacing
  - Shortened button text ("Modified" → "Edit") while maintaining clear action intent
  - Removed unused dropdown menu system and cleaned up LSP errors
- June 21, 2025: **COMPLETED** - Enhanced Active Workout Page with Programmed Exercises Section
  - Created structured workout page layout: workout name → programmed exercises → workout input → completed exercises
  - Added programmed exercises section with recommended exercises showing sets, reps, RPE in blue cards
  - Implemented clickable exercise cards that populate text input with exercise details (RPE left empty)
  - Added action dropdown menu with 4 options per exercise: "I did this exactly", "I did this, but...", "Swap", "Skip"
  - Each action button pre-fills text input with contextually appropriate text for guided workout logging
  - Demo exercises (Push-ups, Squats, Pull-ups) display when no program exercises available
- June 21, 2025: **COMPLETED** - Enhanced Exercise Display and Achievement System Fixes
  - Fixed resume workout navigation bug by correcting URL parameter extraction from workoutId to id
  - Enhanced exercise display with comprehensive stats grid showing sets, reps, weight, and RPE
  - Added workout volume calculation with gem icon in header for total work measurement
  - Improved exercise cards with muscle group badges and detailed volume calculations per exercise
  - Fixed achievement system redundant text issue - changed from duplicate "Workout Complete!" to clean "Great Work!" title
  - Fixed achievement API error by correcting column name from 'viewed' to 'isViewed' in database operations
  - Cleaned up achievement modal button text from redundant "Awesome!" to actionable "Continue"
- June 21, 2025: **COMPLETED** - Program Flow Logic Implementation
  - Fixed resume workout functionality to properly handle existing workouts vs program-based workouts
  - Added /api/programs/active/today endpoint for fetching scheduled program workouts
  - Implemented proper program flow: (1) Resume existing workouts directly, (2) Start from active program if available, (3) Start ad-hoc workout
  - Enhanced home page UI with dual action buttons for program and ad-hoc workout flows
  - Workout journal now correctly differentiates between resuming existing workouts and starting new ones
- June 21, 2025: **COMPLETED** - AI Workout Naming and Navigation Fix
  - Fixed critical navigation bug in workout creation flow using proper wouter setLocation
  - Completed AI workout naming backend integration with generateWorkoutName function
  - Enhanced spacing and visual hierarchy throughout CSS Modules components
  - Improved button padding (0.75rem 1.5rem) and card spacing with proper margins
  - Navigation now properly redirects to workout session after successful creation
- June 21, 2025: **COMPLETED** - Complete Tailwind CSS to CSS Modules Migration
  - Removed all Tailwind dependencies and configuration files
  - Created comprehensive CSS Modules system with proper contrast ratios
  - Implemented native Button, Card, Badge, Progress, Input, and Textarea components
  - Ensured proper dark mode support and accessibility compliance (WCAG standards)
  - Converted bottom navigation and core components to CSS Modules
  - Fixed React useRef errors and component import conflicts
  - Application running successfully with improved text readability
- June 20, 2025: **COMPLETED** - Program-to-Workout Integration
  - Implemented proper program activation flow with automatic deactivation of other programs
  - Added API endpoint to get today's workout from active program (`/api/programs/:id/today`)
  - Modified workout creation to pre-load exercises from active program schedules
  - Enhanced workout journal UI to show program context and planned exercises
  - Fixed "Start Workout" button to integrate with active programs and load structured workouts
  - Programs now provide RPE guidance, sets/reps targets, and exercise progression
- June 20, 2025: **COMPLETED** - PostgreSQL Database Integration
  - Migrated from in-memory storage (MemStorage) to PostgreSQL database (DatabaseStorage)
  - Created comprehensive database schema with proper relationships using Drizzle ORM
  - Implemented full CRUD operations for all entities (users, workouts, exercises, goals, etc.)
  - Successfully deployed database tables and initialized with muscle groups and demo data
  - Application now persists data across restarts with full database functionality
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
- June 20, 2025: **COMPLETED** - Real-time batch display above input with immediate visibility and send button integration
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