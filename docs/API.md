# EPX API Reference

## Authentication

Most routes require authentication via NextAuth.js (JWT). Include the session cookie automatically handled by the browser.

### `GET /api/auth/[...nextauth]`
NextAuth.js handler. Supports credentials-based login.

### `POST /api/register`
Create a new user account.
```json
// Request
{ "email": "user@example.com", "password": "securepass", "name": "User" }

// Response 201
{ "user": { "id": "...", "email": "user@example.com", "name": "User" } }
```

---

## Tests

### `GET /api/tests`
List all available mock tests. No auth required (uses fallback data if DB unavailable).
```json
// Response 200
[{ "id": "1", "name": "JEE Main Physics Mock Test 1", "examType": "JEE_MAIN", "subject": "Physics", "duration": 60, "totalQuestions": 25, "difficulty": "MEDIUM", "description": "..." }]
```

### `GET /api/tests/[id]/questions`
Get questions for a specific test. Auth required.
```json
// Response 200
{ "questions": [{ "id": "...", "questionText": "...", "options": ["...","...","...","..."], "correctOption": 0, "explanation": "...", "subject": "Physics", "chapter": "Mechanics", "topic": "Kinematics", "difficulty": "MEDIUM" }] }
```

### `POST /api/tests/generate`
Generate a custom/adaptive test. Auth required.
```json
// Request
{ "examType": "JEE_MAIN", "subjects": ["Physics", "Chemistry", "Mathematics"], "totalQuestions": 75, "duration": 180, "difficultyDistribution": { "EASY": 25, "MEDIUM": 35, "HARD": 15 } }

// Response 201
{ "test": { "id": "...", "name": "Adaptive Test", ... }, "questions": [...] }
```

---

## Attempts

### `POST /api/attempts`
Submit a test attempt. Auth required. Triggers async AI analysis.
```json
// Request
{ "mockTestId": "...", "score": 80, "correct": 20, "incorrect": 5, "totalQuestions": 25, "accuracy": 80, "timeTaken": 1800, "answers": { "q1": 0, "q2": 2 }, "markedForReview": ["q3"], "startedAt": "2026-07-07T10:00:00Z", "submittedAt": "2026-07-07T10:30:00Z", "questionAnswers": [{ "questionId": "...", "selectedOption": 0, "timeSpent": 45, "markedForReview": false, "isCorrect": true }] }

// Response 201
{ "attempt": { "id": "...", "score": 80, ... } }
```

---

## Results

### `GET /api/results/[id]`
Get detailed result for a specific attempt. Auth required, only own results.
```json
// Response 200
{ "attempt": { "id": "...", "mockTestId": "...", "score": 80, "correct": 20, "incorrect": 5, "unattempted": 0, "accuracy": 80, "timeTaken": 1800, ... }, "answers": [{ "questionId": "...", "questionText": "...", "selectedOption": 0, "correctOption": 0, "isCorrect": true, "explanation": "..." }], "subjectBreakdown": { "Physics": { "correct": 10, "incorrect": 2, "total": 12, "accuracy": 83.33 } } }
```

---

## Analytics

### `GET /api/analytics`
Get analytics overview. Auth required.
```json
// Response 200
{ "totalTests": 5, "averageAccuracy": 72.5, "totalTimeSpent": 5400, "subjectPerformance": { "Physics": { "correct": 45, "incorrect": 15, "total": 60, "accuracy": 75 } }, "recentAttempts": [...], "streak": 3 }
```

### `GET /api/dashboard`
Get personalized dashboard data with AI insights. Auth required.
```json
// Response 200
{ "recentAttempts": [...], "aiInsights": { "recommendations": [...], "weakTopics": [...], "latestAnalysis": {...}, "activeStudyPlan": {...} }, "quickStats": { "totalTests": 5, "averageAccuracy": 72.5, "currentStreak": 3 } }
```

---

## AI Routes

All AI routes require premium subscription access and use Groq AI API for real AI responses.

### `GET /api/ai/recommendations`
Get AI-powered study recommendations based on performance data. Auth required. Query: `?refresh=true` to regenerate.
```json
// Response 200
{ "recommendations": [{ "id": "...", "type": "STUDY_PLAN", "content": { "recommendation": "..." }, "reason": "AI-generated study recommendations", "priority": 3 }], "aiRecommendation": "Focus on weak topics like Electrostatics and practice more numerical problems..." }
```

### `GET /api/ai/weak-topics`
Get AI-analyzed weak topics. Auth required. Query: `?refresh=true` to regenerate.
```json
// Response 200
{ "weakTopics": [...], "aiAnalyzedTopics": ["Physics - Electrostatics", "Chemistry - Organic Chemistry"], "recentAnalyses": [...] }
```

### `POST /api/ai/study-plan`
Generate an AI study plan. Auth required.
```json
// Request
{ "durationDays": 7, "availableHoursPerDay": 4 }

// Response 201
{ "plan": { "id": "...", "title": "7-Day Study Plan for JEE_MAIN", "description": "...", "planData": { "plan": "AI-generated day-by-day schedule...", "weakTopics": [...], "targetScore": 85 }, "startDate": "...", "endDate": "..." }, "aiPlan": "Day 1: Focus on Physics - Mechanics (2 hours)..." }
```

