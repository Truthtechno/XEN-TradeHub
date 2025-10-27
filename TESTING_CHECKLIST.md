# XEN TradeHub Testing Checklist

## 🧪 Testing Status

### Prerequisites
- ✅ Dev server running on http://localhost:3000
- ✅ Database seeded with sample data
- ✅ 3 Brokers created (Exness, HFM, Equity)
- ✅ 3 Master Traders created
- ✅ Test user has affiliate program

---

## 👤 USER TESTING

### 1. Authentication & Navigation
- [ ] Login as regular user
- [ ] Verify sidebar shows new navigation items:
  - [ ] Dashboard
  - [ ] Trade Through Us
  - [ ] Copy Trading
  - [ ] Academy
  - [ ] Market Analysis
  - [ ] Earn With Us
  - [ ] Notifications
- [ ] Test mobile responsiveness (sidebar collapse/expand)
- [ ] Verify dark mode toggle works

### 2. Trade Through Us (/brokers)
- [ ] **Page Load**
  - [ ] Page loads without errors
  - [ ] Loading spinner shows while fetching data
  - [ ] 3 broker cards display correctly
  - [ ] Broker logos display (or fallback icon)
  - [ ] Benefits list shows for each broker
  
- [ ] **Broker Cards**
  - [ ] Each card shows: name, description, benefits
  - [ ] "Trusted Partner" badge displays
  - [ ] "Open Account" button visible on each card
  - [ ] Cards are responsive (1 col mobile, 2 col tablet, 3 col desktop)
  
- [ ] **Account Opening Form**
  - [ ] Click "Open Account" opens dialog
  - [ ] Dialog shows broker name in title
  - [ ] Form pre-fills user name and email
  - [ ] All fields are editable
  - [ ] Phone field accepts phone numbers
  - [ ] Account ID field is optional
  - [ ] Submit button shows "Submitting..." when processing
  - [ ] Success toast appears after submission
  - [ ] Broker referral link opens in new tab
  - [ ] Dialog closes after successful submission
  - [ ] Form resets after submission
  
- [ ] **Error Handling**
  - [ ] Test with network offline - shows error toast
  - [ ] Empty required fields show validation
  - [ ] Invalid email format rejected

### 3. Copy Trading (/copy-trading)
- [ ] **Page Load**
  - [ ] Page loads without errors
  - [ ] Loading spinner shows while fetching
  - [ ] 3 trader cards display correctly
  - [ ] Trader avatars display
  
- [ ] **Trader Cards**
  - [ ] Each card shows: name, description, avatar
  - [ ] Profit percentage displays with correct color (green/red)
  - [ ] Risk level badge shows with correct color:
    - [ ] Low = Green
    - [ ] Medium = Yellow
    - [ ] High = Red
  - [ ] Follower count displays
  - [ ] Min investment amount shows
  - [ ] Strategy description visible
  - [ ] Cards are responsive
  
- [ ] **Subscription Form**
  - [ ] Click "Start Copying" opens dialog
  - [ ] Dialog shows trader name
  - [ ] Investment amount field accepts numbers
  - [ ] Min investment validation works
  - [ ] Potential earnings calculator shows
  - [ ] Submit button disabled when amount < minimum
  - [ ] Success toast appears after subscription
  - [ ] Copy link opens in new tab (if available)
  - [ ] Dialog closes after submission
  - [ ] Form resets after submission
  
- [ ] **Error Handling**
  - [ ] Amount below minimum shows error
  - [ ] Invalid amount (negative, text) rejected
  - [ ] Network error shows toast

### 4. Earn With Us (/affiliates)
- [ ] **Not Registered State**
  - [ ] Shows "Join Our Affiliate Program" section
  - [ ] Benefits cards display (4 cards)
  - [ ] Commission tiers table shows
  - [ ] "Become an Affiliate" button visible
  
- [ ] **Registration**
  - [ ] Click "Become an Affiliate" button
  - [ ] Loading state shows during registration
  - [ ] Success toast appears
  - [ ] Page updates to show affiliate dashboard
  
- [ ] **Registered State (Affiliate Dashboard)**
  - [ ] Affiliate code displays
  - [ ] Referral link shows correctly
  - [ ] Copy button works and shows toast
  - [ ] Copy button shows checkmark briefly
  - [ ] Stats cards display:
    - [ ] Total Earnings
    - [ ] Pending Earnings
    - [ ] Total Referrals
    - [ ] Commission Rate
  - [ ] Current tier badge shows with correct color
  - [ ] Tier progress bar displays
  - [ ] Commission structure table shows
  
