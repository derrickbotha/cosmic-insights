// Crystal Recommendations System
// Identifies energetic imbalances based on astrological data, journal sentiment, and life focus
// Prescribes crystal pairings that resonate with planetary energies and life themes

export const crystalDatabase = {
  // Crystals organized by planetary energy
  planetary: {
    sun: {
      name: 'Sun Energy',
      description: 'Vitality, identity, life force, confidence',
      crystals: [
        {
          name: 'Citrine',
          properties: 'Success, abundance, personal power, joy',
          chakra: 'Solar Plexus',
          use: 'Amplifies confidence and manifestation power'
        },
        {
          name: 'Sunstone',
          properties: 'Leadership, vitality, optimism, independence',
          chakra: 'Sacral & Solar Plexus',
          use: 'Strengthens authentic self-expression'
        },
        {
          name: 'Amber',
          properties: 'Life force, warmth, courage, cleansing',
          chakra: 'Solar Plexus',
          use: 'Clears negative energy and boosts vitality'
        }
      ]
    },
    moon: {
      name: 'Moon Energy',
      description: 'Emotions, intuition, nurturing, subconscious',
      crystals: [
        {
          name: 'Moonstone',
          properties: 'Intuition, emotional balance, new beginnings',
          chakra: 'Third Eye & Crown',
          use: 'Harmonizes emotional cycles and intuition'
        },
        {
          name: 'Selenite',
          properties: 'Clarity, peace, higher guidance, cleansing',
          chakra: 'Crown',
          use: 'Connects to lunar wisdom and cleanses energy'
        },
        {
          name: 'Pearl',
          properties: 'Nurturing, wisdom, integrity, loyalty',
          chakra: 'Heart',
          use: 'Brings emotional calm and self-acceptance'
        }
      ]
    },
    mercury: {
      name: 'Mercury Energy',
      description: 'Communication, intellect, learning, adaptability',
      crystals: [
        {
          name: 'Blue Lace Agate',
          properties: 'Clear communication, calm expression, truth',
          chakra: 'Throat',
          use: 'Facilitates honest and peaceful communication'
        },
        {
          name: 'Fluorite',
          properties: 'Mental clarity, focus, learning, organization',
          chakra: 'Third Eye',
          use: 'Enhances mental processing and decision-making'
        },
        {
          name: 'Sodalite',
          properties: 'Logic, rationality, intuition, self-expression',
          chakra: 'Throat & Third Eye',
          use: 'Balances logic with intuitive knowing'
        }
      ]
    },
    venus: {
      name: 'Venus Energy',
      description: 'Love, beauty, values, relationships, abundance',
      crystals: [
        {
          name: 'Rose Quartz',
          properties: 'Unconditional love, self-love, compassion',
          chakra: 'Heart',
          use: 'Opens heart to give and receive love'
        },
        {
          name: 'Emerald',
          properties: 'Heart healing, loyalty, abundance, unity',
          chakra: 'Heart',
          use: 'Attracts love and prosperity'
        },
        {
          name: 'Rhodonite',
          properties: 'Emotional healing, forgiveness, self-worth',
          chakra: 'Heart',
          use: 'Heals relationship wounds and builds confidence'
        }
      ]
    },
    mars: {
      name: 'Mars Energy',
      description: 'Action, courage, passion, assertiveness, drive',
      crystals: [
        {
          name: 'Red Jasper',
          properties: 'Stamina, grounding, courage, vitality',
          chakra: 'Root',
          use: 'Provides sustained energy and determination'
        },
        {
          name: 'Carnelian',
          properties: 'Motivation, creativity, confidence, action',
          chakra: 'Sacral',
          use: 'Ignites passion and overcomes procrastination'
        },
        {
          name: 'Bloodstone',
          properties: 'Strength, protection, courage, vitality',
          chakra: 'Root',
          use: 'Builds courage to face challenges'
        }
      ]
    },
    jupiter: {
      name: 'Jupiter Energy',
      description: 'Expansion, wisdom, abundance, optimism, growth',
      crystals: [
        {
          name: 'Amethyst',
          properties: 'Spiritual growth, wisdom, protection, clarity',
          chakra: 'Third Eye & Crown',
          use: 'Expands consciousness and spiritual awareness'
        },
        {
          name: 'Lapis Lazuli',
          properties: 'Truth, wisdom, enlightenment, self-awareness',
          chakra: 'Third Eye & Throat',
          use: 'Connects to higher knowledge and truth'
        },
        {
          name: 'Turquoise',
          properties: 'Good fortune, protection, wisdom, communication',
          chakra: 'Throat',
          use: 'Attracts abundance and spiritual wisdom'
        }
      ]
    },
    saturn: {
      name: 'Saturn Energy',
      description: 'Discipline, structure, responsibility, karmic lessons',
      crystals: [
        {
          name: 'Black Tourmaline',
          properties: 'Protection, grounding, purification, boundaries',
          chakra: 'Root',
          use: 'Creates energetic boundaries and dispels negativity'
        },
        {
          name: 'Obsidian',
          properties: 'Shadow work, truth, protection, grounding',
          chakra: 'Root',
          use: 'Reveals hidden truths and karmic patterns'
        },
        {
          name: 'Smoky Quartz',
          properties: 'Grounding, transmutation, endurance, protection',
          chakra: 'Root',
          use: 'Transforms challenges into wisdom'
        }
      ]
    },
    uranus: {
      name: 'Uranus Energy',
      description: 'Innovation, freedom, awakening, change, rebellion',
      crystals: [
        {
          name: 'Aquamarine',
          properties: 'Courage, clarity, freedom, transformation',
          chakra: 'Throat',
          use: 'Facilitates personal liberation and truth'
        },
        {
          name: 'Labradorite',
          properties: 'Transformation, intuition, magic, awakening',
          chakra: 'Third Eye',
          use: 'Awakens psychic abilities and embraces change'
        },
        {
          name: 'Moldavite',
          properties: 'Rapid transformation, spiritual acceleration',
          chakra: 'All',
          use: 'Catalyzes sudden awakening and change'
        }
      ]
    },
    neptune: {
      name: 'Neptune Energy',
      description: 'Spirituality, dreams, intuition, compassion, illusion',
      crystals: [
        {
          name: 'Lepidolite',
          properties: 'Emotional balance, peace, transition, dreams',
          chakra: 'Heart & Third Eye',
          use: 'Calms anxiety and enhances dream work'
        },
        {
          name: 'Angelite',
          properties: 'Divine connection, peace, compassion, telepathy',
          chakra: 'Throat & Crown',
          use: 'Strengthens spiritual connection and empathy'
        },
        {
          name: 'Azurite',
          properties: 'Psychic development, intuition, inner vision',
          chakra: 'Third Eye',
          use: 'Opens third eye and enhances intuition'
        }
      ]
    },
    pluto: {
      name: 'Pluto Energy',
      description: 'Transformation, power, death/rebirth, shadow work',
      crystals: [
        {
          name: 'Malachite',
          properties: 'Transformation, protection, deep healing, change',
          chakra: 'Heart & Solar Plexus',
          use: 'Facilitates deep emotional release and rebirth'
        },
        {
          name: 'Jet',
          properties: 'Protection, purification, grief healing, grounding',
          chakra: 'Root',
          use: 'Processes grief and protects during transformation'
        },
        {
          name: 'Apache Tear',
          properties: 'Grief release, forgiveness, comfort, protection',
          chakra: 'Root',
          use: 'Heals deep sorrow and facilitates letting go'
        }
      ]
    }
  },

  // Crystals organized by life focus category
  focusCategories: {
    career: {
      name: 'Career & Success',
      primaryCrystals: [
        {
          name: 'Tiger\'s Eye',
          properties: 'Confidence, willpower, courage, practicality',
          chakra: 'Solar Plexus',
          use: 'Boosts professional confidence and decision-making'
        },
        {
          name: 'Pyrite',
          properties: 'Abundance, manifestation, willpower, protection',
          chakra: 'Solar Plexus',
          use: 'Attracts wealth and shields from workplace negativity'
        },
        {
          name: 'Green Aventurine',
          properties: 'Opportunity, prosperity, optimism, growth',
          chakra: 'Heart',
          use: 'Opens doors to new opportunities'
        }
      ]
    },
    emotionalHealing: {
      name: 'Emotional Healing',
      primaryCrystals: [
        {
          name: 'Rose Quartz',
          properties: 'Self-love, compassion, emotional healing, peace',
          chakra: 'Heart',
          use: 'Heals emotional wounds and builds self-compassion'
        },
        {
          name: 'Rhodonite',
          properties: 'Forgiveness, trauma healing, emotional balance',
          chakra: 'Heart',
          use: 'Processes past hurts and restores emotional equilibrium'
        },
        {
          name: 'Lepidolite',
          properties: 'Anxiety relief, emotional stability, transition',
          chakra: 'Heart & Third Eye',
          use: 'Calms emotional storms and eases change'
        }
      ]
    },
    spiritualGrowth: {
      name: 'Spiritual Growth',
      primaryCrystals: [
        {
          name: 'Clear Quartz',
          properties: 'Amplification, clarity, spiritual connection, healing',
          chakra: 'All',
          use: 'Master healer that amplifies spiritual practice'
        },
        {
          name: 'Amethyst',
          properties: 'Spiritual awareness, intuition, meditation, protection',
          chakra: 'Third Eye & Crown',
          use: 'Deepens meditation and spiritual understanding'
        },
        {
          name: 'Celestite',
          properties: 'Angelic connection, peace, higher realms, dreams',
          chakra: 'Crown',
          use: 'Facilitates divine communication and spiritual peace'
        }
      ]
    },
    creativity: {
      name: 'Creativity & Expression',
      primaryCrystals: [
        {
          name: 'Carnelian',
          properties: 'Creative flow, motivation, passion, vitality',
          chakra: 'Sacral',
          use: 'Unblocks creative energy and ignites inspiration'
        },
        {
          name: 'Orange Calcite',
          properties: 'Creativity, joy, playfulness, confidence',
          chakra: 'Sacral',
          use: 'Removes creative blocks and boosts artistic expression'
        },
        {
          name: 'Ametrine',
          properties: 'Balance, creativity, mental clarity, inspiration',
          chakra: 'Solar Plexus & Crown',
          use: 'Combines creative flow with mental focus'
        }
      ]
    },
    relationships: {
      name: 'Relationships & Connection',
      primaryCrystals: [
        {
          name: 'Rose Quartz',
          properties: 'Love, compassion, harmony, emotional healing',
          chakra: 'Heart',
          use: 'Opens heart to healthy loving connections'
        },
        {
          name: 'Green Jade',
          properties: 'Harmony, balance, loyalty, good fortune',
          chakra: 'Heart',
          use: 'Attracts harmonious relationships'
        },
        {
          name: 'Chrysocolla',
          properties: 'Communication, empathy, forgiveness, peace',
          chakra: 'Throat & Heart',
          use: 'Facilitates compassionate communication'
        }
      ]
    },
    selfWorth: {
      name: 'Self-Worth & Confidence',
      primaryCrystals: [
        {
          name: 'Citrine',
          properties: 'Confidence, self-esteem, personal power, joy',
          chakra: 'Solar Plexus',
          use: 'Builds unshakeable self-belief and inner strength'
        },
        {
          name: 'Sunstone',
          properties: 'Self-empowerment, independence, vitality, optimism',
          chakra: 'Solar Plexus & Sacral',
          use: 'Restores personal power and authentic expression'
        },
        {
          name: 'Rhodochrosite',
          properties: 'Self-love, worthiness, inner child healing, joy',
          chakra: 'Heart',
          use: 'Heals shame and cultivates deep self-acceptance'
        }
      ]
    }
  },

  // Emotional themes and their crystal remedies
  emotionalThemes: {
    fear: {
      theme: 'Fear, Anxiety, Worry',
      crystals: [
        { name: 'Black Tourmaline', reason: 'Protection and grounding during fear' },
        { name: 'Amethyst', reason: 'Calms anxious mind and brings peace' },
        { name: 'Lepidolite', reason: 'Contains lithium, naturally calms anxiety' }
      ]
    },
    grief: {
      theme: 'Grief, Loss, Sorrow',
      crystals: [
        { name: 'Apache Tear', reason: 'Specifically for grief and loss processing' },
        { name: 'Rose Quartz', reason: 'Gentle comfort and self-compassion' },
        { name: 'Smoky Quartz', reason: 'Grounds and transmutes heavy emotions' }
      ]
    },
    anger: {
      theme: 'Anger, Frustration, Resentment',
      crystals: [
        { name: 'Blue Lace Agate', reason: 'Promotes calm and peaceful expression' },
        { name: 'Howlite', reason: 'Reduces rage and uncontrolled anger' },
        { name: 'Sodalite', reason: 'Brings rational perspective to emotions' }
      ]
    },
    shame: {
      theme: 'Shame, Guilt, Unworthiness',
      crystals: [
        { name: 'Rhodochrosite', reason: 'Heals shame and builds self-worth' },
        { name: 'Citrine', reason: 'Restores confidence and personal power' },
        { name: 'Rose Quartz', reason: 'Cultivates self-love and forgiveness' }
      ]
    },
    stuckness: {
      theme: 'Feeling Stuck, Blocked, Stagnant',
      crystals: [
        { name: 'Carnelian', reason: 'Ignites motivation and forward momentum' },
        { name: 'Labradorite', reason: 'Facilitates transformation and change' },
        { name: 'Tiger\'s Eye', reason: 'Provides courage to take action' }
      ]
    },
    disconnection: {
      theme: 'Spiritual Disconnection, Loneliness',
      crystals: [
        { name: 'Celestite', reason: 'Reconnects to divine guidance and angels' },
        { name: 'Selenite', reason: 'Opens crown chakra to higher realms' },
        { name: 'Angelite', reason: 'Facilitates spiritual connection and peace' }
      ]
    }
  }
};

