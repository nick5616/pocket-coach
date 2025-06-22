import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const prompt = `You are a fitness expert. I need to swap "${originalExercise.name}" for an equivalent exercise.

Original exercise details:
- Name: ${originalExercise.name}
- Sets: ${originalExercise.sets}
- Reps: ${originalExercise.reps}
- Weight: ${originalExercise.weight || "bodyweight"}
- RPE: ${originalExercise.rpe || "not specified"}

${reason ? `Reason for swap: ${reason}` : ""}

Find an equivalent exercise that:
1. Targets the same primary muscle groups
2. Has similar movement pattern and difficulty
3. Can be performed with similar sets/reps scheme
4. Is commonly available in gyms

Respond with JSON in this exact format:
{
  "name": "replacement exercise name",
  "sets": ${originalExercise.sets},
  "reps": ${originalExercise.reps},
  "weight": estimated_weight_or_null,
  "rpe": estimated_rpe_or_null,
  "reason": "brief explanation of why this is equivalent",
  "muscleGroups": ["primary", "secondary", "muscle", "groups"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a fitness expert specializing in exercise equivalency and program design. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      name: result.name,
      sets: result.sets || originalExercise.sets,
      reps: result.reps || originalExercise.reps,
      weight: result.weight,
      rpe: result.rpe,
      reason: result.reason,
      muscleGroups: result.muscleGroups || []
    };

  } catch (error) {
    console.error("Error swapping exercise:", error);
    throw new Error("Failed to generate exercise swap");
  }
}