# PLDG Dashboard

A real-time analytics dashboard for tracking developer engagement, technical progress, and contribution metrics across the PLDG (Protocol Labs Developer Guild) program.

## Features

- 📊 Real-time engagement metrics visualization
- 🤝 Tech partner collaboration tracking
- 📈 Technical progress monitoring
- 🏆 Top performer analytics
- 🤖 AI-powered insights generation
- 📑 Executive summary reporting
- 🔄 GitHub integration for issue tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Data Processing**: Lodash
- **Validation**: Zod
- **API Integration**:
  - Airtable API (Engagement Data)
  - GitHub GraphQL API (Issue Tracking)
  - Octokit REST API (Repository Data)

## Getting Started

Clone the repository

Install dependencies:

```bash
npm install
```

Set up environment variables:

```bash
cp .env.example .env.local
```

Start the development server:

```bash
npm run dev
```

## Project Structure

```bash
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── dashboard/   # Dashboard-specific components
│   └── ui/         # Reusable UI components
├── lib/             # Utility functions
│   ├── utils.ts    # General utilities
│   ├── validation.ts # Data validation
│   └── ai.ts       # AI processing
├── types/           # TypeScript type definitions
└── public/          # Static assets
    └── data/       # CSV data files
```

## Data Flow

1. **Data Sources**:
   - Airtable: Weekly engagement surveys
   - GitHub: Issue tracking and project data

2. **Processing Pipeline**:
   - Raw data fetching
   - Data validation (Zod schemas)
   - Metric calculations
   - Insight generation

3. **Real-time Updates**:
   - Automatic refresh intervals
   - On-demand data updates
   - Error handling and retry logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License
