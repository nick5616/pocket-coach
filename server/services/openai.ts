import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

// Export the OpenAI client instance for use in other services
export { openai };

export interface WorkoutAnalysis {
  nextWorkoutRecommendation: string;
  keyInsights: string[];
  progressions: Array<{
    exercise: string;
    recommendation: string;
    reasoning: string;
  }>;
  focusAreas: string[];
  estimatedCalories: number;
  totalVolume: number;
}

export interface GoalProgress {
  currentProgress: number;
  recommendation: string;
  timeframe: string;
}

export async function analyzeWorkout(
  workoutNotes: string,
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    rpe?: number;
  }>,
  userGoals: Array<{
    title: string;
    category: string;
    muscleGroup?: string;
    targetValue?: number;
    currentValue?: number;
  }>,
  previousWorkouts: Array<{
    name: string;
    notes?: string;
    createdAt: Date;
  }>
): Promise<WorkoutAnalysis> {
  try {
    const recentWorkouts = previousWorkouts.slice(0, 5);
    const workoutHistory = recentWorkouts.length > 0 ? 
      recentWorkouts.map(w => `${w.createdAt.toDateString()}: ${w.name} - ${w.notes || 'No notes'}`).join('\n') 
      : 'No previous workouts recorded';

    const prompt = `
You are an expert AI fitness coach analyzing a workout session. Provide comprehensive, actionable insights based on the complete training context.

CURRENT WORKOUT NOTES:
${workoutNotes}

EXERCISES PERFORMED TODAY:
${exercises.map(ex => `- ${ex.name}: ${ex.sets ? `${ex.sets} sets` : ''} ${ex.reps ? `of ${ex.reps} reps` : ''} ${ex.weight ? `at ${ex.weight}lbs` : ''} ${ex.rpe ? `(RPE: ${ex.rpe})` : ''}`).join('\n')}

RECENT WORKOUT HISTORY (Last 5 sessions):
${workoutHistory}

USER GOALS:
${userGoals.map(goal => `- ${goal.title} (${goal.category}${goal.muscleGroup ? `, ${goal.muscleGroup}` : ''}): ${goal.currentValue || 0}/${goal.targetValue || 'no target'}`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Compare today's performance with recent training history
2. Identify patterns, improvements, or concerning trends
3. Consider recovery time between sessions and muscle groups trained
4. Evaluate progress toward stated goals
5. Recommend specific progressions based on performance data

Provide your analysis in the following JSON format:
{
  "nextWorkoutRecommendation": "Specific recommendation for the next workout session",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "progressions": [
    {
      "exercise": "exercise name",
      "recommendation": "specific progression recommendation",
      "reasoning": "why this progression makes sense"
    }
  ],
  "focusAreas": ["muscle group or area to focus on next"],
  "estimatedCalories": 250,
  "totalVolume": 12500
}

Make recommendations motivational and specific. Consider progressive overload principles, recovery needs, and the user's stated goals.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach with deep knowledge of exercise science, progressive overload, and personalized training. Provide specific, actionable, and motivational recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as WorkoutAnalysis;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fallback analysis
    return {
      nextWorkoutRecommendation: "Great job completing your workout! Keep building on this momentum in your next session.",
      keyInsights: ["Consistency is key to progress", "Focus on progressive overload", "Ensure adequate rest between sessions"],
      progressions: [],
      focusAreas: ["Overall fitness"],
      estimatedCalories: 200,
      totalVolume: 0
    };
  }
}

export async function parseWorkoutJournal(journalText: string): Promise<{
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    rpe?: number;
    muscleGroups: string[];
  }>;
  duration?: number;
  intensity: string;
  summary: string;
}> {
  try {
    const prompt = `
Parse the following free-form workout journal entry and extract structured exercise data:

JOURNAL ENTRY:
${journalText}

Extract exercises and return in this JSON format:
{
  "exercises": [
    {
      "name": "exercise name",
      "sets": 3,
      "reps": 10,
      "weight": 135,
      "rpe": 7,
      "muscleGroups": ["chest", "triceps"]
    }
  ],
  "duration": 45,
  "intensity": "moderate",
  "summary": "Brief summary of the workout"
}

For muscle groups, use: chest, back, shoulders, biceps, triceps, legs, glutes, core, calves
For intensity, use: light, moderate, high, very_high
Duration should be in minutes if mentioned, otherwise omit.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at parsing workout logs and extracting structured data from free-form text. Be precise with exercise names and conservative with estimates."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("OpenAI parsing error:", error);
    return {
      exercises: [],
      intensity: "moderate",
      summary: "Workout logged successfully"
    };
  }
}

