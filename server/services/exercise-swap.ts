import { openai } from "./openai";

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
  try {
    const prompt = `You are a fitness expert helping to swap an exercise for an equivalent alternative.

Original Exercise:
- Name: ${originalExercise.name}
- Sets: ${originalExercise.sets}
- Reps: ${originalExercise.reps}
- Weight: ${originalExercise.weight || 'bodyweight'}
- RPE: ${originalExercise.rpe || 'not specified'}
- Target Muscle Groups: ${originalExercise.muscleGroups?.join(', ') || 'not specified'}

${reason ? `Reason for swap: ${reason}` : ''}

Please suggest an equivalent exercise that targets the same muscle groups with similar difficulty and movement pattern. Maintain the same sets and reps unless there's a compelling reason to adjust them.

Respond with a JSON object containing:
{
  "name": "alternative exercise name",
  "sets": number,
  "reps": number,
  "weight": number_or_null,
  "rpe": number_or_null,
  "reason": "brief explanation for this swap",
  "muscleGroups": ["array", "of", "muscle", "groups"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const swappedExercise = JSON.parse(response) as SwappedExercise;
    
    // Validate the response
    if (!swappedExercise.name || !swappedExercise.muscleGroups) {
      throw new Error("Invalid response format from AI");
    }

    return swappedExercise;
  } catch (error) {
    console.error("Error swapping exercise:", error);
    
    // Fallback to a simple swap based on muscle groups
    const fallbackMuscleGroups = originalExercise.muscleGroups || ['full_body'];
    
    return {
      name: `Alternative to ${originalExercise.name}`,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      weight: originalExercise.weight,
      rpe: originalExercise.rpe,
      reason: "AI service unavailable - manual selection recommended",
      muscleGroups: fallbackMuscleGroups
    };
  }
}