- [ ] **Responsive Design**
  - [ ] Stats cards stack on mobile
  - [ ] Referral link input responsive
  - [ ] Tables scroll on mobile

---

## 👨‍💼 ADMIN TESTING

### 5. Admin Navigation
- [ ] Login as admin user
- [ ] Verify admin sidebar shows:
  - [ ] Dashboard
  - [ ] Users
  - [ ] **Brokers** (NEW)
  - [ ] **Copy Trading** (NEW)
  - [ ] Signals
  - [ ] Market Analysis
  - [ ] Courses
  - [ ] Resources
  - [ ] Events
  - [ ] Academy
  - [ ] **Affiliates** (NEW)
  - [ ] Notifications
  - [ ] Settings
  - [ ] Reports

### 6. Broker Management (/admin/brokers)
- [ ] **Page Load**
  - [ ] Page loads without errors
  - [ ] Stats cards show correct counts
  - [ ] Brokers table displays all brokers
  - [ ] "Add Broker" button visible
  - [ ] "Account Requests" button shows count
  
- [ ] **Brokers Table**
  - [ ] Shows: name, description, link, requests, status, order
  - [ ] Logos display correctly
  - [ ] Referral links are clickable
  - [ ] Active/Inactive badges show correctly
  - [ ] Edit button on each row
  - [ ] Delete button on each row
  
- [ ] **Create Broker**
  - [ ] Click "Add Broker" opens dialog
  - [ ] All form fields present and working
  - [ ] Benefits field accepts multi-line input
  - [ ] Display order field accepts numbers
  - [ ] Active toggle works
  - [ ] Submit creates broker
  - [ ] Success toast appears
  - [ ] Table updates with new broker
  - [ ] Dialog closes
  
- [ ] **Edit Broker**
  - [ ] Click edit button opens dialog
  - [ ] Form pre-fills with broker data
  - [ ] Benefits show as multi-line text
  - [ ] Can modify all fields
  - [ ] Submit updates broker
  - [ ] Success toast appears
  - [ ] Table updates
  
- [ ] **Delete Broker**
  - [ ] Click delete shows confirmation
  - [ ] Cancel keeps broker
  - [ ] Confirm deletes broker
  - [ ] Success toast appears
  - [ ] Table updates
  
- [ ] **Account Opening Requests**
  - [ ] Click "Account Requests" toggles panel
  - [ ] Panel shows all account requests
  - [ ] Shows: user, broker, contact, account ID, status, date
  - [ ] Pending requests show Approve/Reject buttons
  - [ ] Approve button updates status
  - [ ] Reject button updates status
  - [ ] Success toast on status change
  - [ ] Table updates after action

### 7. Copy Trading Management (/admin/copy-trading)
- [ ] **Page Load**
  - [ ] Page loads without errors
  - [ ] 4 stats cards display correct data
  - [ ] Traders table shows all traders
  - [ ] "Add Trader" button visible
  - [ ] "Subscriptions" button shows count
  
- [ ] **Traders Table**
  - [ ] Shows: trader, performance, risk, followers, min investment, status
  - [ ] Avatars display correctly
  - [ ] Profit % shows with correct color
  - [ ] Risk badges show correct colors
  - [ ] Edit and Delete buttons work
  
- [ ] **Create Trader**
  - [ ] Click "Add Trader" opens dialog
  - [ ] All fields present
  - [ ] Profit % accepts decimals
  - [ ] Risk level dropdown works
  - [ ] Min investment accepts numbers
  - [ ] Submit creates trader
  - [ ] Success toast appears
  - [ ] Table updates
  
- [ ] **Edit Trader**
  - [ ] Edit button opens dialog with data
  - [ ] Can modify all fields
  - [ ] Submit updates trader
  - [ ] Table refreshes
  
- [ ] **Delete Trader**
  - [ ] Confirmation dialog shows
  - [ ] Delete removes trader
  - [ ] Success toast appears
  
- [ ] **Subscriptions Panel**
  - [ ] Click "Subscriptions" toggles panel
  - [ ] Shows all subscriptions
  - [ ] Displays: user, trader, investment, status, date
  - [ ] Active subscriptions show Pause button
  - [ ] Paused subscriptions show Resume button
  - [ ] Cancel button always available
  - [ ] Status updates work
  - [ ] Success toast on action

