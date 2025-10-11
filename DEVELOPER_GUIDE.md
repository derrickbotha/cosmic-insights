# Developer Quick Reference

## 🚀 Quick Start

```bash
cd "c:\Users\dbmos\OneDrive\Documents\Astrology App\Astrology V1.1"
npm install
npm start
```

App runs at: http://localhost:3000

## 📁 Key Files

### Components
- `src/components/Questionnaire.jsx` - 9-section user data collection
- `src/components/CrystalRecommendations.jsx` - Crystal prescription system
- `src/components/Dashboard.jsx` - Life season analysis
- `src/components/PatternRecognition.jsx` - Pattern analysis with 8 categories
- `src/components/Journal.jsx` - Daily journaling with AI prompts
- `src/components/GoalTracker.jsx` - Goal tracking with milestones
- `src/components/AIChatInterface.jsx` - Real-time AI chat

### Configuration
- `src/config/questionnaire.js` - 70+ questions across 9 sections
- `src/config/crystalRecommendations.js` - Crystal database and analysis logic
- `src/config/patternCategories.js` - 8 categories with 40 questions
- `src/config/advancedPrompts.js` - 7 AI prompt templates
- `src/config/aiModels.js` - Claude Sonnet 4 configuration

### Services
- `src/services/aiService.js` - AI interaction layer

### Main App
- `src/App.jsx` - Main app with navigation and routing
- `src/index.jsx` - App entry point
- `src/index.css` - Tailwind imports

## 🔧 Common Tasks

### Add New Question to Questionnaire
1. Edit `src/config/questionnaire.js`
2. Add question object to appropriate section:
```javascript
{
  id: 10,
  text: "Your question?",
  type: "textarea", // or "text", "select", "date"
  placeholder: "Your answer...",
  subtext: "Optional clarification",
  examples: "Optional examples"
}
```

### Add New Crystal
1. Edit `src/config/crystalRecommendations.js`
2. Add to appropriate planetary or focus category:
```javascript
{
  name: 'Crystal Name',
  properties: 'Main properties',
  chakra: 'Associated Chakra',
  use: 'How to use it'
}
```

### Add New Pattern Category
1. Edit `src/config/patternCategories.js`
2. Add new category:
```javascript
newCategory: {
  name: 'Category Name',
  description: 'What this reveals',
  questions: [ /* 5 question objects */ ]
}
```

### Add New AI Prompt
1. Edit `src/config/advancedPrompts.js`
2. Add new prompt template:
```javascript
newPrompt: {
  name: 'Prompt Name',
  description: 'What it does',
  systemMessage: 'System instructions',
  userMessageTemplate: 'Template with {variables}'
}
```

### Change App Navigation
1. Edit `src/App.jsx`
2. Update `currentPage` state and `renderPage()` function
3. Add new nav button in header

## 💾 Data Persistence

### LocalStorage Keys
- `questionnaireAnswers` - Current questionnaire progress
- `questionnaireCurrentSection` - Current section number
- `questionnaireCompleted` - Completed sections array
- `userQuestionnaire` - Completed questionnaire data
- `journalEntries` - All journal entries
- `goals` - All tracked goals

### Data Structure
```javascript
// User Data
{
  questionnaireAnswers: { section1_1: "answer", ... },
  astrology: { sunSign, moonSign, risingSign, ... },
  personalHistory: { childhood: {}, adolescence: {}, adulthood: {} },
  currentState: { energetic, intuitive, ... },
  journalInsights: { emotionalKeywords: [], recurringThemes: [], ... },
  focusCategory: 'career' | 'emotionalHealing' | ...
}

// Journal Entry
{
  id: timestamp,
  date: ISO string,
  prompt: string,
  entry: string,
  mood: string,
  moonPhase: string,
  aiInsights: string (optional)
}

// Goal
{
  id: timestamp,
  title: string,
  category: string,
  why: string,
  timeline: string,
  milestones: [{ id, text, completed, completedDate }],
  createdAt: ISO string
}
```

## 🎨 Styling

### Tailwind Custom Colors
```javascript
primary: "#192ae6"        // Main brand color
background-light: "#f6f6f8"
background-dark: "#111221"
foreground-light: "#111827"
foreground-dark: "#f9fafb"
```

### Dark Mode
Use Tailwind's dark mode classes:
```jsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

Toggle in `src/App.jsx`:
```javascript
const [darkMode, setDarkMode] = useState(false);
```

## 🔮 Crystal System API

### Analyze User Data
```javascript
import { analyzeCrystalNeeds } from '../config/crystalRecommendations';

const recommendations = analyzeCrystalNeeds({
  astrology: { sunSign, moonSign, risingSign, dominantPlanets },
  journalInsights: { emotionalKeywords, recurringThemes, dominantEmotion },
  focusCategory: 'career' // or other category
});

