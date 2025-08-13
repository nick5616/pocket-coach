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
Parse the following free-form workout journal entry and extract structured exercise data. The user wrote this while exhausted in the gym, so use semantic understanding rather than relying on punctuation or delimiters.

JOURNAL ENTRY:
${journalText}

CRITICAL PARSING RULES:
1. SEMANTIC DETECTION: Identify exercises based on context and exercise names, not just punctuation. Examples:
   - "deadlifts 225x5 bench press 185x8 squats 315x3" should be parsed as 3 separate exercises
   - "did some pullups then moved to lat pulldowns 100lbs for 12 also did bicep curls" should be 3 exercises
   - "bench 135 for 10 then 155 for 8 then 175 for 5" should be 3 separate entries for bench press

2. WEIGHT PROGRESSIONS: For exercises with multiple weights mentioned, create separate entries for each weight:
   - "cable low row 45 for 12, 100 for 12, 145 for 10, 175 for 6" = 4 separate cable low row entries
   - "squats worked up to 315 did 225x5, 275x3, 315x1" = 3 separate squat entries

3. CONSISTENT SETS: For uniform sets/reps (e.g., "pull-ups 4x8"), create one entry with sets=4, reps=8

4. EXERCISE NAME NORMALIZATION: Standardize exercise names:
   - "pullups", "pull ups", "pull-ups" → "pull-ups"
   - "lat pulldown", "lat pull down" → "lat pulldown"
   - "bicep curls", "biceps curls" → "bicep curls"

5. ALWAYS extract muscle groups for each exercise

6. RPE/RIR EXTRACTION (MANDATORY): Look for effort indicators and ALWAYS include them in exercise objects:
   - "bench press 135x10 rpe 8" → Must include "rpe": 8 in the exercise object
   - "squats 225 for 5 reps rpe 9" → Must include "rpe": 9 in the exercise object
   - "deadlifts 315x3 rir 2" → Must include "rpe": 8 (convert RIR to RPE: RPE = 10 - RIR)
   - "overhead press 95x8 felt like 7/10" → Must include "rpe": 7 in the exercise object
   - "pull-ups bodyweight x12 pretty hard, maybe 8.5" → Must include "rpe": 9 (round to nearest integer)
   - "push-ups 10 reps rpe 5" → Must include "rpe": 5 in the exercise object

CRITICAL: ALWAYS include RPE field in exercise objects when mentioned by user. If RPE or RIR is mentioned, it MUST appear in the exercise object.

EXAMPLE INPUT: "push-ups 10 reps rpe 5"
REQUIRED OUTPUT: {"name": "push-ups", "sets": 1, "reps": 10, "weight": null, "rpe": 5, "muscleGroups": ["chest", "shoulders", "triceps", "core"]}

Extract exercises and return in this JSON format:
{
  "exercises": [
    {
      "name": "deadlifts",
      "sets": 1,
      "reps": 5,
      "weight": 225,
      "rpe": 8,
      "muscleGroups": ["back", "legs", "glutes"]
    },
    {
      "name": "bench press",
      "sets": 1,
      "reps": 8,
      "weight": 185,
      "rpe": 7,
      "muscleGroups": ["chest", "shoulders", "triceps"]
    },
    {
      "name": "squats",
      "sets": 1,
      "reps": 3,
      "weight": 315,
      "rpe": 9,
      "muscleGroups": ["legs", "glutes"]
    },
    {
      "name": "push-ups",
      "sets": 1,
      "reps": 10,
      "weight": null,
      "rpe": 5,
      "muscleGroups": ["chest", "shoulders", "triceps", "core"]
    }
  ],
  "duration": 45,
  "intensity": "moderate",
  "summary": "Brief summary of the workout"
}

Muscle groups: chest, back, shoulders, biceps, triceps, legs, glutes, core, calves
Intensity levels: light, moderate, high, very_high
Duration in minutes if mentioned, otherwise omit.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at parsing workout logs from exhausted gym users. Use semantic understanding to identify exercises without relying on punctuation or formatting. When exercises have multiple weights/reps mentioned, create separate entries for each set. Standardize exercise names and be precise with data extraction. CRITICAL: Always extract RPE/RIR values when mentioned by users and include them in the exercise objects."
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
    
    // Post-process to ensure RPE extraction from journal text if AI missed it
    if (result.exercises && Array.isArray(result.exercises)) {
      result.exercises = result.exercises.map((exercise: any) => {
        // If RPE is missing but mentioned in the original text, try to extract it
        if (!exercise.rpe) {
          const rpeMatch = journalText.toLowerCase().match(new RegExp(`${exercise.name.toLowerCase()}.*?rpe\\s*(\\d+)`, 'i'));
          const ririMatch = journalText.toLowerCase().match(new RegExp(`${exercise.name.toLowerCase()}.*?rir\\s*(\\d+)`, 'i'));
          
          if (rpeMatch) {
            exercise.rpe = parseInt(rpeMatch[1]);
          } else if (ririMatch) {
            // Convert RIR to RPE: RPE = 10 - RIR
            exercise.rpe = Math.max(1, Math.min(10, 10 - parseInt(ririMatch[1])));
          }
        }
        return exercise;
      });
    }
    
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

