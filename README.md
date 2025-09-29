# FunNet - Math Learning Platform

A Duolingo-inspired math learning app I built to practice full-stack development with real-time features and payment integration.

**[Live Demo](https://funnet-nine.vercel.app/learn)**

## What I Built

This started as a way to learn how modern web apps handle real-time features and user engagement. I wanted to understand how apps like Duolingo keep users motivated, so I built my own version focused on math learning.

### Core Features

- Interactive math lessons (multiple choice, drag-and-drop, text input)
- XP system with level progression
- Real-time leaderboards that update live across users
- Virtual currency system with a shop for learning boosts
- User authentication and progress tracking
- Stripe subscription integration

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS  
**Backend:** Supabase (PostgreSQL), Row Level Security  
**Payments:** Stripe API with webhooks  
**Deployment:** Vercel with automatic deployments  
**Real-time:** Supabase WebSocket subscriptions

## What I Learned

### The Hard Parts

**Race Conditions**: My biggest challenge was getting the XP system to work correctly when multiple users complete lessons simultaneously. I learned about PostgreSQL atomic functions and database-level transactions to prevent users from losing progress.

**Real-Time State Management**: Getting the leaderboards to update live across all users was trickier than expected. I had to figure out WebSocket subscriptions, efficient state updates, and preventing memory leaks. In hindsight, real-time leaderboards aren't sustainable at scale - they should probably update every few minutes instead.

**Payment Integration**: Stripe webhooks were intimidating at first. I learned about idempotency, webhook verification, and handling different subscription states.

## Key Features

### Question Types

I implemented 5 different question types to practice different React patterns:

- Multiple choice with radio buttons
- Text input with validation
- True/false toggle buttons
- Drag-and-drop ordering (this was the trickiest!)
- Click-to-match connections

### Gamification System

- 10 XP per lesson completion
- Level progression with increasing thresholds
- Live leaderboards (global and weekly) - though this needs optimization for scale
- Virtual gem currency earned from XP
- Shop system for purchasing learning boosts

## Database Architecture

The most complex part was designing the database schema. I have 8 main tables with proper foreign key relationships and Row Level Security policies to keep user data isolated. The trickiest part was making sure XP updates and gem purchases are atomic to prevent race conditions.

## Areas for Improvement

- **Basic UX Features**: Missing home page, proper navigation between pages, and logout buttons
- **Frontend Performance**: Currently doing too much client-side rendering, causing slow initial loads
- **Server-Side Optimization**: Many components that should be Server Components are still Client Components
- **Database Query Efficiency**: Some queries are doing unnecessary data fetching instead of targeted selects
- **Real-Time Architecture**: Current WebSocket implementation for leaderboards won't scale - should move to periodic updates
- **Code Organization**: Several components have grown too large and could be better modularized
- **Error Boundaries**: Need better error handling and user feedback for failed operations
- **Mobile UX**: Drag-and-drop interactions don't work well on touch devices yet

## What's Next

**Technical Improvements:**

- Migrate more components to Server Components for better performance
- Implement proper error boundaries and loading states
- Optimize database queries and add query caching
- Refactor large components into smaller, reusable pieces
- Add comprehensive testing coverage

**Feature Additions:**

- Push notifications for learning streaks
- Achievement system with unlockable badges
- Social features like friend leaderboards

---

**Timothy Ho** - [GitHub](https://github.com/timothyho512) | [LinkedIn](https://linkedin.com/in/timothy-ho512)
