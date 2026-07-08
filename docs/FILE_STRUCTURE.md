# EPX Platform - File Structure Documentation

## Overview
This document provides a comprehensive overview of the EPX (Engineering Preparation eXperience) platform file structure.

## Directory Structure

```
cm/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel pages
│   │   ├── layout.tsx           # Admin layout with authentication
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── questions/           # Question management
│   │   │   └── page.tsx         # CRUD operations for questions
│   │   ├── pyq/                 # Previous Year Questions management
│   │   │   └── page.tsx         # PYQ CRUD operations
│   │   └── test-builder/        # Custom test creation
│   │       └── page.tsx         # Test builder interface
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin-only APIs
│   │   │   ├── questions/       # Question CRUD
│   │   │   │   ├── route.ts     # GET/POST questions
│   │   │   │   ├── [id]/        # PUT/DELETE questions
│   │   │   │   │   └── route.ts
│   │   │   │   └── bulk-upload/ # CSV/JSON bulk upload
│   │   │   │       └── route.ts
│   │   │   ├── pyq/             # PYQ CRUD
│   │   │   │   └── route.ts
│   │   │   ├── tests/           # Test CRUD
│   │   │   │   └── route.ts
│   │   │   └── analytics/       # Admin analytics
│   │   │       └── route.ts
│   │   ├── ai/                  # AI-powered features
│   │   │   ├── recommendations/ # AI study recommendations
│   │   │   │   └── route.ts
│   │   │   ├── weak-topics/    # AI weak topic analysis
│   │   │   │   └── route.ts
│   │   │   ├── study-plan/      # AI study plan generation
│   │   │   │   └── route.ts
│   │   │   ├── mentor/          # AI mentor chat
│   │   │   │   └── route.ts
│   │   │   └── rank-prediction/ # AI rank prediction
│   │   │       └── route.ts
│   │   ├── attempts/            # Test attempt operations
│   │   │   └── route.ts
│   │   ├── analytics/           # User analytics
│   │   │   └── route.ts
│   │   ├── auth/                # Authentication
│   │   │   └── [...nextauth]/   # NextAuth configuration
│   │   │       └── route.ts
│   │   ├── results/             # Results operations
│   │   │   └── [id]/            # Get specific result
│   │   │       └── route.ts
│   │   ├── tests/               # Test operations
│   │   │   ├── route.ts         # List all tests
│   │   │   ├── generate/        # AI test generation
│   │   │   │   └── route.ts
│   │   │   └── [id]/            # Test-specific operations
│   │   │       └── questions/   # Get test questions
│   │   │           └── route.ts
│   │   └── users/               # User operations
│   │       └── route.ts
│   ├── analytics/               # Analytics dashboard
│   │   └── page.tsx             # User analytics with charts
│   ├── help/                    # Help/support page
│   │   └── page.tsx
│   ├── login/                   # Login page
│   │   └── page.tsx
│   ├── mentor/                  # AI mentor chat interface
│   │   └── page.tsx
│   ├── profile/                 # User profile
│   │   └── page.tsx
│   ├── register/                # Registration page
│   │   └── page.tsx
│   ├── results/                 # Results page
│   │   └── page.tsx
│   ├── test/                    # Test taking interface
│   │   └── [id]/                # Dynamic test ID
│   │       └── page.tsx         # Test attempt page
│   ├── tests/                   # Tests listing page
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── app-shell.tsx        # Main app shell
│   │   └── sidebar.tsx         # Sidebar navigation
│   ├── dashboard/              # Dashboard components
│   │   └── welcome-banner.tsx  # Welcome banner
│   └── ui/                     # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── ... (other UI components)
├── lib/                        # Library/utility files
│   ├── ai/                     # AI-related utilities
│   │   ├── access.ts           # AI access control
│   │   ├── recommendation-engine.ts # AI recommendations (deprecated)
│   │   ├── study-plan-generator.ts  # AI study plans (deprecated)
│   │   └── tutor-chat.ts       # AI tutor chat (deprecated)
│   ├── data/                   # Data files
│   │   ├── mht-cet-syllabus.ts # MHT-CET syllabus data
│   │   └── mock-questions.ts   # Mock questions (deprecated)
│   ├── data-service.ts         # Data access functions
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client singleton
│   ├── services/              # Business logic services
│   │   ├── ai-service.ts      # Groq AI service
│   │   ├── result-engine.ts   # Result analysis engine
│   │   └── test-generator.ts  # Test generation engine
│   └── utils/                 # Utility functions
│       └── csv-parser.ts      # CSV parsing utilities
├── prisma/                     # Prisma ORM
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── public/                     # Static files
│   ├── questions/             # Question images
│   └── ... (other static assets)
├── docs/                       # Documentation
│   ├── FILE_STRUCTURE.md      # This file
│   ├── API.md                 # API documentation
│   ├── SETUP.md               # Setup instructions
│   ├── CSV_IMPORT.md          # CSV import guide
│   └── ARCHITECTURE.md        # Architecture documentation
├── types/                      # TypeScript type definitions
│   └── next-auth.d.ts         # NextAuth type extensions
├── .env.local                 # Environment variables (local)
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project overview
```

