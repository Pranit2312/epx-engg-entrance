# EPX Architecture

## Overview

EPX (Engineering Preparation eXperience) is a full-stack web platform for engineering entrance exam preparation. It provides mock tests, AI-powered analytics, personalized study plans, and an AI mentor — all backed by LangChain + Gemini.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes (server components) |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **AI** | Google Gemini 2.0 Flash via LangChain.js |
| **Auth** | NextAuth.js (Credentials provider, JWT) |
| **Language** | TypeScript (strict mode) |

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Landing  │  │Dashboard │  │ Test     │  │ Admin  │ │
│  │ Page     │  │          │  │ Attempt  │  │ Panel  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              Next.js Server (App Router)                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              API Route Layer                        │ │
│  │  /api/tests  /api/attempts  /api/analytics          │ │
│  │  /api/ai/*   /api/admin/*   /api/auth/*             │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │              Service Layer                          │ │
│  │  analytics-service  result-engine  test-generator   │ │
│  │  premium-service    bookmark-service                │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │              Repository Layer                       │ │
│  │  attempt-repository  test-repository               │ │
│  │  bookmark-repository user-repository               │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────────┐ │
│  │              Data Access (Prisma)                   │ │
│  │  schema.prisma → PostgreSQL                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              AI Layer (lib/ai/)                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │ Gemini   │ │ LangChain│ │ Tutor Chat       │   │ │
│  │  │ Client   │ │ Chains   │ │ (ChatGoogleGenAI)│   │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │ Study    │ │ Recom-   │ │ Weak Topic       │   │ │
│  │  │ Plans    │ │ mend.    │ │ Detector         │   │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Core Engines

### 1. Question Bank → Test Engine

```
Question Bank (Prisma: Question model)
    │
    ▼
Test Generator (lib/services/test-generator.ts)
    │  • Picks questions by exam type, subject, difficulty
    │  • Balances difficulty distribution
    │  • Randomizes question order
    │  • Creates MockTest + TestSection records
    ▼
Test Interface (app/test/[id]/page.tsx)
    │  • Timer, navigator, subject tabs
    │  • Auto-save to localStorage every 30s
    │  • Auto-submit on timer expiry
    │  • Fullscreen mode
    ▼
Submission (POST /api/attempts)
    │  • Validates session
    │  • Stores per-question answers
    │  • Triggers AI analysis (fire-and-forget)
    ▼
Results Page (app/results/page.tsx)
```

### 2. Evaluation Engine

```
POST /api/attempts
    │
    ▼
Submit Attempt (app/api/attempts/route.ts)
    │  • Creates Attempt record
    │  • Stores UserMockTestQuestionAttemptAnswer rows
    │  • Fires triggerAIAnalysis() (non-blocking)
    ▼
Result Engine (lib/services/result-engine.ts)
    │  • Subject/chapter/topic breakdown
    │  • Difficulty-wise performance
    │  • Time analysis per question
    ▼
Results API (GET /api/results/[id])
    │  • Returns attempt + answers + breakdown
    ▼
Results Page (sessionStorage + API)
```

### 3. Analytics Engine

```
GET /api/analytics
    │  • Overview: total tests, accuracy, time
    │  • Subject-wise performance chart
    │  • Recent attempts list
    │
    ▼
GET /api/dashboard
    │  • AI insights (recommendations, weak topics)
    │  • Active study plan
    │  • Latest analysis summary
    │
    ▼
Analytics Page (app/analytics/page.tsx)
    │  • Donut chart (subject distribution)
    │  • Performance line chart (score history)
    │  • Subject gradient cards
```

### 4. AI Recommendation Engine

```
lib/ai/recommendation-engine.ts
    │  • Uses gemini.ts to generate recommendations
    │  • Analyzes weak topics and recent performance
    │  • Creates AIRecommendation records in DB
    │  • Supports: TEST, CHAPTER, QUESTION, STUDY_PLAN types
    │
GET /api/ai/recommendations
    │  • Returns stored recommendations
    │  • ?refresh=true triggers new generation
    │
Weak Topic Detector (lib/ai/weak-topic-detector.ts)
    │  • Classifies topics by severity (WEAK/MODERATE/STRONG)
    │  • Normalizes scores across subjects
    │  • Stores in WeakTopic table
```

### 5. Personalized Dashboard

```
GET /api/dashboard
    │
    ├─• Recent attempts (last 5)
    ├─• AI recommendations (unviewed)
    ├─• Weak topics (accuracy < 60%)
    ├─• Latest AI analysis summary
    ├─• Active study plan
    └─• Quick stats (tests, accuracy, streak)
```

---

## AI Module Details

### Gemini Integration (lib/ai/gemini.ts)

- **`getGeminiClient()`**: Creates GoogleGenerativeAI client from `GEMINI_API_KEY`
- **`getGeminiModel(modelName?)`**: Returns a `GenerativeModel` instance (defaults to `gemini-2.0-flash`)
- **`generateWithGemini(prompt, options?)`**: Sends text prompt, returns response text. Includes retry logic via `generateWithRetry()`
- **`generateJsonWithGemini<T>(prompt, options?)`**: Requests JSON-structured response, validates and returns parsed type `T`
- **`generateWithRetry(fn, retries?, delayMs?)`**: Exponential backoff retry wrapper (3 attempts, 2s base delay)
- **`getTotalCost()`**: Tracks cumulative token usage across all requests

### LangChain Integration (lib/ai/tutor-chat.ts)

- **`ChatGoogleGenerativeAI`**: LangChain model wrapper for Gemini
- **`ChatPromptTemplate`**: System message with student context (weak topics, strengths, target exam, scores)
- **`MessagesPlaceholder("history")`**: Variable slot for conversation history
- **`StringOutputParser`**: Parses model output to string
- **`AIMentor` class**: `getChain()` method creates the LangChain runnable pipeline
- **`getChatHistory(userId)`**: Loads last 20 messages from `ChatHistory` table

### AI Service Layer (lib/services/ai-service.ts)

High-level wrappers that combine Gemini, LangChain, and database:
- **`generateAIResponse(prompt)`**: Direct Gemini call
- **`generateRecommendations(userId)`**: Full recommendation pipeline
- **`generateStudyPlan(userId, durationDays, hoursPerDay)`**: Day-by-day plan
- **`generateMentorResponse(userId, message, context)`**: LangChain chat
- **`predictRank(userId)`**: Rank estimation from attempt history
- **`analyzeWeakTopics(userId)`**: Weak topic detection + DB upsert

---

## Data Flow: AI Recommendation

```
User completes test
    │
    ▼
POST /api/attempts → triggerAIAnalysis()
    │  (non-blocking, no await)
    ▼
POST /api/ai/analyze { attemptId }
    │
    ├─► performance-analyzer.ts → Gemini analysis
    │   • Builds prompt with subject scores, accuracy, time
    │   • Returns strengths, weaknesses, feedback
    │   • Stores AIAnalysis record
    │
    ├─► weak-topic-detector.ts → Classify topics
    │   • Calculates accuracy per topic
    │   • Severity classification
    │   • Upserts WeakTopic records
    │
    └─► recommendation-engine.ts → Generate recommendations
        • Uses weak topics + strengths
        • Creates AIRecommendation records
```

---

## Database Structure

27 models in `prisma/schema.prisma`:

```
User ──< Attempt ──> MockTest
User ──< Bookmark ──> MockTest
User ──< QuestionBookmark ──> Question
User ──< Subscription ──< Payment
User ──< Leaderboard
User ──< Notification
User ──< SupportTicket
User ──< StudyPlan
User ──< AIRecommendation
User ──< ChatHistory
User ──< AIAnalysis ──> Attempt
User ──< WeakTopic
User ──< UserMockTestQuestionAttemptAnswer ──> Question
Question ──< AIVariant
Attempt ──< UserMockTestQuestionAttemptAnswer ──> Question
MockTest ──< TestSection ──< Question
MockTest ──< Question (direct)
```

---

## Key Design Decisions

1. **Fire-and-forget AI analysis**: After test submission, AI analysis runs asynchronously so the response isn't blocked
2. **localStorage auto-save**: Test progress saved every 30s to localStorage; submission saves to DB
3. **Premium gate at UI level**: `lib/ai/access.ts` returns true unconditionally; premium enforcement is UI-only via `FeatureGate`
4. **No placeholder questions**: All questions in seed data are real exam-quality questions; backup bank has 20 curated questions
5. **Separate AI API routes**: Each AI feature gets its own route for independent scalability and error isolation
