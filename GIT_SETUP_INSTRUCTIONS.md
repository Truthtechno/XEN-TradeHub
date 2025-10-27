# Git Setup and Push Instructions for XEN TradeHub

This guide will help you push your XEN TradeHub code to GitHub.

## 🚀 Quick Steps

### Option 1: Using Git Bash (Recommended)

1. **Open Git Bash** in the project directory `D:\BRYAN\Projects\XEN TradeHub`

2. **Initialize Git Repository** (if not already initialized)
   ```bash
   git init
   ```

3. **Add All Files**
   ```bash
   git add .
   ```

4. **Create Initial Commit**
   ```bash
   git commit -m "Initial commit: XEN TradeHub - Complete Trading Business Platform

   - Complete business platform for trading operations
   - Admin dashboard with 11 modules  
   - User dashboard with streamlined features
   - Automated commission and payout systems
   - Excel export functionality
   - Role-based permissions (SUPERADMIN, Admin, User)
   - Archive historical documentation and test files
   - Updated README and documentation"
   ```

5. **Set Main Branch**
   ```bash
   git branch -M main
   ```

6. **Add Remote Repository**
   ```bash
   git remote add origin https://github.com/Truthtechno/XEN-TradeHub.git
   ```

7. **Push to GitHub**
   ```bash
   git push -u origin main
   ```

---

### Option 2: Using PowerShell

If Git is installed but not in PATH, find Git Bash and run the commands there, or:

1. **Open PowerShell in the project directory**

2. **Run the setup script**
   ```powershell
   .\setup-git-and-push.ps1
   ```

---

### Option 3: Using VS Code

1. **Open VS Code** in the project directory

2. **Open Terminal** in VS Code (Ctrl + `)

3. **Open Source Control** panel (Ctrl + Shift + G)

4. **Click "Publish to GitHub"** if git is initialized
   - Or initialize git first by clicking "Initialize Repository"

5. **Follow the prompts** to push to GitHub

---

## ⚠️ Important Notes

### Create .gitignore File

Before committing, create a `.gitignore` file to exclude unnecessary files:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db

# Archive folder (optional - decide if you want to version control)
# archive/
```

---

## 📂 Files to Exclude (Optional)

Consider excluding these folders from git:
- `archive/` - Historical documentation (already archived locally)
- `test-scripts/` - Development scripts
- `*.backup`, `*.bak`, `*.bak2`, `*.bak3` - Backup files

Add to `.gitignore`:
```gitignore
# Archive
archive/historical-docs/
archive/test-scripts/
archive/old-fixes/

# Backups
*.backup
*.bak
*.bak2
*.bak3
```

---

## 🔐 GitHub Authentication

### Personal Access Token (Recommended)

If prompted for credentials, use a **Personal Access Token**:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

Or use GitHub CLI:
```bash
gh auth login
```

---

## 📋 Verification

After pushing, verify at:
- **Repository**: https://github.com/Truthtechno/XEN-TradeHub
- **Check if files are uploaded**
- **Check if README.md displays correctly**

---

## 🔄 Future Updates

For future updates:
```bash
git add .
git commit -m "Update: Description of changes"
git push
```

---

## ✅ Checklist

Before pushing, ensure:
- [ ] README.md is updated
- [ ] SYSTEM_EVOLUTION.md is complete
- [ ] CLEANUP_PLAN.md documents archived files
- [ ] .gitignore is created
- [ ] No sensitive data in environment variables
- [ ] node_modules is excluded
- [ ] Archive folder decision made (include or exclude)

---

**Need Help?**
- Check if git is installed: `git --version`
- Check git config: `git config --list`
- Verify remote: `git remote -v`

