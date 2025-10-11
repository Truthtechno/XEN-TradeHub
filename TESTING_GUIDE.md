# Testing Guide - Signals & Forecasts System

## 🎯 Test Data Created

### **Users:**
- **Admin User**: `admin@corefx.com` (SUPERADMIN role)
- **Student User**: `student@test.com` (STUDENT role, no subscription)
- **Subscribed Student**: `subscribed@test.com` (STUDENT role, with active subscription)

### **Signals:**
1. **EUR/USD BUY** - Premium (SUBSCRIBERS_ONLY)
2. **GBP/USD SELL** - Public (PUBLIC)
3. **USD/JPY BUY** - Premium (SUBSCRIBERS_ONLY)

### **Forecasts:**
1. **EUR/USD Bullish Setup** - Public
2. **GBP/USD Bearish Analysis** - Public
3. **BTC/USD Market Update** - Public
4. **USD/JPY Premium Analysis** - Premium (Private)
5. **Gold (XAU/USD) Premium Forecast** - Premium (Private)

## 🧪 Testing Scenarios

### **1. Admin Panel Testing**

#### **Access Admin Panel:**
1. Go to `http://localhost:3000/admin/signals`
2. Login as `admin@corefx.com`
3. You should see:
   - **Stats Cards**: Total users, subscribers, forecasts, engagement
   - **Two Tabs**: "Trading Signals" and "Market Forecasts"
   - **Signals Table**: Shows all 3 signals with visibility badges
   - **Forecasts Section**: Shows all 5 forecasts with public/premium badges

#### **Test Signal Management:**
1. In "Trading Signals" tab, verify you can see:
   - EUR/USD (Premium - Purple badge)
   - GBP/USD (Public - Blue badge)
   - USD/JPY (Premium - Purple badge)
2. Test the dropdown actions on each signal
3. Verify subscriber counts and engagement metrics

#### **Test Forecast Management:**
1. Switch to "Market Forecasts" tab
2. Verify you can see all 5 forecasts
3. Check that premium forecasts show "Premium" badge
4. Test the dropdown actions (Edit, Make Public/Premium, Delete)
5. Verify engagement metrics (views, likes, comments)

### **2. Student User Testing (Non-Subscribed)**

#### **Access Signals Page:**
1. Go to `http://localhost:3000/signals`
2. Login as `student@test.com`
3. You should see:
   - Clean subscription page with "$50/month" and "Subscribe Now" button
   - No forecast tabs on main page
   - "Who this is for" and "What You Get" sections

#### **Test Right Panel (Public Forecasts):**
1. Click the "Forecast" button in the top right
2. Right panel should open with "Market Forecasts"
3. Click "Public Forecasts" tab (should be active by default)
4. Verify you can see 3 public forecasts:
   - EUR/USD Bullish Setup
   - GBP/USD Bearish Analysis
   - BTC/USD Market Update

#### **Test Right Panel (Premium Forecasts):**
1. Click "Premium Forecasts" tab
2. Should show subscription prompt with lock icon
3. Should display "Premium Content" message
4. Should encourage subscription

### **3. Subscribed Student Testing**

#### **Access Signals Page:**
1. Go to `http://localhost:3000/signals`
2. Login as `subscribed@test.com`
3. You should see:
   - "Premium Member" status
   - "Market Forecasts →" button instead of "Subscribe Now"

#### **Test Right Panel (All Forecasts):**
1. Click "Market Forecasts →" button
2. Right panel should open
3. Test both tabs:
   - **Public Forecasts**: Should show 3 public forecasts
   - **Premium Forecasts**: Should show 2 premium forecasts
     - USD/JPY Premium Analysis
     - Gold (XAU/USD) Premium Forecast

### **4. Subscription Flow Testing**

#### **Test Subscription Process:**
1. As non-subscribed user, click "Subscribe Now"
2. Subscription popup should open
3. Complete the subscription process
4. After subscription, page should update to show "Premium Member" status
5. "Market Forecasts" button should become available

### **5. Content Visibility Testing**

#### **Verify Access Control:**
1. **Non-subscribed users** should only see:
   - Public signals and forecasts
   - Subscription prompts for premium content
2. **Subscribed users** should see:
   - All public content
   - All premium content
   - No subscription prompts

#### **Test Admin Comments:**
1. In the right panel, check forecast comments
2. Admin comments should be highlighted differently
3. Regular user comments should appear normal

## 🔍 Key Features to Verify

### **Admin Panel:**
- ✅ Dual management (Signals + Forecasts)
- ✅ Real-time statistics
- ✅ Visibility management (Public/Premium)
- ✅ Engagement tracking
- ✅ Professional interface

### **User Experience:**
- ✅ Clean main page (no forecast clutter)
- ✅ Functional "Market Forecasts" button
- ✅ Working tabs in right panel
- ✅ Subscription-based access control
- ✅ Responsive design

### **Content Management:**
- ✅ Public content visible to all
- ✅ Premium content gated by subscription
- ✅ Real-time data fetching
- ✅ Interactive elements (likes, comments)
- ✅ Professional styling

## 🚀 Expected Results

### **Admin View:**
- Complete control over all content
- Real-time analytics and engagement metrics
- Easy content management interface

### **Non-Subscribed User:**
- Clean subscription-focused main page
- Access to public content only
- Clear upgrade prompts for premium content

### **Subscribed User:**
- Premium member status display
- Access to all content (public + premium)
- Seamless user experience

## 🐛 Troubleshooting

### **If Premium Tab Still Unresponsive:**
1. Check browser console for errors
2. Verify the button click handler is working
3. Ensure subscription status is being detected correctly

### **If Content Not Loading:**
1. Check API endpoints are working
2. Verify database connection
3. Check authentication status

### **If Subscription Not Working:**
1. Verify subscription data in database
2. Check subscription detection logic
3. Test with different user accounts

The system should now provide a complete, professional forex trading platform experience with proper content management and user access control.
