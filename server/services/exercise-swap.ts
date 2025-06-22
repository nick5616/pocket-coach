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
    const prompt = `You are a fitness expert. Please suggest an equivalent exercise to replace "${originalExercise.name}".

Original exercise details:
- Name: ${originalExercise.name}
- Sets: ${originalExercise.sets}
- Reps: ${originalExercise.reps}
- Weight: ${originalExercise.weight || 'bodyweight'}
- RPE: ${originalExercise.rpe || 'not specified'}
- Muscle groups: ${originalExercise.muscleGroups?.join(', ') || 'unknown'}

Reason for swap: ${reason || 'User requested alternative'}

Please respond with a JSON object containing:
{
  "name": "alternative exercise name",
  "sets": ${originalExercise.sets},
  "reps": ${originalExercise.reps},
  "weight": ${originalExercise.weight || null},
  "rpe": ${originalExercise.rpe || null},
  "reason": "brief explanation for why this is a good substitute",
  "muscleGroups": ["list", "of", "target", "muscle", "groups"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const swappedExercise = JSON.parse(response) as SwappedExercise;
    
    return swappedExercise;
  } catch (error) {
    console.error("Error swapping exercise:", error);
    
    // Fallback to a basic swap based on muscle groups
    const fallbackSwaps: Record<string, string> = {
      "push-ups": "dumbbell press",
      "squats": "leg press",
      "pull-ups": "lat pulldown",
      "deadlifts": "romanian deadlifts",
      "bench press": "dumbbell press",
      "overhead press": "dumbbell shoulder press"
    };

    const exerciseName = originalExercise.name.toLowerCase();
    const fallbackName = fallbackSwaps[exerciseName] || "alternative exercise";

    return {
      name: fallbackName,
      sets: originalExercise.sets,
      reps: originalExercise.reps,
      weight: originalExercise.weight,
      rpe: originalExercise.rpe,
      reason: "Equivalent exercise targeting similar muscle groups",
      muscleGroups: originalExercise.muscleGroups || ["unknown"]
    };
  }
}