### 8. Affiliate Management (/admin/affiliates)
- [ ] **Page Load**
  - [ ] Page loads without errors
  - [ ] 4 stats cards show correct totals
  - [ ] Affiliates table displays all programs
  - [ ] "Payouts" and "Referrals" buttons show counts
  
- [ ] **Affiliates Table**
  - [ ] Shows: affiliate, code, tier, commission, referrals, pending, paid, status
  - [ ] Tier badges show correct colors
  - [ ] Tier dropdown works for each affiliate
  - [ ] Changing tier updates commission rate
  - [ ] "Pay Out" button shows when pending > 0
  - [ ] Activate/Deactivate button works
  - [ ] Success toast on updates
  
- [ ] **Create Payout**
  - [ ] Click "Pay Out" opens dialog
  - [ ] Amount pre-fills with pending earnings
  - [ ] Payment method dropdown works
  - [ ] Notes field accepts text
  - [ ] Submit creates payout
  - [ ] Success toast appears
  - [ ] Pending earnings decrease
  - [ ] Payouts panel updates
  
- [ ] **Payouts Panel**
  - [ ] Click "Payouts" toggles panel
  - [ ] Shows all payouts
  - [ ] Displays: affiliate, amount, method, transaction ID, status, date
  - [ ] Pending payouts show "Mark Paid" and "Reject" buttons
  - [ ] "Mark Paid" prompts for transaction ID
  - [ ] Status updates correctly
  - [ ] Paid earnings increase when marked complete
  - [ ] Success toast on action
  
- [ ] **Referrals Panel**
  - [ ] Click "Referrals" toggles panel
  - [ ] Shows all referrals
  - [ ] Displays: affiliate code, referred user, status, dates
  - [ ] Status badges show correctly

---

## 🔧 TECHNICAL TESTING

### 9. API Routes
- [ ] **User APIs**
  - [ ] GET /api/brokers returns active brokers
  - [ ] POST /api/brokers/open-account creates request
  - [ ] GET /api/copy-trading/traders returns traders
  - [ ] POST /api/copy-trading/subscribe creates subscription
  - [ ] GET /api/affiliates/program returns user's program
  - [ ] POST /api/affiliates/register creates program
  
- [ ] **Admin APIs**
  - [ ] All broker admin routes work
  - [ ] All copy-trading admin routes work
  - [ ] All affiliate admin routes work
  - [ ] Proper authorization checks (403 for non-admins)

### 10. Database
- [ ] All new tables exist
- [ ] Relations work correctly
- [ ] Cascade deletes work
- [ ] Unique constraints enforced

### 11. Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Invalid data rejected with clear errors
- [ ] Loading states show during async operations
- [ ] Empty states display when no data

### 12. Performance
- [ ] Pages load quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images load efficiently

---

## 📱 RESPONSIVE DESIGN

### 13. Mobile (< 768px)
- [ ] Sidebar collapses to hamburger menu
- [ ] Cards stack vertically
- [ ] Tables scroll horizontally
- [ ] Forms are usable
- [ ] Buttons are tappable

### 14. Tablet (768px - 1024px)
- [ ] 2-column layouts work
- [ ] Navigation accessible
- [ ] Forms well-spaced

### 15. Desktop (> 1024px)
- [ ] 3-column layouts display
- [ ] Full sidebar visible
- [ ] Optimal spacing

---

## 🎨 UI/UX

### 16. Visual Consistency
- [ ] Colors match theme
- [ ] Typography consistent
- [ ] Spacing uniform
- [ ] Icons appropriate

### 17. Accessibility
- [ ] Form labels present
- [ ] Buttons have clear text
- [ ] Contrast ratios adequate
- [ ] Keyboard navigation works

---

## ✅ FINAL CHECKS

- [ ] No console errors in browser
- [ ] No TypeScript errors in IDE
- [ ] All toasts appear and disappear correctly
- [ ] All dialogs open and close properly
- [ ] All forms validate correctly
- [ ] All buttons respond to clicks
- [ ] All links navigate correctly
- [ ] Dark mode works throughout
- [ ] Data persists correctly in database

---

## 🐛 BUGS FOUND

### Critical
- None found yet

### Major
- None found yet

### Minor
- None found yet

---

## 📝 NOTES

- Test data seeded successfully
- All pages render without errors
- Forms have proper validation
- API routes have authentication
- Responsive design implemented
