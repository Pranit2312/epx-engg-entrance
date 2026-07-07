# EPX Setup Guide

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14 (or Docker)
- **npm** >= 9
- **Git**

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd cm
npm install
```

---

## 2. Database Setup

### Option A: Docker (Recommended)

```bash
docker run --name epx-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=epx \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Option B: Local PostgreSQL

Create a database named `epx`:

```bash
createdb epx
```

---

## 3. Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/epx"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Gemini AI (get key from https://aistudio.google.com/apikey)
GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## 4. Prisma Migrations

```bash
# Apply migrations
npx prisma migrate deploy

# Seed the database with 390+ engineering questions
npx tsx prisma/seed.ts

# (Optional) View database in Prisma Studio
npx prisma studio
```

Expected seed output:
```
Admin created: admin@epx.com
Demo student created: student@epx.com
  JEE Main Physics Mock Test 1: 25 questions
  JEE Main Chemistry Mock Test 1: 25 questions
  JEE Main Mathematics Mock Test 1: 25 questions
  JEE Main Full Syllabus Test: 75 questions
  JEE Advanced Physics Mock Test: 30 questions
  JEE Advanced Chemistry Mock Test: 30 questions
  JEE Advanced Mathematics Mock Test: 30 questions
  MHT-CET Physics Mock Test: 50 questions
  MHT-CET Chemistry Mock Test: 50 questions
  MHT-CET Mathematics Mock Test: 50 questions

Total questions seeded: 390
```

---

## 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@epx.com | admin123 |
| Student | student@epx.com | student123 |

---

## 6. Gemini API (AI Features)

The AI features (mentor, study plans, recommendations, weak topic detection, question generation) require a Google Gemini API key.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Add it to `.env.local`:
   ```
   GEMINI_API_KEY="your-key-here"
   ```
4. Verify it works: `GET http://localhost:3000/api/ai/debug`
   - Expected: `{ "hasGeminiKey": true, "geminiConnected": true }`

Without the key, AI features will return descriptive error messages. All other features (tests, analytics, admin) work without AI.

---

## 7. Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove `.next` build cache |
| `npm run predev` | Auto-clean before dev (Windows fix) |

---

## 8. Project Structure

```
├── app/           Next.js App Router pages & API routes
├── components/    Reusable React components (shadcn/ui)
├── config/        App configuration (exams, subjects, features)
├── lib/           Core logic, AI module, data access
├── prisma/        Schema, migrations, seed data
├── repositories/  Data repository layer
├── services/      Business logic services
├── hooks/         Custom React hooks
├── types/         TypeScript declarations
├── public/        Static assets
└── docs/          Documentation
```

---

## 9. Troubleshooting

### Port 3000 in use
```bash
npx kill-port 3000
```

### Docker container not connecting
```bash
docker start epx-postgres
```

### Prisma client not generated
```bash
npx prisma generate
```

### Windows: `nul` file appears in project root
```bash
rm -f nul
```
The `predev` script in `package.json` handles this automatically.
