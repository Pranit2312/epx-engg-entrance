# EPX — Engineering Preparation eXperience

A production-grade competitive exam mock test platform built with modern web technologies.

## Features

- **Authentication System**: User registration, login, and session management with NextAuth.js
- **Landing Page**: Professional hero section with features showcase
- **Student Dashboard**: Personalized dashboard with stats, recent activity, and recommendations
- **Mock Tests**: 20+ realistic mock tests for JEE Main, JEE Advanced, MHT-CET, and NEET
- **Test Attempt Interface**: Professional exam environment with timer, question navigator, and mark for review
- **Results Page**: Detailed analytics with score, accuracy, time analysis, and performance insights
- **Dark Mode**: Full dark mode support with theme toggle
- **Responsive Design**: Mobile-first responsive design for all screen sizes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Theme**: next-themes

## Project Structure

```
cm/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   └── register/              # Registration API
│   ├── dashboard/                 # Student dashboard
│   ├── login/                     # Login page
│   ├── register/                  # Registration page
│   ├── results/                   # Test results page
│   ├── test/[id]/                 # Test attempt interface
│   ├── tests/                     # Mock tests listing
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Landing page
├── components/
│   ├── providers/                 # Theme and session providers
│   ├── ui/                        # Shadcn UI components
│   ├── navbar.tsx                 # Navigation bar
│   └── theme-toggle.tsx           # Theme toggle button
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── prisma.ts                  # Prisma client
│   ├── utils.ts                   # Utility functions
│   └── data/
│       ├── mock-tests.ts          # Mock test data
│       └── mock-questions.ts      # Question generator
├── prisma/
│   └── schema.prisma              # Database schema
└── types/
    └── next-auth.d.ts             # NextAuth TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally or cloud database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.local.example .env.local
```

Edit `.env.local` and add your database URL and NextAuth secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cm_db?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following models:

- **User**: User accounts with email, password, and name
- **MockTest**: Test definitions with exam type, subject, duration, and difficulty
- **Question**: Individual questions with options and correct answers
- **Attempt**: Test attempts with scores, answers, and timing

See `prisma/schema.prisma` for the complete schema.

## Usage

1. **Register**: Create a new account on the registration page
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your stats and recent activity
4. **Browse Tests**: Explore available mock tests with filters
5. **Take Test**: Start a test and answer questions in exam-like environment
6. **View Results**: See your performance analysis after submission

## Future Enhancements

The architecture is designed to support future features:

- AI-generated mock tests
- Question bank with PYQ database
- LangGraph agents for personalized learning
- Advanced analytics and leaderboards
- Subscription plans
- Admin panel for content management

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
