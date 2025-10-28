# Node.js Upgrade Instructions

## Problem
Your system is using Node.js v16.20.2, but XEN TradeHub requires Node.js v18.0.0 or higher.

## Quick Fix

### Option 1: Direct Download (Recommended for Windows)
1. Visit https://nodejs.org/
2. Download the **Windows Installer (.msi)** for **Node.js 20.x LTS** (Long Term Support)
3. Run the installer and follow the prompts
4. **Important**: Restart your terminal/PowerShell after installation
5. Run `node --version` to verify you're on v20+
6. Run `npm run dev` again

### Option 2: Using Chocolatey (If you have admin rights)
Open PowerShell **as Administrator** and run:
```powershell
choco install nodejs-lts -y
```

Then restart your terminal.

### Option 3: Using NVM (Node Version Manager)
1. Download and install nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Run: `nvm install 20`
3. Run: `nvm use 20`
4. Run: `node --version` to verify

## Automatic Version Check
I've added an automatic version checker that will run before `npm run dev`:
- If your Node.js version is too old, you'll see a clear error message
- This prevents the app from starting with an incompatible version
- Just upgrade Node.js and try again

## After Upgrading
Once you've upgraded to Node.js 20, you should be able to run:
```bash
npm run dev
```

The system will automatically check your Node.js version is compatible before starting the development server.


