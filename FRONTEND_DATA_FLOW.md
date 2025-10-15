# 📊 Frontend Data Collection & Display Documentation

**Cosmic Insights - Complete Frontend Data Flow Analysis**  
**Generated**: October 15, 2025  
**Version**: 1.1  

---

## 🎯 Executive Summary

This document provides a comprehensive analysis of all data collection points and user-facing displays in the Cosmic Insights frontend application. It covers **16 major components**, detailing what data is collected, where it's stored, how it's processed, and what insights are displayed to users.

### Key Statistics
- **Components Analyzed**: 16
- **Data Collection Points**: 47
- **LocalStorage Keys**: 12
- **API Endpoints Called**: 20+
- **User Input Fields**: 200+

---

## 📑 Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Questionnaire System](#2-questionnaire-system)
3. [Profile Management](#3-profile-management)
4. [Dashboard & Insights](#4-dashboard--insights)
5. [Feature Components](#5-feature-components)
6. [Admin & Monitoring](#6-admin--monitoring)
7. [Payment & Subscriptions](#7-payment--subscriptions)
8. [Settings & Preferences](#8-settings--preferences)
9. [Data Storage Summary](#9-data-storage-summary)
10. [Privacy & Security](#10-privacy--security)

---

## 1. Authentication & User Management

### 1.1 Landing Page (Login/Registration)

**Component**: `src/components/LandingPage.jsx`

#### Data Collected

**Registration Form**:
```javascript
{
  name: String,           // Full name
  username: String,       // Unique username
  email: String,          // Email address
  password: String,       // Password (min 8 chars)
  confirmPassword: String // Password confirmation
}
```

**Login Form**:
```javascript
{
  email: String,    // Email address
  password: String  // Password
}
```

#### API Endpoints

**Registration**:
- **POST** `/api/auth/register`
- **Body**: `{ name, username, email, password }`
- **Response**: `{ success, message, requiresVerification }`

**Login**:
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ success, user, token, csrfToken }`

#### Local Storage

**Keys Written**:
- `cosmic_auth_token` - JWT authentication token
- `cosmic_user` - User object with profile data
- `cosmic_csrf_token` - CSRF token for state-changing requests

#### Display to User

**On Success**:
- ✅ Welcome message with user name
- ✅ Redirect to questionnaire or dashboard
- ✅ Email verification notice (if required)

**On Error**:
- ❌ Validation errors (email format, password length)
- ❌ Authentication errors (invalid credentials)
- ❌ Email verification required notice

---

### 1.2 Email Verification

**Component**: `src/components/EmailVerification.jsx`

#### Data Collected
- Email verification token (from URL parameter)
- User email address

#### API Endpoints

**Verify Email**:
- **POST** `/api/auth/verify-email`
- **Body**: `{ token }`
- **Response**: `{ success, message, user }`

**Resend Verification**:
- **POST** `/api/auth/resend-verification`
- **Body**: `{ email }`
- **Response**: `{ success, message }`

#### Display to User
- ✅ Verification success/failure message
- ✅ Redirect to dashboard on success
- ✅ Resend verification link option
- ⏱️ Loading spinner during verification

---

### 1.3 User Profile Widget

**Component**: `src/components/UserProfile.jsx`

#### Data Displayed

```javascript
{
  name: String,          // User's full name
  username: String,      // @username
  email: String,         // Email (hidden in UI)
  profileImage: String,  // Profile picture URL or null
  initials: String       // Generated from name
}
```

#### User Actions
- 🚪 Logout button (clears auth data)
- 🖼️ Avatar display (image or initials with color)

#### Color Generation
- **Algorithm**: Hash-based color selection from name
- **Colors**: 8 predefined colors (purple, pink, blue, green, rose, yellow, cyan, red)
- **Consistent**: Same name always gets same color

---

## 2. Questionnaire System

### 2.1 Cosmic Profile Questionnaire

**Component**: `src/components/Questionnaire.jsx`

#### Overview
- **9 Sections** total
- **Free Access**: Sections 1-5
- **Premium Access**: Sections 6-9
- **Auto-save**: Progress saved to localStorage on every change
- **Resume**: Can continue from last section

#### Data Collected by Section

##### Section 1: Astrological Foundation
```javascript
{
  sunSign: String,              // Zodiac sun sign
  moonSign: String,             // Moon sign
  risingSign: String,           // Ascendant/rising sign
  birthDate: Date,              // Date of birth
  birthTime: Time,              // Time of birth
  birthPlace: String,           // Place of birth (city, country)
  dominantPlanets: Array<String> // Comma-separated planets
}
```

##### Section 2-3: Childhood (Ages 0-12)
```javascript
{
  section2_1 to section2_9: String,  // 9 childhood questions
  section3_1 to section3_9: String   // 9 more childhood questions
}
```

**Topics Covered**:
- Family dynamics
- Childhood environment
- Early memories
- Emotional patterns
- Formative experiences
- Significant events
- Relationship with parents/siblings
- School experiences
- Early interests

##### Section 4: Adolescence (Ages 13-19)
```javascript
{
  section4_1 to section4_10: String  // 10 adolescence questions
}
```

**Topics Covered**:
- Teen identity formation
- Peer relationships
- First romantic experiences
- Rebellion or conformity patterns
- Academic/career direction
- Emotional development
- Social struggles/triumphs
- Authority relationships
- Self-discovery moments
- Life-changing decisions

##### Section 5: Early Adulthood (Ages 20-29)
```javascript
{
  section5_1 to section5_10: String  // 10 early adulthood questions
}
```

**Topics Covered**:
- Career beginnings
- Serious relationships
- Independence
- Financial patterns
- Life philosophy
- Personal growth
- Major decisions
- Mistakes and lessons
- Value formation
- Identity solidification

##### Section 6: Adulthood (Ages 30-39) [PREMIUM]
```javascript
{
  section6_1 to section6_10: String  // 10 adulthood questions
}
```

**Topics Covered**:
- Career evolution
- Relationship maturity
- Family (if applicable)
- Life satisfaction
- Course corrections
- Wisdom gained
- Regrets and acceptance
- Personal power
- Authentic living
- Purpose clarity

##### Section 7: Mature Adulthood (Ages 40+) [PREMIUM]
```javascript
{
  section7_1 to section7_10: String  // 10 mature adulthood questions
}
```

**Topics Covered**:
- Legacy thinking
- Generativity
- Relationship deepening
- Mortality awareness
- Wisdom sharing
- Life review
- Acceptance practices
- Spiritual deepening
- Letting go
- Future visioning

##### Section 8: Energetic & Intuitive State [PREMIUM]
```javascript
{
  section8_1: String,  // Energetic state description
  section8_2: String   // Intuitive patterns
}
```

**Topics Covered**:
- Energy levels and patterns
- Intuitive experiences
- Psychic abilities
- Energetic sensitivities
- Spiritual gifts
- Connection to higher self

##### Section 9: Current Snapshot [PREMIUM]
```javascript
{
  section9_1: String,  // Current life situation
  section9_2: String,  // Emotional state
  section9_3: String   // Life season feeling
}
```

**Topics Covered**:
- Present moment assessment
- Emotional landscape
- Life season awareness
- Current challenges
- Opportunities present
- Growth edges

#### Data Processing

**On Submission**:
```javascript
{
  questionnaireAnswers: Object,      // All answers by key
  completionDate: ISO8601,           // Submission timestamp
  astrology: {
    sunSign, moonSign, risingSign,
    birthDate, birthTime, birthPlace,
    dominantPlanets: Array
  },
  personalHistory: {
    childhood: Object,    // Sections 2-3
    adolescence: Object,  // Section 4
    adulthood: Object     // Sections 5-7
  },
  currentState: {
    energetic: String,
    intuitive: String,
    currentSnapshot: String,
    emotionalState: String,
    lifeSeasonFeeling: String
  }
}
```

#### Local Storage

**Keys Used**:
- `questionnaireAnswers` - Raw answers object
- `questionnaireCurrentSection` - Current section number (1-9)
- `questionnaireCompleted` - Array of completed section IDs
- `userQuestionnaire` - Final processed data after submission

#### Display to User

**Progress Indicators**:
- Overall completion percentage (0-100%)
- Per-section completion percentage
- Section navigation sidebar with status:
  - 🟢 Green: Completed
  - 🔵 Blue: Current/In Progress
  - ⚪ Gray: Not started
  - 🔒 Gold lock: Premium locked

**Visual Elements**:
- Large progress bar at top
- Section cards with icons
- Question numbering
- Input validation
- Save notifications
- Navigation buttons (Previous/Continue/Complete)

**User Guidance**:
- Section descriptions
- Question examples
- Helpful tips card
- Premium upgrade modal (if free user clicks locked section)

---

## 3. Profile Management

### 3.1 My Profile

**Component**: `src/components/MyProfile.jsx`

#### Data Displayed

**Astrological Profile**:
```javascript
{
  birthDate: Date,
  birthTime: Time,
  birthPlace: String,
  sunSign: String,
  moonSign: String,
  risingSign: String
}
```

**Profile Picture**:
```javascript
{
  profilePicture: String  // Base64 image or URL
}
```

#### Data Collected

**Profile Picture Upload**:
- File type: image/* (JPEG, PNG, GIF, WebP)
- Max size: 5MB
- Stored as: Base64 in localStorage (temporary)
- Future: Upload to MinIO/S3

**Password Change**:
```javascript
{
  currentPassword: String,
  newPassword: String,      // Min 8 characters
  confirmPassword: String
}
```

#### User Actions

**Profile Management**:
- 📸 Upload profile picture
- ❌ Remove profile picture
- ✏️ Edit profile (triggers questionnaire)

**Account Security**:
- 🔒 Change password
- ⏸️ Deactivate account (temporary disable)
- 🗑️ Delete account (permanent removal - requires typing "DELETE")

#### API Endpoints

**Update Profile Picture** (TODO):
```javascript
PUT /api/auth/profile
Body: { profilePicture: base64String }
Headers: { Authorization: "Bearer <token>" }
```

**Change Password** (TODO):
```javascript
POST /api/auth/change-password
Body: { currentPassword, newPassword }
Headers: { Authorization: "Bearer <token>" }
```

#### Local Storage

**Keys Modified**:
- `userQuestionnaire` - Updated with new profile picture
- `cosmic_user` - Updated with new profile picture
- Cleared on delete: ALL localStorage keys

#### Display to User

**Astrological Profile Card**:
- 📅 Birth date with calendar icon
- ⏰ Birth time with clock icon
- 📍 Birth place with location icon

**Cosmic Trinity Card**:
- ☀️ Sun Sign - "Your core essence"
- 🌙 Moon Sign - "Your emotional nature"
- ⬆️ Rising Sign - "How others see you"

**Security Modals**:
- Password change form with validation
- Deactivate confirmation dialog
- Delete account confirmation (requires typing "DELETE")
- Success/error messages

---

## 4. Dashboard & Insights

### 4.1 Main Dashboard

**Component**: `src/components/Dashboard.jsx`

#### Data Sources

**From User Data**:
- Questionnaire answers
- Astrological profile
- Subscription tier
- Usage history

**From AI Service**:
- Life season analysis (Claude Sonnet 4)
- Pattern recognition
- Lesson identification
- Progress insights

#### Displays to User

##### Life Season Cards (6 cards)
```javascript
{
  emotionalSeason: {
    icon: "💙",
    title: "Emotional Season",
    season: "Transformation",
    description: "Detailed insight..."
  },
  careerSeason: {
    icon: "💼",
    title: "Career & Purpose",
    season: "Awakening",
    description: "Detailed insight..."
  },
  relationshipSeason: {
    icon: "❤️",
    title: "Relationship Season",
    season: "Evolution",
    description: "Detailed insight..."
  },
  mentalSeason: {
    icon: "🧠",
    title: "Mental Season",
    season: "Clarity",
    description: "Detailed insight..."
  },
  spiritualSeason: {
    icon: "✨",
    title: "Spiritual Season",
    season: "Deepening",
    description: "Detailed insight..."
  },
  overallEnergy: {
    icon: "🌟",
    title: "Overall Energy",
    season: "Integration",
    description: "Detailed insight..."
  }
}
```

##### Hidden Lessons Section
```javascript
{
  lessonYouAvoid: String,
  howItsBlocking: String,
  patternReadyToBreak: String
}
```

##### Blocking Patterns
```javascript
{
  peoplePleasing: {
    pattern: "People-Pleasing",
    impact: "Draining energy..."
  },
  // More patterns...
}
```

#### Access Control

**Free Users**:
- ✅ One-time reading
- ❌ No refresh access
- 💎 Upgrade prompt after first use

**Premium/Pro Users**:
- ✅ Unlimited readings
- ✅ Daily updates
- ✅ All features

#### API Endpoints

**Generate Insights**:
```javascript
POST /api/ai/cosmic-profile
Body: { userData: questionnaireData }
Headers: { Authorization: "Bearer <token>" }
Response: { lifeSeasons, hiddenLessons, blockingPatterns }
```

---

### 4.2 Admin Dashboard

**Component**: `src/components/AdminDashboard.jsx`

#### Data Collected & Displayed

**User Management**:
```javascript
{
  users: Array<{
    id: String,
    email: String,
    name: String,
    tier: String,
    subscriptionStatus: String,
    lastActive: Date,
    joinDate: Date
  }>
}
```

**Analytics Summary**:
```javascript
{
  totalUsers: Number,
  activeUsers24h: Number,
  totalRevenue: Number,
  conversionRate: Percentage,
  avgSessionDuration: Minutes,
  populullar Pages: Array<{page, views}>
}
```

**Payment History**:
```javascript
{
  payments: Array<{
    id: String,
    userId: String,
    amount: Number,
    status: String,
    date: Date,
    tier: String
  }>
}
```

**Real-Time Events**:
```javascript
{
  events: Array<{
    type: String,
    userId: String,
    timestamp: Date,
    data: Object
  }>
}
```

#### User Actions

- 🔍 Search users
- 👤 View user details
- 📊 View user journey
- 🎫 View user tickets/issues
- ✅ Mark issues resolved
- 📈 Filter by date range (24h, 7d, 30d, all)

#### Local Storage

**Keys Used**:
- `cosmic_users` - User list cache
- `cosmic_analytics_queue` - Real-time events
- `cosmic_issue_resolutions` - Support ticket resolutions

---

### 4.3 ML Admin Dashboard

**Component**: `src/components/MLAdminDashboard.jsx`

#### Purpose
Management interface for ML service administrators

#### Data Displayed
- ML model status
- Embedding statistics
- Training job history
- Vector database health
- API usage metrics

*(Detailed implementation pending)*

---

### 4.4 Monitoring Dashboard

**Component**: `src/components/MonitoringDashboard.jsx`

#### Data Collected & Displayed

**Application Health**:
```javascript
{
  overallHealth: Number (0-100),
  status: "healthy" | "degraded" | "down",
  uptime: Seconds,
  responseTime: Milliseconds,
  errorRate: Percentage
}
```

**Component Health**:
```javascript
{
  components: Array<{
    name: String,
    status: "healthy" | "degraded" | "down",
    responseTime: Number,
    errorCount: Number,
    lastCheck: Date
  }>
}
```

**System Logs**:
```javascript
{
  logs: Array<{
    timestamp: Date,
    level: "info" | "warn" | "error" | "critical",
    component: String,
    message: String,
    details: Object
  }>
}
```

**Error Analytics**:
```javascript
{
  totalErrors: Number,
  errorsByType: Object,
  errorRate: Percentage,
  topErrors: Array<{error, count}>
}
```

**Performance Metrics**:
```javascript
{
  avgResponseTime: Number,
  p95ResponseTime: Number,
  p99ResponseTime: Number,
  throughput: Number,
  activeConnections: Number
}
```

#### API Endpoints

- **GET** `/api/monitoring/health/application`
- **GET** `/api/monitoring/health/component`
- **GET** `/api/monitoring/logs?limit=100&startDate=...`
- **GET** `/api/monitoring/analytics/errors`
- **GET** `/api/monitoring/analytics/performance`

#### Features

- 🔄 Auto-refresh every 30 seconds
- 📊 Time range filters (1h, 24h, 7d, 30d)
- 🔍 Log search and filtering
- 📈 Health score visualization
- 🎨 Color-coded status indicators

---

## 5. Feature Components

### 5.1 AI Chat Interface

**Component**: `src/components/AIChatInterface.jsx`

#### Data Collected

**Chat Messages**:
```javascript
{
  messages: Array<{
    id: UUID,
    role: "user" | "assistant",
    content: String,
    timestamp: Date
  }>
}
```

**User Input**:
- Text messages (no character limit)
- Context from userData automatically included

#### Rate Limits

**By Tier**:
- **Free**: 5 messages/day
- **Premium**: 25 messages/day
- **Pro**: 100 messages/day

#### API Endpoints

**Send Message**:
```javascript
POST /api/ai/chat
Body: {
  message: String,
  conversationHistory: Array<Message>,
  userData: Object
}
Headers: { Authorization: "Bearer <token>" }
Response: { reply: String, usage: {messagesRemaining} }
```

#### Display to User

**Chat Interface**:
- 💬 Message bubbles (user vs AI)
- ⏱️ Timestamps
- 🔄 Loading indicator while AI responds
- 📊 Message counter (e.g., "3/5 messages used today")
- 💎 Upgrade prompt when limit reached

**AI Responses**:
- Personalized based on user's questionnaire
- Context-aware (knows user's life seasons, patterns)
- Supportive and insightful tone
- References user's astrological profile when relevant

---

### 5.2 Journal

**Component**: `src/components/Journal.jsx`

#### Data Collected

**Journal Entries**:
```javascript
{
  entries: Array<{
    id: UUID,
    content: String,
    timestamp: Date,
    prompt: String | null,
    moonPhase: String,
    mood: String | null
  }>
}
```

**User Input**:
- Free-form text entries
- Optional prompt selection
- Mood tracking (future feature)

#### Journal Prompts

**Rotating Prompts** (13 total):
1. "What pattern are you noticing in your life right now?"
2. "What lesson keeps presenting itself?"
3. "What are you ready to release?"
4. "What truth are you avoiding?"
5. "Where are you being called to grow?"
6. "What would your highest self do in this situation?"
7. "What are you grateful for in this moment?"
8. "What boundary do you need to set?"
9. "What belief is no longer serving you?"
10. "Where are you abandoning yourself?"
11. "What does your intuition keep telling you?"
12. "What would you do if you weren't afraid?"
13. "What is your soul trying to tell you through this experience?"

#### Moon Phase Tracking

**Automatic Detection**:
- Calculates current moon phase based on date
- Phases: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent

#### Local Storage

**Keys Used**:
- `journalEntries` - Array of all journal entries
- Auto-save on submit
- Persists across sessions

#### API Endpoints (Future)

**Get AI Insights**:
```javascript
POST /api/ai/journal-insights
Body: { entries: Array<Entry>, userData: Object }
Response: { 
  patterns: Array<String>,
  themes: Array<String>,
  growth: String,
  recommendations: Array<String>
}
```

#### Display to User

**Entry List**:
- 📅 Date stamps
- 🌙 Moon phase icons
- 📝 Entry preview (first 100 chars)
- 🔍 Expandable full entries

**Writing Interface**:
- 💡 Suggested prompts
- 📝 Large text area
- 🌙 Current moon phase display
- 💾 Auto-save indicator

---

### 5.3 Goal Tracker

**Component**: `src/components/GoalTracker.jsx`

#### Data Collected

**Goals**:
```javascript
{
  goals: Array<{
    id: UUID,
    category: String,        // Life area
    title: String,
    why: String,            // Purpose/motivation
    timeline: String,       // When to achieve
    milestones: Array<{
      text: String,
      completed: Boolean,
      completedDate: Date | null
    }>,
    metrics: String,        // How to measure success
    progress: Number,       // 0-100%
    createdAt: Date,
    updatedAt: Date
  }>
}
```

#### Goal Categories

**Life Areas** (6 categories):
1. 💼 Career & Purpose
2. ❤️ Relationships
3. 🧠 Personal Growth
4. 💪 Health & Vitality
5. 💰 Financial
6. ✨ Spiritual

#### User Actions

- ➕ Create new goal
- ✏️ Edit goal
- 🗑️ Delete goal
- ✅ Toggle milestone completion
- 📊 Track progress automatically (% of milestones done)

#### Local Storage

**Keys Used**:
- `userGoals` - Array of all goals
- Auto-update on any change

#### Display to User

**Goal Cards**:
- Category icon and color coding
- Goal title
- Progress bar (visual percentage)
- Milestones list with checkboxes
- Timeline display
- "Why" motivation text

**Creation Form**:
- Category selection
- Title input
- Why/purpose textarea
- Timeline selection (dropdown)
- Dynamic milestone addition
- Success metrics textarea

---

### 5.4 Pattern Recognition

**Component**: `src/components/PatternRecognition.jsx`

#### Data Collected

**Pattern Analysis Answers**:
```javascript
{
  category: String,  // Selected life area
  answers: {
    [questionId]: String  // Answers to category-specific questions
  }
}
```

#### Pattern Categories

**Life Areas** (6 categories):
- Relationships
- Career
- Finances
- Health
- Spirituality
- Personal Growth

Each category has **8-10 deep-dive questions**

#### Analysis Process

1. User selects category
2. Answers targeted questions
3. AI analyzes answers for patterns
4. Receives personalized insights

#### API Endpoints

**Analyze Patterns**:
```javascript
POST /api/ai/analyze-patterns
Body: {
  category: String,
  answers: Object,
  userData: Object
}
Response: {
  patterns: Array<String>,
  insights: String,
  recommendations: Array<String>,
  actionSteps: Array<String>
}
```

#### Display to User

**Category Selection**:
- 6 category cards with icons
- Description of what will be analyzed

**Question Flow**:
- One question at a time (optional)
- Or all at once (textarea fields)
- Progress indicator

**Analysis Results**:
- 🔍 Identified patterns
- 💡 Key insights
- 📋 Recommendations
- ✅ Action steps

---

### 5.5 Crystal Recommendations

**Component**: `src/components/CrystalRecommendations.jsx`

#### Data Collected

**User Focus**:
```javascript
{
  focusCategory: String,  // What user wants to work on
  currentChallenges: Array<String>,
  intentions: Array<String>
}
```

#### Analysis Algorithm

**Input**:
- Questionnaire data (astrological profile)
- Current emotional state
- Life season analysis
- Selected focus area

**Output**:
```javascript
{
  recommendations: Array<{
    name: String,
    reason: String,
    properties: Array<String>,
    usage: String,
    chakra: String,
    element: String,
    affirmation: String
  }>,
  energeticBlueprint: String
}
```

#### Crystal Database

**Properties Tracked**:
- Name (e.g., "Clear Quartz", "Amethyst")
- Chakra alignment
- Elemental association
- Healing properties
- Usage instructions
- Affirmations
- Color and appearance
- Best for (situations/intentions)

#### Display to User

**Recommendation Cards**:
- 🔮 Crystal image/icon
- 📝 Name and properties
- 💜 Chakra association
- 🌊 Element (earth, air, fire, water)
- ✨ Why it's recommended for you
- 📖 How to use it
- 🙏 Personalized affirmation

**Energetic Blueprint**:
- Summary of user's current energetic state
- Areas of strength
- Areas for growth
- Crystal guidance rationale

---

## 6. Admin & Monitoring

*(Covered in section 4.2, 4.3, 4.4)*

---

## 7. Payment & Subscriptions

### 7.1 Payment Modal

**Component**: `src/components/PaymentModal.jsx`

#### Data Collected

**Payment Information**:
```javascript
{
  tier: "premium" | "pro",
  paymentProvider: "stripe" | "braintree",
  cardName: String,
  cardNumber: String,      // Formatted: "4242 4242 4242 4242"
  cardExpiry: String,      // Formatted: "MM/YY"
  cardCvc: String,         // 3-4 digits
  billingCycle: "monthly" | "annual"
}
```

#### Tier Pricing

**Premium**:
- Monthly: $19.99/month
- Annual: $199.99/year (save $39.89)

**Pro**:
- Monthly: $39.99/month
- Annual: $399.99/year (save $79.89)

#### Payment Processing

**Stripe Integration**:
```javascript
POST /api/payment/create-intent
Body: { tier, billingCycle }
Response: { clientSecret, subscriptionId }

// Then: Stripe.confirmCardPayment(clientSecret, cardDetails)
```

**Braintree Integration**:
```javascript
POST /api/payment/create-transaction
Body: { tier, billingCycle, cardDetails }
Response: { transactionId, status }
```

#### Display to User

**Tier Comparison**:
- Feature lists
- Pricing (monthly/annual toggle)
- Savings callout for annual
- Most popular badge

**Payment Form**:
- Card name input
- Card number (auto-formatted with spaces)
- Expiry (auto-formatted MM/YY)
- CVC (3-4 digits)
- Secure payment icons (Stripe/Braintree logos)

**Processing States**:
- 🔄 Processing... (disabled form)
- ✅ Success! (redirect to dashboard)
- ❌ Error (display message, allow retry)

#### Local Storage

**Keys Written on Success**:
- `cosmic_user` - Updated with new tier
- `cosmic_subscription` - Subscription details

---

## 8. Settings & Preferences

### 8.1 Cookie Consent

**Component**: `src/components/CookieConsent.jsx`

#### Data Collected

**Cookie Preferences**:
```javascript
{
  necessary: Boolean,    // Always true (required)
  analytics: Boolean,    // Optional
  marketing: Boolean,    // Optional
  functional: Boolean    // Optional
}
```

#### Cookie Categories

**Necessary** (always enabled):
- Authentication tokens
- Session management
- Security tokens
- Essential app functionality

**Analytics** (optional):
- Usage statistics
- Feature usage tracking
- Error monitoring
- Performance metrics

**Marketing** (optional):
- Advertising cookies
- Conversion tracking
- Retargeting pixels
- Email campaign tracking

**Functional** (optional):
- Preference storage
- UI customizations
- Language settings
- Accessibility settings

#### Local Storage

**Keys Used**:
- `cosmic_cookie_consent` - Preference object
- `cosmic_cookie_consent_date` - ISO timestamp

#### Display to User

**Banner (on first visit)**:
- Explanation of cookie usage
- "Accept All" button
- "Customize" button
- "Reject All" (except necessary) button

**Settings Modal**:
- Toggle for each category (except necessary)
- Descriptions of what each category does
- Examples of cookies in each category
- Save preferences button

#### Compliance

- GDPR compliant
- CCPA compliant
- Banner reappears after 6 months
- User can change preferences anytime

---

### 8.2 PWA Install Prompt

**Component**: `src/components/PWAInstallPrompt.jsx`

#### Purpose
Prompts users to install the app as a Progressive Web App

#### Data Collected
- Install choice (accepted/rejected)
- Device type
- Browser type

#### Display to User

**Install Prompt**:
- App icon
- App name "Cosmic Insights"
- Benefits of installing:
  - ✅ Works offline
  - ✅ Faster loading
  - ✅ Add to home screen
  - ✅ Push notifications
- "Install" button
- "Not now" link

**Post-Install**:
- Welcome message
- App icon on home screen
- Standalone window (no browser chrome)
- Splash screen

#### Local Storage

**Keys Used**:
- `cosmic_pwa_install_prompted` - Boolean
- `cosmic_pwa_install_date` - ISO timestamp

---

## 9. Data Storage Summary

### 9.1 LocalStorage Keys

| Key | Content | Size Estimate | Persistence |
|-----|---------|---------------|-------------|
| `cosmic_auth_token` | JWT token | ~500 bytes | Session |
| `cosmic_user` | User object | 1-2 KB | Session |
| `cosmic_csrf_token` | CSRF token | ~100 bytes | Session |
| `questionnaireAnswers` | All answers | 10-20 KB | Permanent |
| `questionnaireCurrentSection` | Section number | ~10 bytes | Permanent |
| `questionnaireCompleted` | Array of IDs | ~50 bytes | Permanent |
| `userQuestionnaire` | Processed data | 15-25 KB | Permanent |
| `journalEntries` | All entries | 50-500 KB | Permanent |
| `userGoals` | All goals | 10-50 KB | Permanent |
| `cosmic_cookie_consent` | Preferences | ~200 bytes | 6 months |
| `cosmic_cookie_consent_date` | ISO date | ~30 bytes | 6 months |
| `cosmic_users` | Admin: user list | 10-100 KB | Session |
| `cosmic_analytics_queue` | Admin: events | 5-50 KB | Session |
| `cosmic_issue_resolutions` | Admin: tickets | 5-20 KB | Session |

**Total Estimated Storage**: 100 KB - 1 MB (depending on usage)

---

### 9.2 Session Storage

Currently not used. All temporary data stored in component state (React useState).

---

### 9.3 Backend Database

**MongoDB Collections**:

**users**:
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (bcrypt hashed),
  name: String,
  username: String,
  role: String,
  tier: String,
  emailVerified: Boolean,
  subscriptionStatus: String,
  subscriptionId: String,
  subscriptionEndDate: Date,
  profilePicture: String,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```

**questionnaires**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  answers: Object,
  astrology: Object,
  personalHistory: Object,
  currentState: Object,
  completionDate: Date,
  createdAt: Date
}
```

**journal_entries**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  content: String,
  prompt: String,
  moonPhase: String,
  mood: String,
  createdAt: Date
}
```

**goals**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  category: String,
  title: String,
  why: String,
  timeline: String,
  milestones: Array,
  metrics: String,
  progress: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**ai_interactions**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,  // "chat", "insight", "pattern", "crystal"
  input: Object,
  output: Object,
  model: String,
  tokensUsed: Number,
  createdAt: Date
}
```

**payments**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  currency: String,
  provider: String,
  transactionId: String,
  status: String,
  tier: String,
  billingCycle: String,
  createdAt: Date
}
```

---

## 10. Privacy & Security

### 10.1 Data Collection Principles

**Transparency**:
- ✅ Users know what data is collected
- ✅ Clear consent mechanisms
- ✅ Privacy policy accessible

**Minimization**:
- ✅ Only collect necessary data
- ✅ No tracking beyond app functionality
- ✅ Optional fields clearly marked

**Security**:
- ✅ Passwords bcrypt hashed (12 rounds)
- ✅ HTTPS-only in production
- ✅ CSRF protection
- ✅ JWT authentication
- ✅ Input validation

---

### 10.2 Sensitive Data Handling

**Never Collected**:
- ❌ Social Security Numbers
- ❌ Full credit card numbers (tokenized via Stripe/Braintree)
- ❌ Unencrypted passwords
- ❌ Biometric data

**Encrypted in Transit**:
- ✅ All API calls over HTTPS
- ✅ WebSocket connections secured
- ✅ Service-to-service encryption

**Encrypted at Rest**:
- ✅ Passwords (bcrypt)
- ✅ Payment tokens
- ⚠️ Questionnaire data (NOT encrypted - future enhancement)
- ⚠️ Journal entries (NOT encrypted - future enhancement)

---

### 10.3 User Rights

**Access**: Users can view all their data
**Portability**: Users can export their data (future feature)
**Deletion**: Users can delete their account and all data
**Correction**: Users can update their profile and questionnaire
**Restriction**: Users can deactivate account temporarily

---

### 10.4 Data Retention

**Active Accounts**:
- Indefinite retention
- Auto-deleted after 2 years of inactivity (future)

**Deleted Accounts**:
- Immediate anonymization
- Hard delete after 30 days
- Backup retention: 90 days

**Analytics**:
- Aggregated data: Indefinite
- Individual events: 1 year

---

## 11. API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session
- `POST /api/auth/verify-email` - Confirm email
- `POST /api/auth/resend-verification` - Resend email
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Complete password reset
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

### Questionnaire
- `POST /api/questionnaire/save` - Save progress
- `POST /api/questionnaire/submit` - Complete questionnaire
- `GET /api/questionnaire/user/:id` - Retrieve answers

### AI Services
- `POST /api/ai/cosmic-profile` - Generate life season analysis
- `POST /api/ai/chat` - AI chat interaction
- `POST /api/ai/analyze-patterns` - Pattern recognition
- `POST /api/ai/journal-insights` - Journal analysis
- `POST /api/ai/crystal-recommendations` - Crystal guidance

### User Data
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/goals` - Get goals
- `POST /api/user/goals` - Create goal
- `PUT /api/user/goals/:id` - Update goal
- `DELETE /api/user/goals/:id` - Delete goal
- `GET /api/user/journal` - Get journal entries
- `POST /api/user/journal` - Create entry

### Payments
- `POST /api/payment/create-intent` - Stripe payment intent
- `POST /api/payment/create-transaction` - Braintree transaction
- `POST /api/payment/webhook` - Payment provider webhook
- `GET /api/payment/history` - Payment history

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - User details
- `GET /api/admin/analytics` - Analytics summary
- `GET /api/admin/payments` - Payment list

### Monitoring
- `GET /api/monitoring/health/application` - App health
- `GET /api/monitoring/health/component` - Component health
- `GET /api/monitoring/logs` - System logs
- `GET /api/monitoring/analytics/errors` - Error analytics
- `GET /api/monitoring/analytics/performance` - Performance metrics

---

## 12. Data Flow Diagrams

### 12.1 User Registration Flow

```
User → LandingPage
  ↓
  Fills registration form
  ↓
  POST /api/auth/register
  ↓
Backend validates & creates user
  ↓
Sends verification email
  ↓
Returns { success, requiresVerification }
  ↓
Frontend saves to localStorage:
  - cosmic_auth_token (if auto-login)
  - cosmic_user
  ↓
Redirects to EmailVerification or Questionnaire
```

---

### 12.2 Questionnaire Completion Flow

```
User → Questionnaire
  ↓
Loads saved progress from localStorage
  ↓
User answers questions
  ↓
Auto-saves to localStorage on every change:
  - questionnaireAnswers
  - questionnaireCurrentSection
  - questionnaireCompleted
  ↓
User clicks "Complete"
  ↓
Processes data:
  - extractAstrologicalData()
  - extractPersonalHistory()
  - extractCurrentState()
  ↓
Saves to localStorage:
  - userQuestionnaire
  ↓
POST /api/questionnaire/submit
  ↓
Backend saves to MongoDB
  ↓
Returns { success }
  ↓
Redirects to Dashboard
```

---

### 12.3 Dashboard Insights Flow

```
User → Dashboard
  ↓
Checks subscription tier & usage
  ↓
Loads userData from localStorage
  ↓
POST /api/ai/cosmic-profile
  Body: { userData }
  ↓
Backend processes with Claude Sonnet 4:
  - Analyzes questionnaire answers
  - Identifies life seasons
  - Detects patterns
  - Suggests lessons
  ↓
Returns insights object
  ↓
Frontend displays:
  - 6 Life Season Cards
  - Hidden Lessons Section
  - Blocking Patterns
  ↓
Free users see upgrade prompt
```

---

### 12.4 Payment Processing Flow

```
User clicks "Upgrade"
  ↓
Opens PaymentModal
  ↓
Selects tier (Premium/Pro)
  ↓
Enters card details
  ↓
Frontend validates:
  - Card number format
  - Expiry date
  - CVC length
  ↓
POST /api/payment/create-intent
  Body: { tier, billingCycle }
  ↓
Backend creates Stripe PaymentIntent
  ↓
Returns { clientSecret }
  ↓
Frontend calls Stripe.confirmCardPayment()
  ↓
Stripe processes payment
  ↓
Webhook to backend: POST /api/payment/webhook
  ↓
Backend updates user tier & subscription
  ↓
Returns { success }
  ↓
Frontend updates localStorage:
  - cosmic_user (with new tier)
  ↓
Redirects to Dashboard with success message
```

---

## 13. Component Hierarchy

```
App
├── LandingPage (Login/Register)
│   └── EmailVerification
│
├── Main App (after auth)
│   ├── Header
│   │   ├── UserProfile
│   │   └── Navigation
│   │
│   ├── Questionnaire
│   │   └── UpgradeModal
│   │
│   ├── Dashboard
│   │   ├── LifeSeasonCard (x6)
│   │   ├── HiddenLessons
│   │   └── BlockingPatterns
│   │
│   ├── MyProfile
│   │   ├── ProfilePictureModal
│   │   ├── ChangePasswordModal
│   │   ├── DeactivateModal
│   │   └── DeleteModal
│   │
│   ├── AIChatInterface
│   │   └── UpgradeModal
│   │
│   ├── Journal
│   │   ├── PromptSelector
│   │   └── EntryList
│   │
│   ├── GoalTracker
│   │   ├── GoalCreationForm
│   │   └── GoalCard (x many)
│   │
│   ├── PatternRecognition
│   │   ├── CategorySelector
│   │   ├── QuestionFlow
│   │   └── AnalysisResults
│   │
│   ├── CrystalRecommendations
│   │   ├── FocusSelector
│   │   └── CrystalCard (x many)
│   │
│   └── PaymentModal
│
├── Admin Routes (role: admin)
│   ├── AdminDashboard
│   │   ├── OverviewTab
│   │   ├── UsersTab
│   │   ├── AnalyticsTab
│   │   └── PaymentsTab
│   │
│   └── MonitoringDashboard
│       ├── HealthTab
│       ├── LogsTab
│       └── PerformanceTab
│
└── ML Admin Routes (role: ml_admin)
    └── MLAdminDashboard
```

---

## 14. Future Enhancements

### Data Collection
- 📸 Photo journal integration
- 🎤 Voice journal entries
- 📊 Mood tracking with visualizations
- 🌡️ Energy level tracking over time
- 🔔 Custom notification preferences
- 🌍 Location-based astrological events

### Display & Insights
- 📈 Progress charts over time
- 🔮 Predictive insights (future life seasons)
- 👥 Community features (optional)
- 📚 Learning resources based on patterns
- 🎯 Personalized challenges
- 🏆 Achievement badges

### Privacy & Security
- 🔐 End-to-end encryption for journal & questionnaire
- 🔑 Two-factor authentication (2FA)
- 🔒 Biometric authentication (fingerprint/face)
- 📱 Device management
- 🚨 Suspicious activity alerts
- 📄 Data export in multiple formats

### Integrations
- 📅 Calendar integration (Google, Apple)
- 🔔 Push notifications (web & mobile)
- 📧 Email digest of insights
- 🤝 Therapist/coach sharing (with consent)
- 📲 Social media sharing (optional, anonymized)

---

## 15. Compliance & Legal

### GDPR (EU)
- ✅ Consent mechanisms
- ✅ Data access requests
- ✅ Data portability
- ✅ Right to deletion
- ✅ Privacy policy
- ⚠️ Data Processing Agreement (future)

### CCPA (California)
- ✅ Do Not Sell disclosure
- ✅ Opt-out mechanism
- ✅ Access to collected data
- ✅ Deletion rights

### HIPAA (Healthcare)
- ⚠️ Not currently compliant
- ⚠️ Questionnaire/journal could contain health info
- ⚠️ Future: Add Business Associate Agreement if needed

---

## 16. Technical Stack

### Frontend
- **Framework**: React 18
- **State Management**: React useState/useEffect
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API
- **Storage**: localStorage, sessionStorage

### Backend (Referenced)
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **AI**: Claude Sonnet 4 (Anthropic API)
- **Payment**: Stripe, Braintree

### Infrastructure
- **Containerization**: Docker
- **Reverse Proxy**: (future: Nginx)
- **CDN**: (future: Cloudflare)
- **Storage**: MinIO (S3-compatible)
- **Monitoring**: Custom service

---

## 📞 Support & Contact

For questions about this documentation or data handling practices:
- **Email**: privacy@cosmicinsights.com
- **Support**: support@cosmicinsights.com
- **Privacy Policy**: https://cosmicinsights.com/privacy
- **Terms of Service**: https://cosmicinsights.com/terms

---

**Document Version**: 1.0  
**Last Updated**: October 15, 2025  
**Next Review**: January 15, 2026

