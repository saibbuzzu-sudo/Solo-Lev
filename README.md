# Solo Leveling System

A cross-platform personal improvement app inspired by *Solo Leveling* that helps you level up through daily and weekly quests. Track your progress with stats (STR/INT/CHA/WIL/VIT), earn EXP, maintain streaks, and face humorous penalties when you fail.

## Features

- **Daily & Weekly Quests**: Automated quest generation with customizable templates
- **Character Progression**: Level up system with 5 core stats (STR, INT, CHA, WIL, VIT)
- **Streak Tracking**: Maintain daily and weekly streaks for bonus EXP
- **Penalty System**: Humorous but consequential penalties for failed quests
- **Title System**: Earn titles and buffs based on your achievements
- **Timezone Aware**: Europe/London timezone with proper daily/weekly resets
- **Export/Import**: CSV and JSON data export for portability

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Game Mechanics

### Stats System
- **STR (Strength)**: Workouts, mobility, conditioning
- **INT (Intelligence)**: Research, writing, reading, learning
- **CHA (Charisma)**: Communication, teaching, outreach
- **WIL (Willpower)**: Routine adherence, focus, digital hygiene
- **VIT (Vitality)**: Sleep, hydration, recovery, nutrition

### Leveling System
- **EXP Formula**: `Base 1,000 + (N-1) * (500 + 250*(N-1))`
- **Level-up**: +5 assignable stat points per level
- **Streak Bonus**: +10% EXP per 7 consecutive days (max +40%)

### Quest Types

#### Daily Quests
- **Fitness**: 30-45 min kettlebell, 8k steps, mobility work
- **Mind**: Write 300+ words, 2×25-min focus blocks, read 20+ min
- **Willpower**: No phone first 30 min, evening planning

#### Weekly Quests
- **Fitness**: Complete 4 workouts, test day AMRAP
- **Research**: Finish one section, 1,500 net new words
- **Reading**: Complete one chapter or 70 pages

### Penalty System
- **Punishment Quests**: Auto-assigned (50 push-ups, 30-min screen detox)
- **EXP Loss**: -10 for missed daily, -50 for missed weekly
- **Negative Titles**: 24h debuffs (E-Rank Scholar, Dungeon-Dodger)

## API Endpoints

### User
- `GET /api/user` - Get user profile and stats
- `PUT /api/user` - Update user stats/settings

### Quests
- `GET /api/quests?type=daily|weekly&date=YYYY-MM-DD` - Get quests
- `POST /api/quests` - Create new quest
- `POST /api/quests/complete` - Complete/fail quest

## Database Schema

The app uses SQLite with Prisma ORM. Key tables:
- `users` - User profiles, stats, settings
- `quests` - Daily/weekly quests
- `completions` - Quest completion records
- `streaks` - Daily/weekly streak tracking
- `titles` - Available titles and effects
- `quest_templates` - Quest generation templates

## Customization

### Quest Templates
Edit `prisma/seed.ts` to modify quest templates, rewards, and penalties.

### Timezone
Default is Europe/London. Change in user settings or database.

### Humor Style
Configure penalty intensity and humor level in user settings.

## Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   └── page.tsx        # Main dashboard
├── components/         # React components
│   ├── dashboard/      # Dashboard components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and game mechanics
└── types/             # TypeScript type definitions
```

### Key Files
- `src/lib/game-mechanics.ts` - Core game logic
- `src/types/index.ts` - TypeScript interfaces
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Initial data and templates

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set up environment variables
4. Deploy

### Self-hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Inspired by the web novel and manhwa "Solo Leveling" by Chugong.
