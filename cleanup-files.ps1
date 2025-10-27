# XEN TradeHub - File Cleanup Script
# This script archives historical documentation and test files

Write-Host "=== XEN TradeHub File Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# Create archive directories if they don't exist
if (!(Test-Path "archive\historical-docs")) {
    New-Item -ItemType Directory -Path "archive\historical-docs" | Out-Null
    Write-Host "Created archive\historical-docs" -ForegroundColor Green
}

if (!(Test-Path "archive\test-scripts")) {
    New-Item -ItemType Directory -Path "archive\test-scripts" | Out-Null
    Write-Host "Created archive\test-scripts" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Moving historical documentation files..." -ForegroundColor Yellow

# Historical documentation patterns
$docPatterns = @(
    "AFFILIATE_*.md",
    "ACADEMY_*.md",
    "ADMIN_*.md",
    "BANNER_*.md",
    "COPY_TRADING_*.md",
    "MONTHLY_CHALLENGE_*.md",
    "REPORT_*.md",
    "REPORTS_*.md",
    "NOTIFICATION_*.md",
    "TESTING_COMPLETE.md",
    "MOBILE_RESPONSIVE_COMPLETE.md",
    "SYNTAX_ERROR_FIX.md",
    "WHITE_SCREEN_FINAL_FIX.md",
    "CURRENT_STATUS.md",
    "APOLOGY_AND_NEXT_STEPS.md"
)

foreach ($pattern in $docPatterns) {
    Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "archive\historical-docs\" -Force
        Write-Host "Moved: $($_.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "Step 1 Complete!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Moving test and development scripts..." -ForegroundColor Yellow

# Test and development script patterns
$scriptPatterns = @(
    "test-*.js",
    "test-*.ts",
    "test-*.html",
    "check-*.js",
    "verify-*.js",
    "verify-*.mjs",
    "debug-*.html",
    "debug.css",
    "fix-*.js",
    "reset-*.js",
    "restore-*.js",
    "seed-*.js",
    "setup-*.js",
    "simple-*.js",
    "submit-*.js",
    "create-*.js",
    "downgrade-*.js",
    "final-*.js",
    "test-*.sql"
)

foreach ($pattern in $scriptPatterns) {
    Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "archive\test-scripts\" -Force
        Write-Host "Moved: $($_.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "Step 2 Complete!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Moving additional historical docs..." -ForegroundColor Yellow

# Additional historical docs
$additionalDocs = @(
    "AUTHENTICATION_FIX.md",
    "CHANGES_COMPLETE.md",
    "COMMISSION_WORKFLOW_FIXED.md",
    "DASHBOARD_UPDATE.md",
    "EXPORT_FUNCTIONALITY_COMPLETE.md",
    "FEATURES_PERMISSIONS_SYSTEM.md",
    "FILTER_*.md",
    "FINAL_*.md",
    "FIX_*.md",
    "INDENTATION_FIX_COMPLETE.md",
    "NAVIGATION_UPDATE.md",
    "REFACTOR_*.md",
    "REVENUE_CALCULATION_FIX.md",
    "TABBED_INTERFACE_COMPLETE.md",
    "RECURRING_SESSIONS_GUIDE.md",
    "CHECK_SYNTAX.md",
    "QUICK_FIX_INSTRUCTIONS.md",
    "CRITICAL_FIX_INSTRUCTIONS.md",
    "TEST_FILTERS_NOW.md",
    "TEST_REPORT.md",
    "SEEDED_DATA.md"
)

foreach ($doc in $additionalDocs) {
    Get-ChildItem -Path . -Filter $doc -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "archive\historical-docs\" -Force
        Write-Host "Moved: $($_.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "Step 3 Complete!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Moving HTML test files..." -ForegroundColor Yellow

# HTML test files
$htmlFiles = @(
    "test-*.html",
    "test-admin-*.html"
)

foreach ($pattern in $htmlFiles) {
    Get-ChildItem -Path . -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "archive\test-scripts\" -Force
        Write-Host "Moved: $($_.Name)" -ForegroundColor DarkGray
    }
}

# Move specific HTML files
if (Test-Path "test-admin-page.html") {
    Move-Item "test-admin-page.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-admin-panel.html") {
    Move-Item "test-admin-panel.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-broker-flow.html") {
    Move-Item "test-broker-flow.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-css-vars.html") {
    Move-Item "test-css-vars.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-expiry-ui.html") {
    Move-Item "test-expiry-ui.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-login.html") {
    Move-Item "test-login.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-mentorship-ui.html") {
    Move-Item "test-mentorship-ui.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-simple-market.html") {
    Move-Item "test-simple-market.html" -Destination "archive\test-scripts\" -Force
}
if (Test-Path "test-theme.html") {
    Move-Item "test-theme.html" -Destination "archive\test-scripts\" -Force
}

Write-Host "Step 4 Complete!" -ForegroundColor Green
Write-Host ""

# Count files moved
$historicalCount = (Get-ChildItem "archive\historical-docs" -Recurse -File | Measure-Object).Count
$scriptsCount = (Get-ChildItem "archive\test-scripts" -Recurse -File | Measure-Object).Count

Write-Host ""
Write-Host "=== Cleanup Complete! ===" -ForegroundColor Green
Write-Host "Historical Docs Archived: $historicalCount files" -ForegroundColor Cyan
Write-Host "Test Scripts Archived: $scriptsCount files" -ForegroundColor Cyan
Write-Host ""
Write-Host "Root directory is now clean with only essential files." -ForegroundColor Yellow
Write-Host ""

