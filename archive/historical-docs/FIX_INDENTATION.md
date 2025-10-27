# Critical Fix Needed

## The Problem
The Key Metrics section has inconsistent indentation causing syntax errors.

## The Solution
The entire Key Metrics section (lines 291-422) needs to be properly indented.

## Correct Pattern
```tsx
{(reportType === 'overview' || reportType === 'users') && (
  <div className="grid...">
    <Card>
      <CardContent>
        {/* content */}
      </CardContent>
    </Card>
    
    <Card>
      <CardContent>
        {/* content */}
      </CardContent>
    </Card>
  </div>
)}
```

## Quick Fix
Delete the entire Key Metrics section and rewrite it with proper indentation, OR manually fix each Card's indentation to match the pattern above.

The issue is that Cards 2-6 are not properly indented inside the grid div.