## Key Files Explained

### Core Application Files

- **app/layout.tsx**: Root layout with theme provider and session provider
- **app/page.tsx**: Landing page with hero section and features
- **app/globals.css**: Global CSS with Tailwind directives

### Authentication

- **lib/auth.ts**: NextAuth.js configuration with CredentialsProvider
- **app/api/auth/[...nextauth]/route.ts**: NextAuth API route
- **types/next-auth.d.ts**: TypeScript extensions for NextAuth session types

### Database

- **prisma/schema.prisma**: Database schema with models for User, Question, MockTest, Attempt, etc.
- **prisma/seed.ts**: Database seeding script for initial data
- **lib/prisma.ts**: Prisma client singleton with connection pooling

### AI Services

- **lib/services/ai-service.ts**: Groq AI integration for:
  - Recommendations
  - Study plans
  - Mentor chat
  - Rank prediction
  - Weak topic analysis

### Test System

- **lib/services/test-generator.ts**: Test generation with:
  - Exam-specific question counts
  - Subject balancing
  - Difficulty balancing
  - Randomization
  - Adaptive testing

- **lib/services/result-engine.ts**: Result analysis with:
  - Score calculation
  - Percentile calculation
  - Subject-wise analysis
  - Chapter-wise analysis
  - Topic-wise analysis
  - Difficulty-wise analysis

### Admin Panel

- **app/admin/layout.tsx**: Admin layout with authentication check
- **app/admin/page.tsx**: Admin dashboard with navigation
- **app/admin/questions/page.tsx**: Question CRUD with CSV upload
- **app/admin/pyq/page.tsx**: PYQ management
- **app/admin/test-builder/page.tsx**: Custom test creation

### User Interface

- **app/test/[id]/page.tsx**: Professional test interface with:
  - Fullscreen mode
  - Timer
  - Question palette
  - Mark for review
  - Auto-save
  - Resume capability

- **app/analytics/page.tsx**: Analytics dashboard with Recharts visualizations

### CSV Import

- **lib/utils/csv-parser.ts**: CSV parsing with validation
- **app/api/admin/questions/bulk-upload/route.ts**: Bulk upload API

## Important Notes

1. **No NEET/Biology Content**: The platform is exclusively for engineering entrance exams
2. **Real AI Only**: All AI features use Groq AI API - no fake or placeholder AI logic
3. **Database Questions Only**: Mock questions file is deprecated - all questions must be in database
4. **CSV Import**: Use CSV import system to add questions to the database
5. **Question Images**: Store question images in `public/questions/` directory

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret key
- `GROQ_API_KEY`: Groq AI API key for AI features

## Dependencies

Key dependencies:
- **Next.js 16**: React framework with App Router
- **Prisma**: ORM for database operations
- **NextAuth.js**: Authentication
- **Recharts**: Data visualization
- **groq-sdk**: Groq AI
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
