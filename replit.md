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
- **Future Plans**: Considering native mobile app wrapper (iOS/Android) while maintaining web compatibility

## Current Issues - Active Development

### June 27, 2025 - Critical Performance & Theme Improvements (COMPLETED)
- **Performance Optimization**: Reduced AI program generation time from 28+ seconds to under 10 seconds by streamlining prompts
- **Theme System Fix**: Enhanced device preference detection with automatic light/dark mode switching
- **Goal Descriptions**: Added detailed programming explanations for each fitness goal (muscle building, strength, etc.)
- **Tailwind Cleanup**: Removed remaining Tailwind classes from body-visualization component, converted to CSS Modules
- **Enhanced UX**: Program builder now shows programming details for each goal selection

### Previous Critical Fixes
- `/api/programs/active/today` endpoint routing conflicts resolved
- Fixed query logic - activeProgram fetches always, enabling todaysWorkout
- Fixed database error with restTime string conversion
- Fixed exercise swap JSON parsing for AI responses

### Recent System Enhancements

### June 26, 2025 - Granular Muscle Targeting System Implementation
- **Comprehensive Muscle Database**: Rebuilt muscle system with 36 detailed muscle groups including:
  - Shoulder subdivisions: anterior delt, medial delt, rear delt, supraspinatus, infraspinatus, teres minor, teres major
  - Chest subdivisions: upper chest, middle chest, lower chest, pectoralis minor
  - Back subdivisions: upper lats, lower lats, rhomboids, middle traps, lower traps, upper traps
  - Granular targeting for arms, legs, and rotator cuff muscles
- **AI-Powered Program Detection**: Smart detection of traditional workout programs (PPL, Bro Split, Upper/Lower, Full Body)
- **Interactive Body Map**: CSS Modules-based body mapping component with three modes:
  - Preferences: Set muscle priorities and growth targets
  - Heat Map: Visualize muscle importance with color-coded intensity
  - Program Builder: Select specific muscles for AI program generation
- **Intelligent Program Generation**: OpenAI GPT-4o integration for:
  - Analyzing muscle selection patterns
  - Detecting optimal training splits
  - Generating targeted exercise programs
  - Recommending muscle-specific exercises
- **User Muscle Preferences**: Database system for tracking:
  - Priority levels (1-10) for each muscle
  - Current satisfaction ratings
  - Growth targets (shrink, maintain, grow, grow significantly)
  - Weekly volume targets
- **Enhanced Database Schema**: Added program type detection fields and muscle preference tracking
- **New Frontend Route**: `/muscle-targeting` page showcasing comprehensive targeting capabilities

## Previous Issues Resolution
1. **Fixed routing conflicts** - `/api/programs/active/today` endpoint properly implemented
2. **Resolved database schema** - Added granular muscle groups and preference tracking
3. **Enhanced AI services** - Muscle-specific program generation and exercise recommendations

## Recent Architecture Changes

### June 25, 2025 - Beta Subscription System Implementation
- **Revenue Model**: Implemented $2.99/month beta subscription for early access
- **Stripe Integration**: Full payment processing with Stripe API for subscriptions
- **Database Schema**: Added subscription fields to users table (stripe_customer_id, subscription_status, etc.)
- **Admin Controls**: Built admin panel for granting free access with tracking and audit logs
- **Access Management**: Smart subscription status checking with multiple access paths:
  - Paid beta subscriptions ($2.99/month)
  - Admin-granted free access (trackable with reasons)
  - Trial periods and grandfathered pricing
- **Frontend Pages**: `/beta-subscription` for signup, `/admin` for access management
- **Webhook Handling**: Stripe webhooks for real-time subscription status updates
- **CSS Modules Styling**: Responsive design matching app's existing design system

### June 24, 2025 - Iframe Authentication & Demo Mode + Mobile App Planning
- Fixed iframe authentication issues for portfolio embedding
- Added `/demo` route with auto-login for demonstration purposes
- Implemented demo banner component for iframe users
- Updated session cookies to support cross-origin embedding (sameSite: 'none' in production)
- Enhanced CORS headers to allow iframe embedding from any domain
- Added iframe detection with fallback to demo mode on login failure
- **Mobile Strategy**: Added Capacitor configuration for future native iOS/Android apps while preserving web compatibility
- **Platform Detection**: Added utilities to detect web vs native app context

### June 23, 2025 - CSS Modules Migration Complete
- Removed ALL Tailwind CSS dependencies from entire project
- All components now use CSS Modules with .module.css files
- Comprehensive light/dark mode support via CSS variables
- Component-scoped styling throughout application