export async function generateWorkoutName(exercises: Array<{
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  muscleGroups?: string[];
}>): Promise<string> {
  try {
    const exerciseList = exercises.map(ex => ex.name).join(", ");
    const muscleGroups = Array.from(new Set(exercises.flatMap(ex => ex.muscleGroups || [])));
    
    const prompt = `
Generate a concise, motivating workout name based on these exercises: ${exerciseList}

Primary muscle groups: ${muscleGroups.join(", ")}

Create a name that is:
- 2-4 words maximum
- Descriptive of the workout focus
- Motivating and energetic
- Professional gym terminology

Examples: "Push Power Session", "Leg Day Destroyer", "Upper Body Blast"

Return only the workout name, no quotes or extra text.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    return response.choices[0].message.content?.trim() || "AI Generated Workout";
  } catch (error) {
    console.error("Error generating workout name:", error);
    return "AI Generated Workout";
  }
}

export async function generateSimplifiedProgram(params: {
  splitType: string;
  splitName: string;
  experience: string;
  goals: string[];
  daysPerWeek: number;
  equipment: string[];
}): Promise<{
  name: string;
  description: string;
  schedule: any;
}> {
  try {
    const splitDescriptions = {
      ppl: "Push-Pull-Legs split where Day 1 focuses on pushing movements (chest, shoulders, triceps), Day 2 on pulling movements (back, biceps), and Day 3 on legs and glutes. This pattern repeats.",
      upper_lower: "Upper-Lower split alternating between upper body workouts (chest, back, shoulders, arms) and lower body workouts (legs, glutes, calves).",
      full_body: "Full body workouts that target all major muscle groups in each session with compound movements and efficient exercise selection.",
      bro_split: "Body part split dedicating each workout to one primary muscle group for focused, high-volume training."
    };

    const prompt = `
Create a ${params.splitName} workout program for a ${params.experience} level person.

PROGRAM DETAILS:
- Split Type: ${params.splitType} (${splitDescriptions[params.splitType as keyof typeof splitDescriptions] || 'Custom split'})
- Days per week: ${params.daysPerWeek}
- Goals: ${params.goals.join(', ')}
- Equipment: ${params.equipment.join(', ')}
- Experience: ${params.experience}

Create a structured program in this JSON format:
{
  "name": "Descriptive program name that includes the split type",
  "description": "2-3 sentence program description explaining what this program will help achieve",
  "schedule": {
    "day1": {
      "name": "Day name (e.g., Push Day, Upper Body, etc.)",
      "description": "Brief description of this day's focus",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": "3-4",
          "reps": "8-12",
          "weight": "Progressive",
          "restTime": "2-3 minutes",
          "notes": "Form cues and tips"
        }
      ]
    }
  }
}

PROGRAM REQUIREMENTS:
1. Create ${params.daysPerWeek} different workout days
2. Include 4-6 exercises per workout day
3. Use equipment available: ${params.equipment.join(', ')}
4. Appropriate for ${params.experience} level
5. Focus on goals: ${params.goals.join(', ')}
6. Include proper rest times and progression notes
7. Ensure balanced muscle development
8. Provide helpful form cues for each exercise

Make the program progressive, safe, and aligned with the specified goals and experience level.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert personal trainer creating workout programs. Design effective, safe, and progressive programs that are appropriate for the user's experience level and goals. Focus on compound movements and proven training principles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Simplified program generation error:", error);
    return {
      name: `${params.splitName} Program`,
      description: `A personalized ${params.splitName.toLowerCase()} program designed to help you ${params.goals.join(' and ')}.`,
      schedule: {}
    };
  }
}

export async function generatePersonalizedProgram(
  userGoals: Array<{
    title: string;
    category: string;
    muscleGroup?: string;
  }>,
  experience: string,
  availableDays: number,
  equipment: string[]
): Promise<{
  name: string;
  description: string;
  schedule: any;
}> {
  try {
    const prompt = `
Create a personalized workout program based on the following user profile:

GOALS:
${userGoals.map(goal => `- ${goal.title} (${goal.category}${goal.muscleGroup ? `, targeting ${goal.muscleGroup}` : ''})`).join('\n')}

EXPERIENCE LEVEL: ${experience}
AVAILABLE DAYS PER WEEK: ${availableDays}
AVAILABLE EQUIPMENT: ${equipment.join(', ')}

Create a structured program in this JSON format:
{
  "name": "Program name",
  "description": "Program description and goals",
  "schedule": {
    "days": [
      {
        "dayNumber": 1,
        "name": "Push Day",
        "exercises": [
          {
            "name": "Bench Press",
            "sets": "3-4",
            "reps": "8-10",
            "restTime": 120,
            "notes": "Focus on controlled movement"
          }
        ]
      }
    ]
  }
}

Make the program progressive, balanced, and aligned with the user's goals and constraints.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert personal trainer creating customized workout programs. Design effective, safe, and progressive programs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Program generation error:", error);
    return {
      name: "Custom Program",
      description: "A personalized workout program designed for your goals",
      schedule: { days: [] }
    };
  }
}
