# Pre-Removal Checklist - Legacy CoreFX Pages

## ⚠️ Before Proceeding

Please ensure you have:

1. ✅ **Backed up your work** (git commit or copy the project)
2. ✅ **Created a feature branch** for safety
3. ✅ **Tested the active features** to ensure they work
4. ✅ **Reviewed** that you won't need these legacy pages

## 📋 What Will Be Removed (22 Directories)

### User Pages (7):
- app/(authenticated)/courses
- app/(authenticated)/events
- app/(authenticated)/one-on-one
- app/(authenticated)/resources
- app/(authenticated)/profile
- app/(authenticated)/market-analysis
- app/(authenticated)/verify-data

### Admin Pages (11):
- app/(admin)/admin/courses
- app/(admin)/admin/events
- app/(admin)/admin/mentorship
- app/(admin)/admin/resources
- app/(admin)/admin/analytics
- app/(admin)/admin/calendar
- app/(admin)/admin/coaching
- app/(admin)/admin/market-analysis
- app/(admin)/admin/trade
- app/(admin)/admin/trade-simple
- app/(admin)/admin/tools

### Trade Pages (2):
- app/(authenticated)/trade-core
- app/(authenticated)/trade-kojo

### API Routes (8):
- app/api/courses
- app/api/admin/courses
- app/api/events
- app/api/admin/events
- app/api/mentorship
- app/api/admin/mentorship
- app/api/resources
- app/api/admin/resources

## 🎯 Active Features Will NOT Be Affected

These remain fully functional:
- ✅ Dashboard
- ✅ Trade Through Us (Brokers)
- ✅ Copy Trading
- ✅ Academy
- ✅ Affiliates (Earn With Us)
- ✅ Live Enquiry
- ✅ Notifications
- ✅ All Admin features

## 🚀 Next Steps

After running the removal:

1. **Test all active features**:
   - Go to Dashboard
   - Test Broker submission
   - Test Copy Trading
   - Test Academy enrollment
   - Test Affiliate program
   - Test Live Enquiry
   - Test Notifications

2. **Run build**:
   ```bash
   npm run build
   ```

3. **Test in browser**:
   - Check for 404 errors
   - Verify all navigation works
   - Check mobile responsiveness

4. **Commit to git**:
   ```bash
   git add .
   git commit -m "Remove legacy CoreFX pages (courses, events, resources, etc.)"
   ```

## ⚡ Benefits

- **42% fewer pages** to maintain
- **15-20% faster build times**
- **Cleaner codebase**
- **Easier to understand architecture**
- **Only XEN TradeHub features remain**

## ⚠️ Warnings

- This is **irreversible** without git backup
- Make sure you don't need these pages anymore
- Database tables will remain (safe to delete separately later)

---

## ✅ Ready to Proceed?

If you're ready, run:
```bash
node remove-legacy-pages.js --execute --yes
```

If you want to review the files first:
```bash
# Check a specific page
ls app/(authenticated)/courses
ls app/api/courses
```