// Analysis function to recommend crystals based on user data
export function analyzeCrystalNeeds(userData) {
  const recommendations = {
    primary: [], // Main crystal recommendations (3-5 crystals)
    supportive: [], // Supporting crystals (2-3 crystals)
    explanation: '', // Detailed explanation of why these crystals
    rituals: [] // Suggested rituals or ways to work with crystals
  };

  // 1. Analyze dominant planetary energies from astrological data
  if (userData.astrology) {
    const { sunSign, moonSign, risingSign, dominantPlanets } = userData.astrology;
    
    // Recommend crystals for Sun sign (core identity)
    if (sunSign) {
      const sunPlanet = crystalDatabase.planetary.sun;
      recommendations.primary.push({
        crystal: sunPlanet.crystals[0],
        reason: `For your Sun sign: ${sunSign} - Strengthens core identity and life force`,
        category: 'Solar Energy'
      });
    }

    // Recommend crystals for Moon sign (emotional nature)
    if (moonSign) {
      const moonPlanet = crystalDatabase.planetary.moon;
      recommendations.primary.push({
        crystal: moonPlanet.crystals[0],
        reason: `For your Moon sign: ${moonSign} - Balances emotional nature and intuition`,
        category: 'Lunar Energy'
      });
    }

    // Add crystals for dominant planets
    if (dominantPlanets && dominantPlanets.length > 0) {
      dominantPlanets.slice(0, 2).forEach(planet => {
        const planetKey = planet.toLowerCase();
        if (crystalDatabase.planetary[planetKey]) {
          const planetData = crystalDatabase.planetary[planetKey];
          recommendations.supportive.push({
            crystal: planetData.crystals[0],
            reason: `For dominant ${planet} energy - ${planetData.description}`,
            category: `${planet} Energy`
          });
        }
      });
    }
  }

  // 2. Analyze journal sentiment and emotional themes
  if (userData.journalInsights) {
    const { emotionalKeywords, recurringThemes, dominantEmotion } = userData.journalInsights;
    
    // Match emotional themes to crystal remedies
    if (recurringThemes && recurringThemes.length > 0) {
      recurringThemes.forEach(theme => {
        const themeLower = theme.toLowerCase();
        
        // Check for fear/anxiety patterns
        if (themeLower.includes('fear') || themeLower.includes('anxiety') || themeLower.includes('worry')) {
          const fearCrystals = crystalDatabase.emotionalThemes.fear;
          recommendations.primary.push({
            crystal: { name: fearCrystals.crystals[0].name, properties: fearCrystals.crystals[0].reason },
            reason: `Addresses recurring theme: ${theme}`,
            category: 'Emotional Healing'
          });
        }
        
        // Check for grief/loss patterns
        if (themeLower.includes('grief') || themeLower.includes('loss') || themeLower.includes('missing')) {
          const griefCrystals = crystalDatabase.emotionalThemes.grief;
          recommendations.primary.push({
            crystal: { name: griefCrystals.crystals[0].name, properties: griefCrystals.crystals[0].reason },
            reason: `Heals recurring pattern: ${theme}`,
            category: 'Emotional Healing'
          });
        }

        // Check for anger/resentment patterns
        if (themeLower.includes('anger') || themeLower.includes('frustrat') || themeLower.includes('resent')) {
          const angerCrystals = crystalDatabase.emotionalThemes.anger;
          recommendations.supportive.push({
            crystal: { name: angerCrystals.crystals[0].name, properties: angerCrystals.crystals[0].reason },
            reason: `Transforms emotion: ${theme}`,
            category: 'Emotional Balance'
          });
        }

        // Check for stuckness/block patterns
        if (themeLower.includes('stuck') || themeLower.includes('block') || themeLower.includes('stagnant')) {
          const stuckCrystals = crystalDatabase.emotionalThemes.stuckness;
          recommendations.primary.push({
            crystal: { name: stuckCrystals.crystals[0].name, properties: stuckCrystals.crystals[0].reason },
            reason: `Breaks through: ${theme}`,
            category: 'Transformation'
          });
        }
      });
    }
  }

  // 3. Analyze user's current life focus category
  if (userData.focusCategory) {
    const focusKey = userData.focusCategory.toLowerCase().replace(/\s+/g, '');
    const categoryMap = {
      'career': 'career',
      'emotionalhealing': 'emotionalHealing',
      'spiritualgrowth': 'spiritualGrowth',
      'creativity': 'creativity',
      'relationships': 'relationships',
      'selfworth': 'selfWorth'
    };
    
    const mappedCategory = categoryMap[focusKey];
    if (mappedCategory && crystalDatabase.focusCategories[mappedCategory]) {
      const focusData = crystalDatabase.focusCategories[mappedCategory];
      recommendations.primary.push({
        crystal: focusData.primaryCrystals[0],
        reason: `Primary support for your focus: ${focusData.name}`,
        category: focusData.name
      });
      
      recommendations.supportive.push({
        crystal: focusData.primaryCrystals[1],
        reason: `Additional support for ${focusData.name}`,
        category: focusData.name
      });
    }
  }

  // 4. Generate personalized explanation
  recommendations.explanation = generateExplanation(recommendations, userData);

  // 5. Suggest rituals based on recommendations
  recommendations.rituals = generateRituals(recommendations);

  // Remove duplicates
  recommendations.primary = removeDuplicateCrystals(recommendations.primary);
  recommendations.supportive = removeDuplicateCrystals(recommendations.supportive);

  return recommendations;
}