// Returns:
{
  primary: [{ crystal, reason, category }, ...],
  supportive: [{ crystal, reason, category }, ...],
  explanation: "Personalized explanation text",
  rituals: [{ name, description, timing, crystals }, ...]
}
```

### Get Crystal Info
```javascript
import { getCrystalInfo } from '../config/crystalRecommendations';

const info = getCrystalInfo('Rose Quartz');
// Returns: { name, properties, chakra, use, planetaryAffinity }
```

## 🤖 AI Service API

### Initialize Service
```javascript
import AIService from '../services/aiService';

const aiService = new AIService();
aiService.setModel('claudeSonnet4');
```

### Generate Response
```javascript
const response = await aiService.generateResponse(
  promptTemplate,
  userData
);
```

### Specific Methods
```javascript
// Cosmic profile
const profile = await aiService.generateCosmicProfile(userData);

// Journal analysis
const analysis = await aiService.analyzeJournalEntries(entries);

// Aligned goals
const goals = await aiService.generateAlignedGoals(userData, focusArea);
```

## 📝 Component Props

### Questionnaire
```jsx
<Questionnaire 
  onComplete={(data) => {}}  // Called when completed
  initialData={userData}      // Pre-fill with existing data
/>
```

### CrystalRecommendations
```jsx
<CrystalRecommendations 
  userData={userData}  // Full user data object
/>
```

### Dashboard
```jsx
<Dashboard 
  userData={userData}
  isPaidMember={boolean}
  hasUsedFreeReading={boolean}
/>
```

### PatternRecognition
```jsx
<PatternRecognition 
  userData={userData}
/>
```

### Journal
```jsx
<Journal 
  userData={userData}
/>
```

### GoalTracker
```jsx
<GoalTracker 
  userData={userData}
/>
```

### AIChatInterface
```jsx
<AIChatInterface 
  userData={userData}
/>
```

## 🐛 Debugging

### Check localStorage
```javascript
// In browser console
console.log(localStorage.getItem('userQuestionnaire'));
console.log(localStorage.getItem('journalEntries'));
console.log(localStorage.getItem('goals'));

// Clear all data
localStorage.clear();
```

### Common Issues

**Problem**: Questionnaire not saving
**Solution**: Check localStorage quota, clear old data

**Problem**: Crystals not showing
**Solution**: Ensure userData has astrology object with sunSign, moonSign

**Problem**: Navigation not working
**Solution**: Check currentPage state in App.jsx

**Problem**: Dark mode not working
**Solution**: Verify `darkMode` class on root div in App.jsx

## 🔄 State Management

Currently using React hooks (useState, useEffect). No Redux or Context API.

### Global State (App.jsx)
```javascript
const [userData, setUserData] = useState(null);
const [darkMode, setDarkMode] = useState(false);
const [currentPage, setCurrentPage] = useState('questionnaire');
const [isPaidMember, setIsPaidMember] = useState(false);
const [hasUsedFreeReading, setHasUsedFreeReading] = useState(false);
const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
```

### Component State
Each component manages its own local state (forms, modals, loading, etc.)

## 🚢 Deployment Checklist

- [ ] Replace localStorage with backend API
- [ ] Implement real Claude Sonnet 4 API integration
- [ ] Add user authentication (Auth0, Firebase, or custom)
- [ ] Set up payment system (Stripe)
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Configure production build
- [ ] Add analytics (Google Analytics, Mixpanel)
- [ ] Set up error tracking (Sentry)
- [ ] Add rate limiting for API calls
- [ ] Implement data backup system
- [ ] Create privacy policy and terms of service

## 📊 Testing

Currently no tests. To add:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Example test:
```javascript
import { render, screen } from '@testing-library/react';
import Questionnaire from './components/Questionnaire';

test('renders questionnaire title', () => {
  render(<Questionnaire />);
  const title = screen.getByText(/Cosmic Profile Questionnaire/i);
  expect(title).toBeInTheDocument();
});
```

## 🔐 Security Notes

- Never commit API keys (use .env)
- Sanitize user inputs before AI prompts
- Validate all form data
- Implement CSRF protection
- Use HTTPS in production
- Add rate limiting
- Implement proper authentication
- Encrypt sensitive data

## 📈 Performance Optimization

Current optimizations:
- React.memo for expensive components
- Lazy loading for routes
- Auto-save debouncing
- LocalStorage caching

Future optimizations:
- Code splitting with React.lazy
- Image optimization
- Service workers for offline mode
- CDN for static assets

## 🆘 Support

For questions or issues:
1. Check IMPLEMENTATION_SUMMARY.md
2. Check CRYSTAL_GUIDE.md
3. Review component code
4. Check browser console for errors
5. Clear localStorage and test fresh

---

**Happy coding!** 🚀✨
