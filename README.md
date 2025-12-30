# OnChain Pulse

A Farcaster Mini App that tracks social metrics and on-chain activity with interactive visualizations.

## Features

- **Social Metrics Tracking**: Fetch and aggregate Farcaster casts, likes, replies, and reposts
- **On-Chain Heatmap**: Visualize transaction activity across multiple chains
- **Hourly Density Charts**: See activity patterns by hour of day
- **Interactive Timeline**: Link social events to on-chain transactions
- **Privacy Controls**: Manage data sharing and local storage preferences
- **Multi-Chain Support**: Ethereum, Base, Optimism, Polygon, Arbitrum

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Data Sources**:
  - Farcaster Hub / Neynar API for social metrics
  - The Graph for indexed blockchain data
  - Alchemy/Covalent for transaction data

## API Endpoints

### GET /api/metrics/:userId

Fetches social metrics for a Farcaster user.

**Response:**
```json
{
  "userId": "string",
  "period": "30d",
  "dailyAggregates": [
    {
      "date": "2025-01-01",
      "totalLikes": 50,
      "totalReplies": 20,
      "totalReposts": 15,
      "totalCasts": 10,
      "engagementRate": 8.5
    }
  ],
  "recentCasts": [...],
  "summary": {
    "totalEngagement": 1250,
    "avgDailyEngagement": 41.6,
    "topDay": "2025-01-15"
  }
}
```

### GET /api/heatmap/:address

Fetches on-chain activity heatmap for a wallet address.

**Query Parameters:**
- `period`: Time period (default: 30d)
- `real`: Use real data if "true" (requires API keys)

**Response:**
```json
{
  "address": "0x...",
  "period": "30d",
  "buckets": [
    {
      "date": "2025-01-01",
      "hour": 14,
      "chain": "ethereum",
      "contract": "0x1234...5678",
      "count": 15,
      "volume": "5.5",
      "gasUsed": "0.05",
      "intensity": 62
    }
  ],
  "chains": ["ethereum", "base", "optimism"],
  "topContracts": [...],
  "peakHour": 14,
  "peakDay": "2025-01-15"
}
```

## Intensity Score Calculation

The heatmap intensity score combines transaction count, volume, and gas usage:

**Formula:**
```
intensity = (normalizedCount × 0.4) + (normalizedVolume × 0.4) + (normalizedGas × 0.2)
```

**Example:**
- Count: 15 txs (max: 20) → normalized: 75
- Volume: 5.5 ETH (max: 10) → normalized: 55  
- Gas: 0.05 ETH (max: 0.1) → normalized: 50
- **Intensity = (75 × 0.4) + (55 × 0.4) + (50 × 0.2) = 62**

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd onchain-pulse
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:
- `ALCHEMY_API_KEY` or `COVALENT_API_KEY` for on-chain data
- `NEYNAR_API_KEY` for production Farcaster data (optional for dev)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings
4. Deploy

**One-line deploy:**
```bash
vercel --prod
```

### Environment Variables for Production

Set these in your Vercel project:
- `NEXT_PUBLIC_APP_URL`: Your production URL
- `ALCHEMY_API_KEY`: Alchemy API key
- `NEYNAR_API_KEY`: Neynar API key (for Farcaster)
- `GRAPH_*_URL`: The Graph subgraph URLs

## Folder Structure

```
onchain-pulse/
├── app/
│   ├── api/
│   │   ├── metrics/[userId]/route.ts    # Social metrics endpoint
│   │   ├── heatmap/[address]/route.ts   # On-chain heatmap endpoint
│   │   ├── privacy/route.ts             # Privacy settings endpoint
│   │   └── og/route.tsx                 # OG image generation
│   ├── globals.css                       # Global styles & theme
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Home page
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── dashboard-view.tsx                # Main dashboard
│   ├── heatmap-calendar.tsx              # Calendar heatmap
│   ├── hourly-density-chart.tsx          # Hourly chart
│   ├── interactive-timeline.tsx          # Timeline view
│   ├── metrics-summary.tsx               # Stats cards
│   └── privacy-controls.tsx              # Privacy settings
├── public/
│   └── .well-known/
│       └── farcaster-manifest.json      # Farcaster Mini App manifest
├── .env.example                          # Environment variables template
├── package.json
└── README.md
```

## Farcaster Mini App Configuration

The app includes Farcaster Mini App metadata in:
- `app/page.tsx`: Frame metadata tags
- `public/.well-known/farcaster-manifest.json`: Mini App manifest

## Privacy Features

Users can:
- Choose data sharing level (public/private/signed proofs)
- Store data locally instead of on servers
- Anonymize wallet addresses
- Exclude specific chains from tracking
- Import CSV data for offline analysis

## Testing

### Unit Tests

Test API contracts:
```bash
npm test
```

### E2E Tests

Test full user flows:
```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact the team.