function generateExplanation(recommendations, userData) {
  const crystalNames = [...recommendations.primary, ...recommendations.supportive]
    .map(r => r.crystal.name)
    .slice(0, 5)
    .join(', ');

  let explanation = `Based on your astrological blueprint and current life journey, these crystals are specifically aligned to your energetic needs:\n\n`;

  if (userData.astrology) {
    explanation += `Your ${userData.astrology.sunSign || 'Sun'} Sun and ${userData.astrology.moonSign || 'Moon'} Moon create a unique energetic signature that responds particularly well to crystals that balance both your core identity and emotional nature.\n\n`;
  }

  if (userData.journalInsights && userData.journalInsights.recurringThemes) {
    explanation += `Your journal entries reveal recurring themes around ${userData.journalInsights.recurringThemes.slice(0, 2).join(' and ')}, which these crystals are specifically chosen to address and transform.\n\n`;
  }

  if (userData.focusCategory) {
    explanation += `Given your current focus on ${userData.focusCategory}, these crystals will support your intention and accelerate your growth in this area.\n\n`;
  }

  explanation += `Work with these crystals through meditation, carrying them with you, or placing them on your altar to amplify their healing properties.`;

  return explanation;
}

function generateRituals(recommendations) {
  const rituals = [];

  // Morning energizing ritual
  const energizingCrystals = recommendations.primary.filter(r => 
    ['Citrine', 'Sunstone', 'Carnelian', 'Tiger\'s Eye'].includes(r.crystal.name)
  );
  if (energizingCrystals.length > 0) {
    rituals.push({
      name: 'Morning Energy Activation',
      description: `Hold ${energizingCrystals[0].crystal.name} in your left hand (receiving hand) each morning. Set your intention for the day while visualizing golden light flowing from the crystal into your solar plexus. Do this for 3-5 minutes.`,
      timing: 'Every morning',
      crystals: energizingCrystals.map(r => r.crystal.name)
    });
  }

  // Evening emotional release ritual
  const healingCrystals = recommendations.primary.filter(r => 
    ['Rose Quartz', 'Amethyst', 'Lepidolite', 'Smoky Quartz', 'Apache Tear'].includes(r.crystal.name)
  );
  if (healingCrystals.length > 0) {
    rituals.push({
      name: 'Evening Emotional Release',
      description: `Before bed, lie down with ${healingCrystals[0].crystal.name} on your heart chakra. Breathe deeply and allow the crystal to absorb any emotional weight from the day. Journal afterwards if insights arise.`,
      timing: 'Every evening or as needed',
      crystals: healingCrystals.map(r => r.crystal.name)
    });
  }

  // Full Moon charging ritual
  rituals.push({
    name: 'Full Moon Crystal Charging',
    description: `On the full moon, place all your crystals outside or on a windowsill where moonlight can reach them. Leave overnight to cleanse and recharge their energy. Set intentions for the coming lunar cycle.`,
    timing: 'Every full moon',
    crystals: ['All crystals']
  });

  // Meditation grid ritual
  if (recommendations.primary.length >= 3) {
    rituals.push({
      name: 'Crystal Grid Meditation',
      description: `Create a crystal grid using ${recommendations.primary.slice(0, 3).map(r => r.crystal.name).join(', ')}. Arrange in a triangle around you while you meditate. This amplifies their collective energy and creates a sacred healing space.`,
      timing: 'Weekly or during important transitions',
      crystals: recommendations.primary.slice(0, 3).map(r => r.crystal.name)
    });
  }

  return rituals;
}

function removeDuplicateCrystals(crystalArray) {
  const seen = new Set();
  return crystalArray.filter(item => {
    const name = item.crystal.name;
    if (seen.has(name)) {
      return false;
    }
    seen.add(name);
    return true;
  });
}

// Export helper to get crystal info by name
export function getCrystalInfo(crystalName) {
  // Search through all planetary crystals
  for (const planetKey in crystalDatabase.planetary) {
    const planet = crystalDatabase.planetary[planetKey];
    const crystal = planet.crystals.find(c => c.name === crystalName);
    if (crystal) {
      return { ...crystal, planetaryAffinity: planet.name };
    }
  }

  // Search through focus category crystals
  for (const categoryKey in crystalDatabase.focusCategories) {
    const category = crystalDatabase.focusCategories[categoryKey];
    const crystal = category.primaryCrystals.find(c => c.name === crystalName);
    if (crystal) {
      return { ...crystal, focusCategory: category.name };
    }
  }

  return null;
}
