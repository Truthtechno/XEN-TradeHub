# XEN TradeHub - Git Setup and Push Script
# This script initializes git and pushes to GitHub

Write-Host "=== XEN TradeHub Git Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .git exists
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Green
} else {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    
    # Try to use git if available
    try {
        # Initialize git repo
        git init
        Write-Host "Git repository initialized!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "Git is not available in PATH." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please run these commands manually:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Open Git Bash or PowerShell with git in PATH" -ForegroundColor Cyan
        Write-Host "2. Run: git init" -ForegroundColor White
        Write-Host "3. Run: git add ." -ForegroundColor White
        Write-Host "4. Run: git commit -m 'Initial commit: XEN TradeHub - Complete Trading Business Platform'" -ForegroundColor White
        Write-Host "5. Run: git branch -M main" -ForegroundColor White
        Write-Host "6. Run: git remote add origin https://github.com/Truthtechno/XEN-TradeHub.git" -ForegroundColor White
        Write-Host "7. Run: git push -u origin main" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: XEN TradeHub - Complete Trading Business Platform

- Complete business platform for trading operations
- Admin dashboard with 11 modules
- User dashboard with streamlined features
- Automated commission and payout systems
- Excel export functionality
- Role-based permissions (SUPERADMIN, Admin, User)
- Archive historical documentation and test files
- Updated README and documentation"

Write-Host "Commit created!" -ForegroundColor Green

Write-Host ""
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote add origin https://github.com/Truthtechno/XEN-TradeHub.git 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin https://github.com/Truthtechno/XEN-TradeHub.git
}

Write-Host ""
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Enter your GitHub credentials when prompted." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Repository pushed to: https://github.com/Truthtechno/XEN-TradeHub" -ForegroundColor Cyan