export async function generatePersonalizedProgram(
  goals: string,
  experience?: string,
  availableDays?: number,
  equipment?: string[]
): Promise<{
  name: string;
  description: string;
  schedule: any;
  durationWeeks?: number;
  difficulty?: string;
  focusAreas?: string[];
}> {
  try {
    const prompt = `
You are an expert personal trainer and exercise scientist creating a personalized workout program. Your ability to understand the TRUE needs behind stated goals is what makes you exceptional.

USER'S FITNESS GOALS:
"${goals}"

ADDITIONAL CONTEXT (if provided):
- Experience Level: ${experience || 'Not specified'}
- Available Days per Week: ${availableDays || 'Not specified'}
- Available Equipment: ${equipment?.join(', ') || 'Not specified'}

CRITICAL ANALYSIS INSTRUCTIONS:

1. GOAL INTERPRETATION: Look beyond surface-level goals to understand what the user ACTUALLY needs:
   - If they want "defined shoulders" but only mention shoulder press: Understand they need comprehensive shoulder development (front/side/rear delts)
   - If they want "bigger arms": Understand they need balanced bicep/tricep work, not just bicep curls
   - If they want "six-pack abs": Understand they need core strength AND low body fat percentage
   - If they want "toned": Usually means muscle building + fat loss

2. EXERCISE SELECTION EXPERTISE: Choose exercises that align with TRUE goals:
   - For shoulder development: Include lateral raises, rear delt work, NOT just overhead press
   - For chest growth: Include incline/decline angles, NOT just flat bench
   - For back width vs thickness: Different exercise selections entirely
   - Consider muscle balance and injury prevention

3. PROGRESSIVE OVERLOAD: Design for actual progression:
   - Beginner: Focus on movement quality, full-body workouts
   - Intermediate: Upper/lower or push/pull/legs splits
   - Advanced: Specialized programs with periodization

4. EQUIPMENT ADAPTATIONS: If limited equipment, provide effective alternatives:
   - Bodyweight: Progressive variations and tempo manipulation
   - Minimal equipment: Creative uses and supersets
   - Full gym: Optimal exercise selection

Create a comprehensive program in this JSON format:
{
  "name": "Descriptive Program Name",
  "description": "Detailed description explaining HOW this program achieves their actual goals",
  "durationWeeks": 8,
  "difficulty": "beginner|intermediate|advanced",
  "focusAreas": ["Muscle Building", "Strength", "Fat Loss"],
  "schedule": {
    "days": [
      {
        "dayNumber": 1,
        "name": "Descriptive Day Name",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": "3-4",
            "reps": "8-12",
            "restTime": 120,
            "notes": "Specific form cues and progression notes"
          }
        ]
      }
    ]
  }
}

REQUIREMENTS:
- Address their ACTUAL fitness needs, not just stated preferences
- Include 4-6 exercises per day maximum
- Provide specific form cues and progression guidance
- Ensure muscle balance and injury prevention
- Make it progressive and sustainable
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite personal trainer with advanced exercise science knowledge. You can see through surface-level requests to understand what users actually need to achieve their goals. Design programs that are scientifically sound, progressive, and address the complete picture of fitness development."
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

export async function modifyProgram(
  currentProgram: any,
  userFeedback: string
): Promise<{
  name: string;
  description: string;
  schedule: any;
  durationWeeks?: number;
  difficulty?: string;
  focusAreas?: string[];
}> {
  try {
    const prompt = `
You are modifying an existing workout program based on user feedback. Analyze their request and make intelligent adjustments.

CURRENT PROGRAM:
${JSON.stringify(currentProgram, null, 2)}

USER FEEDBACK:
"${userFeedback}"

MODIFICATION GUIDELINES:

1. UNDERSTAND THE REQUEST: Interpret what they really want
   - "Add more shoulder exercises" → Include lateral raises, rear delt work
   - "Make it less intense" → Reduce volume/frequency, not just weights
   - "More chest focus" → Add chest exercises AND reduce competing muscle groups
   - "I don't have time" → Reduce workout duration while maintaining effectiveness

2. SMART MODIFICATIONS:
   - Maintain program balance unless specifically requested otherwise
   - If adding exercises, consider removing others to prevent overtraining
   - If changing intensity, adjust across all parameters (sets, reps, rest)
   - Preserve the original program's strengths while addressing concerns

3. PROGRESSIVE NATURE:
   - Keep modifications realistic and sustainable
   - Don't compromise safety for user preferences
   - Maintain logical progression patterns

Return the COMPLETE modified program in the same JSON format:
{
  "name": "${currentProgram.name}",
  "description": "${currentProgram.description} Modified based on your feedback.",
  "durationWeeks": 8,
  "difficulty": "beginner|intermediate|advanced",
  "focusAreas": ["Updated focus areas"],
  "schedule": {
    "days": [
      {
        "dayNumber": 1,
        "name": "Day Name",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": "3-4",
            "reps": "8-12",
            "restTime": 120,
            "notes": "Form cues and modifications made"
          }
        ]
      }
    ]
  }
}

Make thoughtful changes that address their feedback while maintaining program effectiveness.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert program designer who can intelligently modify workout programs based on user feedback. You understand the nuances of exercise selection, program balance, and how to maintain effectiveness while addressing user concerns."
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
    console.error("Program modification error:", error);
    // Return the original program if modification fails
    return currentProgram;
  }
}
