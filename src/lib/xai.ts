import OpenAI from 'openai';

if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'placeholder') {
  console.warn('XAI API key not configured. AI coaching features will be disabled.');
}

// XAI uses OpenAI-compatible API
export const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || 'placeholder',
  baseURL: 'https://api.x.ai/v1',
});

export interface CoachingRequest {
  scenario: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    inning: string;
    score: string;
    count?: string;
    runners: string;
    outs?: number;
  };
  userChoice: string;
  isCorrect: boolean;
  explanation: string;
  userPerformance: {
    recentAccuracy: number;
    weakAreas: string[];
    strengths: string[];
  };
}

export interface CoachingResponse {
  feedback: string;
  tips: string[];
  nextSteps: string[];
  encouragement: string;
}

export async function getAICoaching(request: CoachingRequest): Promise<CoachingResponse> {
  if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'placeholder') {
    return {
      feedback: 'AI coaching is not available. Please configure XAI API key.',
      tips: ['Practice makes perfect!', 'Study game situations to improve decision-making.'],
      nextSteps: [
        'Try more scenarios in this category.',
        'Focus on understanding the reasoning behind each choice.',
      ],
      encouragement: 'Keep practicing - every great player started as a beginner!',
    };
  }

  try {
    const prompt = `You are a professional baseball coach providing personalized feedback to a player learning baseball strategy.

SCENARIO CONTEXT:
- Title: ${request.scenario.title}
- Description: ${request.scenario.description}
- Category: ${request.scenario.category}
- Difficulty: ${request.scenario.difficulty}
- Situation: ${request.scenario.inning} inning, Score: ${request.scenario.score}
- Count: ${request.scenario.count || 'N/A'}
- Runners: ${request.scenario.runners}
- Outs: ${request.scenario.outs ?? 'N/A'}

PLAYER'S PERFORMANCE:
- User chose: "${request.userChoice}"
- Was correct: ${request.isCorrect}
- Official explanation: "${request.explanation}"
- Recent accuracy: ${request.userPerformance.recentAccuracy}%
- Weak areas: ${request.userPerformance.weakAreas.join(', ') || 'None identified'}
- Strengths: ${request.userPerformance.strengths.join(', ') || 'Still learning'}

Please provide personalized coaching feedback as a JSON object with these fields:
- feedback: Detailed explanation of their choice (2-3 sentences)
- tips: Array of 2-3 actionable tips for improvement
- nextSteps: Array of 2-3 specific next learning objectives
- encouragement: Motivational message (1-2 sentences)

Keep the tone encouraging, educational, and professional. Focus on helping them understand the 'why' behind baseball strategy decisions.`;

    const completion = await xai.chat.completions.create({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert baseball coach who provides clear, encouraging, and educational feedback to help players improve their strategic thinking.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse as JSON, fallback to structured response if needed
    try {
      return JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, create a structured response from the text
      return {
        feedback: responseText,
        tips: ['Focus on understanding game situations', 'Practice recognizing patterns'],
        nextSteps: ['Try similar scenarios', 'Study professional examples'],
        encouragement: 'Great job working on your baseball strategy skills!',
      };
    }
  } catch (error) {
    console.error('Error getting XAI coaching:', error);

    // Provide fallback coaching based on the user's performance
    const fallbackFeedback = request.isCorrect
      ? `Great choice! You correctly selected "${request.userChoice}". ${request.explanation}`
      : `You selected "${request.userChoice}", but there might be a better option. ${request.explanation}`;

    return {
      feedback: fallbackFeedback,
      tips: [
        'Study the game situation carefully before making decisions',
        'Consider all factors: inning, score, count, and runners',
        'Practice scenarios at your current skill level',
      ],
      nextSteps: [
        'Try more scenarios in the ' + request.scenario.category + ' category',
        'Focus on ' + request.scenario.difficulty.toLowerCase() + ' level scenarios',
        'Review explanations for better understanding',
      ],
      encouragement: request.isCorrect
        ? 'Excellent decision-making! Keep up the great work!'
        : 'Every mistake is a learning opportunity. Keep practicing!',
    };
  }
}

export async function generateScenarioSuggestions(userProfile: {
  level: string;
  weakAreas: string[];
  recentPerformance: number;
  preferredCategory?: string;
}): Promise<string[]> {
  if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === 'placeholder') {
    return [
      'Practice more scenarios in your weak areas',
      'Try scenarios one difficulty level higher',
      'Focus on understanding the reasoning behind decisions',
    ];
  }

  try {
    const prompt = `Based on this baseball player's profile, suggest 3 specific types of scenarios they should practice:

Player Profile:
- Current Level: ${userProfile.level}
- Weak Areas: ${userProfile.weakAreas.join(', ') || 'None identified'}
- Recent Performance: ${userProfile.recentPerformance}%
- Preferred Category: ${userProfile.preferredCategory || 'All positions'}

Provide 3 specific scenario suggestions that would help them improve, considering their current skill level and areas for growth.`;

    const completion = await xai.chat.completions.create({
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content:
            'You are a baseball coach who provides specific, actionable scenario recommendations to help players improve.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (responseText) {
      // Split the response into individual suggestions
      return responseText
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .slice(0, 3)
        .map((line) => line.replace(/^\d+\.?\s*/, '').trim());
    }
  } catch (error) {
    console.error('Error generating XAI scenario suggestions:', error);
  }

  // Fallback suggestions
  return [
    'Practice more scenarios in your weak areas',
    'Try scenarios one difficulty level higher',
    'Focus on understanding the reasoning behind decisions',
  ];
}
