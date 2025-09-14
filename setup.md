# Setup Instructions

## Prerequisites

Before running the Solo Leveling System, you need to install Node.js and npm.

### Install Node.js

1. **Download Node.js**
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS version (recommended)
   - Choose the Windows Installer (.msi) for your system

2. **Install Node.js**
   - Run the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" during installation

3. **Verify Installation**
   - Open a new PowerShell/Command Prompt window
   - Run: `node --version`
   - Run: `npm --version`
   - Both commands should return version numbers

## Project Setup

Once Node.js is installed, run these commands in the project directory:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create and setup database
npx prisma db push

# Seed the database with initial data
npx prisma db seed

# Start development server
npm run dev
```

## Alternative: Use Node Version Manager

If you prefer to manage multiple Node.js versions:

1. **Install nvm-windows**
   - Download from [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)
   - Install the latest release

2. **Install Node.js via nvm**
   ```bash
   nvm install lts
   nvm use lts
   ```

3. **Continue with project setup**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```

## Troubleshooting

### Command not found errors
- Make sure Node.js is installed and added to PATH
- Restart your terminal/PowerShell after installation
- Try running commands from the project root directory

### Database errors
- Make sure you're in the project directory
- Check that `prisma/schema.prisma` exists
- Run `npx prisma generate` before `npx prisma db push`

### Port already in use
- The app runs on port 3000 by default
- If port 3000 is busy, Next.js will automatically use the next available port
- Check the terminal output for the actual URL

## Next Steps

After successful setup:
1. Open your browser to `http://localhost:3000`
2. You should see the Solo Leveling System dashboard
3. Start completing your daily quests!
4. Check the README.md for detailed usage instructions
