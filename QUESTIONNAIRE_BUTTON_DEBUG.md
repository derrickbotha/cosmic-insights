# Questionnaire Button Navigation Debug Guide

## Problem
The "Start Questionnaire" button in the Crystal Recommendations page needs to navigate to the Questionnaire component.

## Solution Implemented

### Changes Made:

1. **CrystalRecommendations.jsx** - Enhanced button with debug logging:
```jsx
<button 
  onClick={() => {
    console.log('Button clicked! onNavigate:', onNavigate);
    if (onNavigate) {
      console.log('Navigating to questionnaire...');
      onNavigate('questionnaire');
    } else {
      console.error('onNavigate function not provided!');
    }
  }}
  className="px-8 py-4 bg-primary border-2 border-primary text-white rounded-lg font-medium hover:shadow-soft-lg transition-all transform hover:scale-105 cursor-pointer"
>
  Start Questionnaire
</button>
```

2. **CrystalRecommendations.jsx** - Added mount logging:
```jsx
useEffect(() => {
  console.log('CrystalRecommendations mounted/updated');
  console.log('userData:', userData);
  console.log('onNavigate function:', onNavigate);
}, [userData, onNavigate]);
```

3. **App.jsx** - Enhanced navigation handler with logging:
```jsx
case 'crystals':
  return <CrystalRecommendations 
    userData={userData} 
    onNavigate={(page) => {
      console.log('App.jsx: Navigating to:', page);
      setCurrentPage(page);
    }} 
  />;
```

## How to Test

### Step 1: Open Browser Console
The console is already visible in your DevTools (right side of screenshot).

### Step 2: Navigate to Crystal Page
Click "Crystals" in the left sidebar navigation.

### Step 3: Check Console Messages
You should see:
```
CrystalRecommendations mounted/updated
userData: null (or object if questionnaire completed)
onNavigate function: function(page) { ... }
```

### Step 4: Click "Start Questionnaire" Button
You should see:
```
Button clicked! onNavigate: function(page) { ... }
Navigating to questionnaire...
App.jsx: Navigating to: questionnaire
```

### Step 5: Verify Navigation
The page should switch to the Questionnaire component with:
- Title: "Cosmic Profile Questionnaire"
- Section navigation on the left
- Questions on the right
- Progress indicator at the top

## Expected Flow

```
User clicks "Start Questionnaire" button
     ↓
CrystalRecommendations.jsx: onClick handler fires
     ↓
Calls: onNavigate('questionnaire')
     ↓
App.jsx: Navigation handler receives 'questionnaire'
     ↓
Calls: setCurrentPage('questionnaire')
     ↓
App.jsx: renderPage() switch statement
     ↓
Returns: <Questionnaire /> component
     ↓
Page updates to show Questionnaire
```

## Troubleshooting

### If button doesn't respond:
1. Check if button is rendered: Inspect element in DevTools
2. Check if onClick is attached: Look for event listeners in DevTools
3. Check for JavaScript errors: Look in Console tab

### If navigation doesn't work:
1. Verify console shows all 3 log messages
2. Check if `setCurrentPage` is being called
3. Verify `currentPage` state is updating in React DevTools

### If page doesn't update:
1. Check React DevTools for state changes
2. Verify `renderPage()` is being called with new value
3. Check if there's a conditional render blocking the update

## Current Status

✅ Button onClick handler implemented
✅ Navigation prop passed from App.jsx
✅ Debug logging added at all levels
✅ Cursor pointer added for visual feedback
✅ Button styling enhanced

The button should now work! Test by clicking it and watching the console output.

## What the Button Does

When clicked, the button will:
1. Navigate from the "Crystals" page to the "Questionnaire" page
2. This allows users who haven't completed their profile to start the questionnaire
3. Once completed, they'll have `userData` populated and see actual crystal recommendations

## Files Modified

- `src/components/CrystalRecommendations.jsx` - Added debug logging and enhanced button
- `src/App.jsx` - Added debug logging to navigation handler

## Next Steps

After testing:
1. If working correctly, you can remove the console.log statements
2. If not working, check the console output and follow troubleshooting steps
3. Report any error messages you see

---

**Generated:** October 14, 2025
**Status:** Ready for testing
