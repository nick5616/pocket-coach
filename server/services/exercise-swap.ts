import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExerciseSwapRequest {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rpe?: number;
  muscleGroups?: string[];
}

export interface SwappedExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rpe?: number;
  reason: string;
  muscleGroups: string[];
}

export async function swapExerciseForEquivalent(
  originalExercise: ExerciseSwapRequest,
  reason?: string
): Promise<SwappedExercise> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback exercise swap without AI
    return {
      name: `Modified ${originalExercise.name}`,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      weight: originalExercise.weight,
      rpe: originalExercise.rpe,
      reason: reason || "Equipment not available",
      muscleGroups: originalExercise.muscleGroups || [],
    };
  }

  try {
    const prompt = `You are a fitness expert. I need to swap this exercise for an equivalent alternative:

Original Exercise: ${originalExercise.name}
Sets: ${originalExercise.sets}
Reps: ${originalExercise.reps}
${originalExercise.weight ? `Weight: ${originalExercise.weight}lbs` : ''}
${originalExercise.rpe ? `RPE: ${originalExercise.rpe}` : ''}
Target Muscle Groups: ${originalExercise.muscleGroups?.join(', ') || 'Unknown'}

Reason for swap: ${reason || 'Need alternative exercise'}

Please suggest an equivalent exercise that targets the same muscle groups and provide:
1. Exercise name
2. Recommended sets/reps (adjust if needed for the new exercise)
3. Brief reason for this swap

Respond with JSON in this format:
{
  "name": "Exercise name",
  "sets": number,
  "reps": number,
  "reason": "Brief explanation",
  "muscleGroups": ["muscle1", "muscle2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable fitness expert who helps users find equivalent exercises. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const swappedExercise = JSON.parse(response);
    
    return {
      name: swappedExercise.name,
      sets: swappedExercise.sets || originalExercise.sets,
      reps: swappedExercise.reps || originalExercise.reps,
      weight: originalExercise.weight, // Keep original weight as starting point
      rpe: originalExercise.rpe,
      reason: swappedExercise.reason || "AI suggested alternative",
      muscleGroups: swappedExercise.muscleGroups || originalExercise.muscleGroups || [],
    };
  } catch (error) {
    console.error("Error swapping exercise:", error);
    
    // Fallback exercise swap
    return {
      name: `Alternative to ${originalExercise.name}`,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      weight: originalExercise.weight,
      rpe: originalExercise.rpe,
      reason: reason || "Original exercise modified",
      muscleGroups: originalExercise.muscleGroups || [],
    };
  }
}