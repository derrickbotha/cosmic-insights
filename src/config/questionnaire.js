/**
 * Comprehensive Questionnaire Configuration
 * 9 sections covering complete life history and astrological data
 */

export const questionnaireData = {
  section1: {
    title: "Universal Personal & Astrological Data",
    description: "🪐 Foundation information about your birth, identity, and astrological blueprint",
    questions: [
      {
        id: 1,
        text: "Full Birth Name (include any name changes):",
        type: "text",
        placeholder: "Enter your full birth name"
      },
      {
        id: 2,
        text: "Date of Birth (DD/MM/YYYY):",
        type: "date",
        placeholder: "DD/MM/YYYY"
      },
      {
        id: 3,
        text: "Exact Time of Birth (HH:MM, include AM/PM if possible):",
        type: "text",
        placeholder: "e.g., 2:30 PM"
      },
      {
        id: 4,
        text: "Place of Birth (City, Country):",
        type: "text",
        placeholder: "e.g., New York, USA"
      },
      {
        id: 5,
        text: "Current Location (City, Country):",
        type: "text",
        placeholder: "e.g., Los Angeles, USA"
      },
      {
        id: 6,
        text: "Sun Sign:",
        type: "select",
        options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
      },
      {
        id: 7,
        text: "Moon Sign:",
        type: "select",
        options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
      },
      {
        id: 8,
        text: "Rising/Ascendant Sign:",
        type: "select",
        options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
      },
      {
        id: 9,
        text: "Dominant Element (Fire / Earth / Air / Water):",
        type: "select",
        options: ["Fire", "Earth", "Air", "Water"]
      },
      {
        id: 10,
        text: "Current Relationship Status:",
        type: "select",
        options: ["Single", "Dating", "In a relationship", "Engaged", "Married", "Separated", "Divorced", "Widowed", "It's complicated"]
      },
      {
        id: 11,
        text: "Significant Other's Sun Sign (if applicable):",
        type: "select",
        options: ["N/A", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
      },
      {
        id: 12,
        text: "Children's Names and Birth Dates (if applicable):",
        type: "textarea",
        placeholder: "e.g., Emma - 05/12/2015, Noah - 08/22/2018"
      },
      {
        id: 13,
        text: "Spiritual or Religious Background Growing Up:",
        type: "textarea",
        placeholder: "Describe your childhood spiritual/religious environment"
      },
      {
        id: 14,
        text: "Current Spiritual or Faith Orientation:",
        type: "textarea",
        placeholder: "Describe your current spiritual beliefs or practices"
      },
      {
        id: 15,
        text: "Any Chronic Health Conditions or Past Major Illnesses:",
        type: "textarea",
        placeholder: "List any significant health conditions or illnesses"
      },
      {
        id: 16,
        text: "Any Mental or Emotional Health Concerns:",
        type: "textarea",
        placeholder: "Share any mental or emotional health challenges"
      },
      {
        id: 17,
        text: "Notable Dream Patterns or Recurring Symbols:",
        type: "textarea",
        placeholder: "Describe any recurring dreams or symbols"
      },
      {
        id: 18,
        text: "Any Near-Death or Supernatural Experiences:",
        type: "textarea",
        placeholder: "Describe any profound spiritual or supernatural experiences"
      },
      {
        id: 19,
        text: "Strongest Fears or Recurring Emotional Themes:",
        type: "textarea",
        placeholder: "What fears or emotional patterns keep showing up?"
      },
      {
        id: 20,
        text: "Recurring Numbers, Animals, or Symbols in Your Life:",
        type: "textarea",
        placeholder: "e.g., seeing 11:11, butterflies, specific animals"
      }
    ]
  },

  section2: {
    title: "Childhood (Birth – Age 7)",
    description: "🌙 Your earliest years and foundational experiences",
    questions: [
      {
        id: 1,
        text: "Were there any birth complications or premature birth?",
        type: "textarea",
        placeholder: "Describe any birth complications or circumstances"
      },
      {
        id: 2,
        text: "Describe your early family environment (stable / chaotic / absent parent / other):",
        type: "textarea",
        placeholder: "What was your home environment like?"
      },
      {
        id: 3,
        text: "Relationship with parents (divorce, death, absence, etc.):",
        type: "textarea",
        placeholder: "Describe your relationship with your parents"
      },
      {
        id: 4,
        text: "Earliest memory or trauma:",
        type: "textarea",
        placeholder: "What is your earliest memory?"
      },
      {
        id: 5,
        text: "First time you felt \"different\" or highly sensitive:",
        type: "textarea",
        placeholder: "When did you first feel different from others?"
      },
      {
        id: 6,
        text: "Childhood illnesses or broken bones (include which bone and at what age):",
        type: "textarea",
        placeholder: "e.g., Broke left arm at age 5, had pneumonia at age 3"
      },
      {
        id: 7,
        text: "Birth order and sibling dynamic:",
        type: "textarea",
        placeholder: "e.g., Oldest of three, competitive with younger brother"
      },
      {
        id: 8,
        text: "Favorite childhood place or hiding spot:",
        type: "textarea",
        placeholder: "Where did you feel safest or most yourself?"
      },
      {
        id: 9,
        text: "Imaginary friends or intuitive experiences:",
        type: "textarea",
        placeholder: "Did you have imaginary friends or see/sense things others didn't?"
      }
    ]
  },

  section3: {
    title: "Middle Childhood (Age 7 – 14)",
    description: "🌞 Your formative years and developing identity",
    questions: [
      {
        id: 1,
        text: "School experience (bullying, excellence, isolation, etc.):",
        type: "textarea",
        placeholder: "Describe your school experience"
      },
      {
        id: 2,
        text: "Any major home or school relocation:",
        type: "textarea",
        placeholder: "Did you move homes or change schools?"
      },
      {
        id: 3,
        text: "Death or loss experienced during this time:",
        type: "textarea",
        placeholder: "Any significant losses during these years?"
      },
      {
        id: 4,
        text: "First big decision, rebellion, or act of independence:",
        type: "textarea",
        placeholder: "When did you first assert your independence?"
      },
      {
        id: 5,
        text: "When did you first become aware of the stars, dreams, or fate?",
        type: "textarea",
        placeholder: "First spiritual or cosmic awareness moment"
      },
      {
        id: 6,
        text: "Any accidents or injuries (which bone, what age):",
        type: "textarea",
        placeholder: "e.g., Sprained ankle at 10, broke wrist at 12"
      },
      {
        id: 7,
        text: "Pets or animals with emotional significance:",
        type: "textarea",
        placeholder: "Any pets or animal connections that shaped you?"
      },
      {
        id: 8,
        text: "First strong friendship or betrayal:",
        type: "textarea",
        placeholder: "Tell us about your first significant friendship experience"
      },
      {
        id: 9,
        text: "Exposure to religion, mysticism, or superstition during this time:",
        type: "textarea",
        placeholder: "How were you exposed to spiritual or mystical ideas?"
      }
    ]
  },

  section4: {
    title: "Adolescence (Age 14 – 21)",
    description: "🔥 Your teenage years and identity formation",
    questions: [
      {
        id: 1,
        text: "First romantic interest or heartbreak:",
        type: "textarea",
        placeholder: "Describe your first love or heartbreak"
      },
      {
        id: 2,
        text: "Major educational choice or academic struggle:",
        type: "textarea",
        placeholder: "What were your educational experiences like?"
      },
      {
        id: 3,
        text: "Emotional trauma, depression, or isolation period:",
        type: "textarea",
        placeholder: "Any periods of emotional difficulty?"
      },
      {
        id: 4,
        text: "Any legal or disciplinary events:",
        type: "textarea",
        placeholder: "Any run-ins with authority or legal issues?"
      },
      {
        id: 5,
        text: "Substance use experimentation (if any):",
        type: "textarea",
        placeholder: "Be honest - this helps understand patterns"
      },
      {
        id: 6,
        text: "First encounter with death, loss, or strong feeling of destiny:",
        type: "textarea",
        placeholder: "When did mortality or destiny become real to you?"
      },
      {
        id: 7,
        text: "When did you begin defining your personal identity?",
        type: "textarea",
        placeholder: "When did you start figuring out who you really are?"
      },
      {
        id: 8,
        text: "Relationship with your body (confidence, changes, self-image):",
        type: "textarea",
        placeholder: "How did you feel about your body during this time?"
      },
      {
        id: 9,
        text: "Significant injuries or health issues:",
        type: "textarea",
        placeholder: "Any health challenges during these years?"
      },
      {
        id: 10,
        text: "Dream or event that felt prophetic or unforgettable:",
        type: "textarea",
        placeholder: "Was there a moment that felt destined or deeply significant?"
      }
    ]
  },

  section5: {
    title: "Early Adulthood (Age 21 – 28)",
    description: "🌍 Your entry into adult life and independence",
    questions: [
      {
        id: 1,
        text: "Major move or relocation (especially abroad):",
        type: "textarea",
        placeholder: "Did you move cities or countries?"
      },
      {
        id: 2,
        text: "First real job or experience of financial independence:",
        type: "textarea",
        placeholder: "When did you become financially independent?"
      },
      {
        id: 3,
        text: "Key success or failure during this period:",
        type: "textarea",
        placeholder: "What was your biggest win or loss?"
      },
      {
        id: 4,
        text: "Marriage or long-term relationship (include year started):",
        type: "textarea",
        placeholder: "e.g., Met partner in 2015, married in 2018"
      },
      {
        id: 5,
        text: "Breakup or divorce (and how it reshaped you):",
        type: "textarea",
        placeholder: "Any significant relationship endings?"
      },
      {
        id: 6,
        text: "Loss of a loved one:",
        type: "textarea",
        placeholder: "Did you lose anyone close to you?"
      },
      {
        id: 7,
        text: "Health events (surgeries, miscarriages, chronic illnesses):",
        type: "textarea",
        placeholder: "Any major health events during this period?"
      },
      {
        id: 8,
        text: "Spiritual crisis or awakening (\"dark night of the soul\" moments):",
        type: "textarea",
        placeholder: "Did you experience spiritual crisis or awakening?"
      },
      {
        id: 9,
        text: "Discovery of a passion, gift, or calling:",
        type: "textarea",
        placeholder: "When did you discover your true calling or gift?"
      },
      {
        id: 10,
        text: "Mentor or powerful influence met during this time:",
        type: "textarea",
        placeholder: "Who influenced or mentored you significantly?"
      }
    ]
  },

  section6: {
    title: "Adulthood (Age 28 – 35)",
    description: "🌕 Your Saturn return and life shifts",
    questions: [
      {
        id: 1,
        text: "Saturn return (around 29–30) — did something major shift?",
        type: "textarea",
        placeholder: "What changed around age 29-30?"
      },
      {
        id: 2,
        text: "Parenthood or decision about having children:",
        type: "textarea",
        placeholder: "Did you become a parent or make decisions about children?"
      },
      {
        id: 3,
        text: "Career pivot or new direction:",
        type: "textarea",
        placeholder: "Any major career changes?"
      },
      {
        id: 4,
        text: "Financial stability or chaos phase:",
        type: "textarea",
        placeholder: "What was your financial situation like?"
      },
      {
        id: 5,
        text: "Any relocation or lifestyle overhaul:",
        type: "textarea",
        placeholder: "Did you move or completely change your lifestyle?"
      },
      {
        id: 6,
        text: "Death or major separation:",
        type: "textarea",
        placeholder: "Any significant losses or separations?"
      },
      {
        id: 7,
        text: "Psychological or emotional turning point:",
        type: "textarea",
        placeholder: "What was your biggest emotional breakthrough?"
      },
      {
        id: 8,
        text: "Loss of faith or adoption of a new spiritual framework:",
        type: "textarea",
        placeholder: "How did your spiritual beliefs evolve?"
      },
      {
        id: 9,
        text: "Health or body-related wake-up call:",
        type: "textarea",
        placeholder: "Any health wake-up calls during this time?"
      },
      {
        id: 10,
        text: "Evolution of your sense of purpose:",
        type: "textarea",
        placeholder: "How did your understanding of your purpose evolve?"
      }
    ]
  },

  section7: {
    title: "Maturity (Age 35 – 50+)",
    description: "🌞 Your mature years and integration",
    questions: [
      {
        id: 1,
        text: "Have you made peace with earlier life themes?",
        type: "textarea",
        placeholder: "What have you made peace with?"
      },
      {
        id: 2,
        text: "Biggest regret or unhealed memory:",
        type: "textarea",
        placeholder: "What still needs healing?"
      },
      {
        id: 3,
        text: "When did you feel most \"in flow\" with life?",
        type: "textarea",
        placeholder: "Describe your most aligned period"
      },
      {
        id: 4,
        text: "Key achievement or legacy moment:",
        type: "textarea",
        placeholder: "What are you most proud of?"
      },
      {
        id: 5,
        text: "Relationship with children, parents, or mortality:",
        type: "textarea",
        placeholder: "How do you relate to family and mortality now?"
      },
      {
        id: 6,
        text: "Ongoing physical health issues or surgeries:",
        type: "textarea",
        placeholder: "Current health concerns or past surgeries"
      },
      {
        id: 7,
        text: "Major relocations or worldview changes:",
        type: "textarea",
        placeholder: "How has your worldview shifted?"
      },
      {
        id: 8,
        text: "Current relationship with spirituality, faith, or destiny:",
        type: "textarea",
        placeholder: "Where are you spiritually now?"
      },
      {
        id: 9,
        text: "Recurring dreams, symbols, or déjà vu experiences:",
        type: "textarea",
        placeholder: "What keeps appearing in your consciousness?"
      },
      {
        id: 10,
        text: "What personal or emotional patterns continue to repeat?",
        type: "textarea",
        placeholder: "What patterns do you still see playing out?"
      }
    ]
  },

  section8: {
    title: "Energetic & Intuitive Insight",
    description: "💫 Your energetic sensitivities and intuitive gifts",
    questions: [
      {
        id: 1,
        text: "Do you absorb other people's emotions easily?",
        type: "textarea",
        placeholder: "Are you an empath? How do others' emotions affect you?"
      },
      {
        id: 2,
        text: "Have you had dreams or intuitive events that came true?",
        type: "textarea",
        placeholder: "Share any prophetic dreams or intuitions"
      },
      {
        id: 3,
        text: "Which natural element do you feel most drawn to (Water, Fire, Air, Earth)?",
        type: "select",
        options: ["Water", "Fire", "Air", "Earth"]
      },
      {
        id: 4,
        text: "Are there recurring sensations when specific people or topics arise?",
        type: "textarea",
        placeholder: "Do you feel physical sensations with certain people or subjects?"
      },
      {
        id: 5,
        text: "What was your most intense emotional period in life?",
        type: "textarea",
        placeholder: "When did you feel the most emotionally raw?"
      },
      {
        id: 6,
        text: "When do you feel most powerful or aligned with yourself?",
        type: "textarea",
        placeholder: "What conditions make you feel most in your power?"
      },
      {
        id: 7,
        text: "Do you believe in past lives or karmic cycles?",
        type: "textarea",
        placeholder: "Share your thoughts on reincarnation and karma"
      },
      {
        id: 8,
        text: "Have you ever had a \"gut feeling\" that saved or guided you?",
        type: "textarea",
        placeholder: "Tell us about a time your intuition was right"
      },
      {
        id: 9,
        text: "Do you notice synchronicities (like repeating numbers 11:11, 333, etc.)?",
        type: "textarea",
        placeholder: "What synchronicities do you experience?"
      },
      {
        id: 10,
        text: "How do you recharge or ground yourself emotionally?",
        type: "textarea",
        placeholder: "What practices help you reset?"
      }
    ]
  },

  section9: {
    title: "Current Energetic Snapshot",
    description: "🌟 Your present moment and intentions",
    questions: [
      {
        id: 1,
        text: "What stage of transition or uncertainty are you currently experiencing?",
        type: "textarea",
        placeholder: "What is changing or uncertain right now?"
      },
      {
        id: 2,
        text: "What intention or question brought you to this reading?",
        type: "textarea",
        placeholder: "Why are you here today?"
      },
      {
        id: 3,
        text: "What outcome or message are you hoping to receive today?",
        type: "textarea",
        placeholder: "What do you hope to gain from this?"
      },
      {
        id: 4,
        text: "What area of your life feels \"stuck\" or repetitive?",
        type: "textarea",
        placeholder: "Where do you feel trapped in a pattern?"
      },
      {
        id: 5,
        text: "Are there people or memories that continue to influence your emotional state?",
        type: "textarea",
        placeholder: "Who or what still holds emotional power over you?"
      },
      {
        id: 6,
        text: "Which emotion dominates your current phase (fear, love, confusion, faith, etc.)?",
        type: "textarea",
        placeholder: "What emotion is most present for you now?"
      },
      {
        id: 7,
        text: "What would peace or fulfillment look like to you right now?",
        type: "textarea",
        placeholder: "Describe your vision of peace and fulfillment"
      }
    ]
  }
};

// Keep the old export for backward compatibility
export const questionnaireData_old = {
  section1: {
    title: "UNIVERSAL PERSONAL & ASTROLOGICAL DATA",
    icon: "🪐",
    questions: [
      { id: "fullName", label: "Full Birth Name (include any name changes)", type: "text", required: true },
      { id: "birthDate", label: "Date of Birth", type: "date", required: true },
      { id: "birthTime", label: "Exact Time of Birth (HH:MM, include AM/PM)", type: "time", required: true },
      { id: "birthPlace", label: "Place of Birth (City, Country)", type: "text", required: true },
      { id: "currentLocation", label: "Current Location (City, Country)", type: "text", required: true },
      { id: "sunSign", label: "Sun Sign", type: "select", options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"], required: true },
      { id: "moonSign", label: "Moon Sign", type: "select", options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"], required: true },
      { id: "risingSign", label: "Rising/Ascendant Sign", type: "select", options: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"], required: true },
      { id: "dominantElement", label: "Dominant Element", type: "select", options: ["Fire", "Earth", "Air", "Water"], required: true },
      { id: "relationshipStatus", label: "Current Relationship Status", type: "select", options: ["Single", "In a relationship", "Married", "Divorced", "Widowed", "It's complicated"], required: true },
      { id: "partnerSunSign", label: "Significant Other's Sun Sign (if applicable)", type: "select", options: ["N/A", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] },
      { id: "children", label: "Children's Names and Birth Dates (if applicable)", type: "textarea" },
      { id: "spiritualBackground", label: "Spiritual or Religious Background Growing Up", type: "textarea", required: true },
      { id: "currentSpiritual", label: "Current Spiritual or Faith Orientation", type: "textarea", required: true },
      { id: "healthConditions", label: "Any Chronic Health Conditions or Past Major Illnesses", type: "textarea" },
      { id: "mentalHealth", label: "Any Mental or Emotional Health Concerns", type: "textarea" },
      { id: "dreamPatterns", label: "Notable Dream Patterns or Recurring Symbols", type: "textarea" },
      { id: "supernaturalExperiences", label: "Any Near-Death or Supernatural Experiences", type: "textarea" },
      { id: "strongestFears", label: "Strongest Fears or Recurring Emotional Themes", type: "textarea", required: true },
      { id: "recurringSymbols", label: "Recurring Numbers, Animals, or Symbols in Your Life", type: "textarea" }
    ]
  },
  
  section2: {
    title: "CHILDHOOD (BIRTH – AGE 7)",
    icon: "🌙",
    questions: [
      { id: "birthComplications", label: "Were there any birth complications or premature birth?", type: "textarea" },
      { id: "familyEnvironment", label: "Describe your early family environment", type: "select", options: ["Stable", "Chaotic", "Absent parent", "Single parent", "Foster care", "Other"] },
      { id: "parentRelationship", label: "Relationship with parents (divorce, death, absence, etc.)", type: "textarea", required: true },
      { id: "earliestMemory", label: "Earliest memory or trauma", type: "textarea", required: true },
      { id: "feltDifferent", label: "First time you felt 'different' or highly sensitive", type: "textarea" },
      { id: "childhoodIllnesses", label: "Childhood illnesses or broken bones (include which bone and at what age)", type: "textarea" },
      { id: "birthOrder", label: "Birth order and sibling dynamic", type: "textarea", required: true },
      { id: "favoritePlace", label: "Favorite childhood place or hiding spot", type: "textarea" },
      { id: "imaginaryFriends", label: "Imaginary friends or intuitive experiences", type: "textarea" }
    ]
  },
  
  section3: {
    title: "MIDDLE CHILDHOOD (AGE 7 – 14)",
    icon: "🌞",
    questions: [
      { id: "schoolExperience", label: "School experience (bullying, excellence, isolation, etc.)", type: "textarea", required: true },
      { id: "relocation", label: "Any major home or school relocation", type: "textarea" },
      { id: "deathOrLoss", label: "Death or loss experienced during this time", type: "textarea" },
      { id: "firstDecision", label: "First big decision, rebellion, or act of independence", type: "textarea" },
      { id: "cosmicAwareness", label: "When did you first become aware of the stars, dreams, or fate?", type: "textarea" },
      { id: "accidents", label: "Any accidents or injuries (which bone, what age)", type: "textarea" },
      { id: "petsAnimals", label: "Pets or animals with emotional significance", type: "textarea" },
      { id: "firstFriendship", label: "First strong friendship or betrayal", type: "textarea" },
      { id: "mysticismExposure", label: "Exposure to religion, mysticism, or superstition during this time", type: "textarea" }
    ]
  },
  
  section4: {
    title: "ADOLESCENCE (AGE 14 – 21)",
    icon: "🔥",
    questions: [
      { id: "firstRomance", label: "First romantic interest or heartbreak", type: "textarea", required: true },
      { id: "educationalChoice", label: "Major educational choice or academic struggle", type: "textarea" },
      { id: "emotionalTrauma", label: "Emotional trauma, depression, or isolation period", type: "textarea" },
      { id: "legalEvents", label: "Any legal or disciplinary events", type: "textarea" },
      { id: "substanceUse", label: "Substance use experimentation (if any)", type: "textarea" },
      { id: "encounterDeath", label: "First encounter with death, loss, or strong feeling of destiny", type: "textarea" },
      { id: "identityDefining", label: "When did you begin defining your personal identity?", type: "textarea", required: true },
      { id: "bodyRelationship", label: "Relationship with your body (confidence, changes, self-image)", type: "textarea", required: true },
      { id: "healthIssues", label: "Significant injuries or health issues", type: "textarea" },
      { id: "propheticDream", label: "Dream or event that felt prophetic or unforgettable", type: "textarea" }
    ]
  },
  
  section5: {
    title: "EARLY ADULTHOOD (AGE 21 – 28)",
    icon: "🌍",
    questions: [
      { id: "majorMove", label: "Major move or relocation (especially abroad)", type: "textarea" },
      { id: "firstJob", label: "First real job or experience of financial independence", type: "textarea", required: true },
      { id: "successFailure", label: "Key success or failure during this period", type: "textarea", required: true },
      { id: "marriage", label: "Marriage or long-term relationship (include year started)", type: "textarea" },
      { id: "breakup", label: "Breakup or divorce (and how it reshaped you)", type: "textarea" },
      { id: "lossLovedOne", label: "Loss of a loved one", type: "textarea" },
      { id: "healthEvents", label: "Health events (surgeries, miscarriages, chronic illnesses)", type: "textarea" },
      { id: "spiritualCrisis", label: "Spiritual crisis or awakening ('dark night of the soul' moments)", type: "textarea" },
      { id: "passionDiscovery", label: "Discovery of a passion, gift, or calling", type: "textarea", required: true },
      { id: "mentor", label: "Mentor or powerful influence met during this time", type: "textarea" }
    ]
  },
  
  section6: {
    title: "ADULTHOOD (AGE 28 – 35)",
    icon: "🌕",
    questions: [
      { id: "saturnReturn", label: "Saturn return (around 29–30) — did something major shift?", type: "textarea", required: true },
      { id: "parenthood", label: "Parenthood or decision about having children", type: "textarea" },
      { id: "careerPivot", label: "Career pivot or new direction", type: "textarea", required: true },
      { id: "financialPhase", label: "Financial stability or chaos phase", type: "textarea", required: true },
      { id: "lifestyleOverhaul", label: "Any relocation or lifestyle overhaul", type: "textarea" },
      { id: "majorSeparation", label: "Death or major separation", type: "textarea" },
      { id: "turningPoint", label: "Psychological or emotional turning point", type: "textarea", required: true },
      { id: "faithEvolution", label: "Loss of faith or adoption of a new spiritual framework", type: "textarea" },
      { id: "healthWakeup", label: "Health or body-related wake-up call", type: "textarea" },
      { id: "purposeEvolution", label: "Evolution of your sense of purpose", type: "textarea", required: true }
    ]
  },
  
  section7: {
    title: "MATURITY (AGE 35 – 50+)",
    icon: "🌞",
    questions: [
      { id: "madePeace", label: "Have you made peace with earlier life themes?", type: "textarea", required: true },
      { id: "biggestRegret", label: "Biggest regret or unhealed memory", type: "textarea", required: true },
      { id: "inFlow", label: "When did you feel most 'in flow' with life?", type: "textarea", required: true },
      { id: "keyAchievement", label: "Key achievement or legacy moment", type: "textarea" },
      { id: "relationshipMortality", label: "Relationship with children, parents, or mortality", type: "textarea" },
      { id: "ongoingHealth", label: "Ongoing physical health issues or surgeries", type: "textarea" },
      { id: "worldviewChanges", label: "Major relocations or worldview changes", type: "textarea" },
      { id: "currentSpiritualty", label: "Current relationship with spirituality, faith, or destiny", type: "textarea", required: true },
      { id: "recurringDreams", label: "Recurring dreams, symbols, or déjà vu experiences", type: "textarea" },
      { id: "repeatingPatterns", label: "What personal or emotional patterns continue to repeat?", type: "textarea", required: true }
    ]
  },
  
  section8: {
    title: "ENERGETIC & INTUITIVE INSIGHT",
    icon: "💫",
    questions: [
      { id: "empathic", label: "Do you absorb other people's emotions easily?", type: "select", options: ["Yes, very much", "Sometimes", "Rarely", "No"], required: true },
      { id: "intuitiveDreams", label: "Have you had dreams or intuitive events that came true?", type: "textarea", required: true },
      { id: "elementDrawn", label: "Which natural element do you feel most drawn to?", type: "select", options: ["Water", "Fire", "Air", "Earth"], required: true },
      { id: "recurringSensations", label: "Are there recurring sensations when specific people or topics arise?", type: "textarea" },
      { id: "intensePeriod", label: "What was your most intense emotional period in life?", type: "textarea", required: true },
      { id: "feelPowerful", label: "When do you feel most powerful or aligned with yourself?", type: "textarea", required: true },
      { id: "pastLives", label: "Do you believe in past lives or karmic cycles?", type: "select", options: ["Yes, strongly", "Yes, somewhat", "Unsure", "No"], required: true },
      { id: "gutFeeling", label: "Have you ever had a 'gut feeling' that saved or guided you?", type: "textarea", required: true },
      { id: "synchronicities", label: "Do you notice synchronicities (like repeating numbers 11:11, 333, etc.)?", type: "textarea", required: true },
      { id: "recharge", label: "How do you recharge or ground yourself emotionally?", type: "textarea", required: true }
    ]
  },
  
  section9: {
    title: "CURRENT ENERGETIC SNAPSHOT",
    icon: "🌟",
    questions: [
      { id: "currentTransition", label: "What stage of transition or uncertainty are you currently experiencing?", type: "textarea", required: true },
      { id: "readingIntention", label: "What intention or question brought you to this reading?", type: "textarea", required: true },
      { id: "hopedOutcome", label: "What outcome or message are you hoping to receive today?", type: "textarea", required: true },
      { id: "stuckArea", label: "What area of your life feels 'stuck' or repetitive?", type: "textarea", required: true },
      { id: "influentialPeople", label: "Are there people or memories that continue to influence your emotional state?", type: "textarea", required: true },
      { id: "dominantEmotion", label: "Which emotion dominates your current phase?", type: "select", options: ["Fear", "Love", "Confusion", "Faith", "Anger", "Joy", "Sadness", "Hope", "Anxiety", "Peace"], required: true },
      { id: "peaceVision", label: "What would peace or fulfillment look like to you right now?", type: "textarea", required: true }
    ]
  }
};

export default questionnaireData;