### `GET /api/ai/study-plan`
List active study plans. Auth required.
```json
// Response 200
{ "plans": [{ "id": "...", "title": "...", "durationDays": 7, "status": "ACTIVE", "createdAt": "..." }] }
```

### `POST /api/ai/mentor`
Chat with AI mentor. Auth required. Uses Groq AI with user context.
```json
// Request
{ "message": "Help me understand torque" }

// Response 200
{ "reply": "Torque is the rotational equivalent of force..." }
```

### `GET /api/ai/rank-prediction`
Predict exam rank based on historical performance using AI. Auth required.
```json
// Response 200
{ "currentScore": 75, "targetExam": "JEE_MAIN", "prediction": { "predictedPercentile": 85, "predictedRank": 15000, "confidence": "Medium" }, "historicalScores": [70, 72, 75, 73, 75] }
```

---

## Bookmarks

### `GET /api/bookmarks`
List bookmarked tests. Auth required.

### `POST /api/bookmarks`
Add a bookmark. Auth required.
```json
// Request
{ "testId": "..." }
```

### `DELETE /api/bookmarks/[testId]`
Remove a bookmark. Auth required.

---

## Leaderboard

### `GET /api/leaderboard`
Get leaderboard entries. Auth required.
Query params: `period=daily|weekly|monthly|all_time`, `filter=global|city|college`, `limit=50`
```json
// Response 200
{ "entries": [{ "rank": 1, "userId": "...", "name": "User", "score": 98, "accuracy": 95, "testsTaken": 10 }], "currentUser": { "rank": 15, ... }, "totalParticipants": 250, "period": "weekly" }
```

---

## Notifications

### `GET /api/notifications`
List last 50 notifications. Auth required.

### `POST /api/notifications`
Create a notification. Auth required.
```json
// Request
{ "type": "NEW_TEST", "title": "New Test Available", "message": "JEE Main Full Syllabus Test is now available", "actionUrl": "/tests/..." }
```

### `PATCH /api/notifications`
Mark notifications as read. Auth required.
```json
// Request
{ "id": "..." }  // or {} to mark all as read
```

---

## Premium

### `GET /api/premium`
Get premium subscription status. Auth required.

### `POST /api/premium`
Upgrade, downgrade, or start trial. Auth required.
```json
// Request
{ "action": "upgrade", "planId": "MONTHLY" }
```

---

## Profile & Settings

### `GET /api/profile`
Get user profile with stats. Auth required.

### `PATCH /api/profile`
Update profile. Auth required.
```json
// Request
{ "name": "New Name", "targetExam": "JEE_ADVANCED", "preferredSubjects": ["Physics", "Chemistry", "Mathematics"] }
```

### `DELETE /api/profile`
Delete account. Auth required.
```json
// Request
{ "password": "currentpassword" }
```

### `PATCH /api/profile/password`
Change password. Auth required.
```json
// Request
{ "currentPassword": "oldpass", "newPassword": "newpass" }
```

### `GET /api/settings`
Get notification settings. Auth required.

### `PATCH /api/settings`
Update notification settings. Auth required.
```json
// Request
{ "emailNotifications": true, "testReminders": false }
```

---

## Support Tickets

### `GET /api/tickets`
List support tickets. Auth required.

### `POST /api/tickets`
Create a support ticket. Auth required.
```json
// Request
{ "subject": "Login issue", "description": "Cannot login after password reset", "priority": "HIGH" }
```

---

## Admin Routes

### `GET /api/admin/questions`
List all questions. Admin auth required.

### `POST /api/admin/questions`
Create a question. Admin auth required.
```json
// Request
{ "questionText": "...", "options": ["...","...","...","..."], "correctOption": 0, "explanation": "...", "subject": "Physics", "chapter": "Mechanics", "topic": "Kinematics", "difficulty": "MEDIUM", "examType": "JEE_MAIN" }
```

### `PUT /api/admin/questions/[id]`
Update a question. Admin auth required.

### `DELETE /api/admin/questions/[id]`
Delete a question. Admin auth required.

### `POST /api/admin/questions/bulk-upload`
Bulk upload questions via CSV or JSON. Admin auth required.
```
// Form data
file: <uploaded_file>
type: "csv" | "json"
```

### `GET /api/admin/pyq`
List previous year questions. Admin auth required.

### `POST /api/admin/pyq`
Create a PYQ. Admin auth required.

### `GET /api/admin/tests`
List all mock tests. Admin auth required.

### `POST /api/admin/tests`
Create a mock test. Admin auth required.
```json
// Request
{ "name": "Test Name", "examType": "JEE_MAIN", "duration": 180, "difficulty": "HARD", "description": "...", "sections": [...], "questionIds": ["...", "..."] }
```

---

## Utilities

### `GET /api/hello`
Health check. No auth required.
```json
// Response 200
{ "message": "Hello from API!" }
```
