import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ExerciseEditRequest {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  isBodyweight?: boolean;
  baseWeight?: number;
  muscleGroups?: string[];
  editInstruction: string; // Natural language instruction for changes
}

export interface ExerciseEditResponse {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  isBodyweight?: boolean;
  baseWeight?: number;
  muscleGroups?: string[];
  changesSummary: string;
}

export async function editExerciseWithAI(exerciseData: ExerciseEditRequest): Promise<ExerciseEditResponse> {
  const prompt = `You are an expert fitness AI assistant helping users edit exercise data. The user has an exercise with current data and wants to make changes using natural language.

CURRENT EXERCISE DATA:
- Name: ${exerciseData.name}
- Sets: ${exerciseData.sets || "not specified"}
- Reps: ${exerciseData.reps || "not specified"}
- Weight: ${exerciseData.weight || "not specified"} lbs
- RPE: ${exerciseData.rpe || "not specified"}
- Is Bodyweight: ${exerciseData.isBodyweight ? "yes" : "no"}
- Base Weight: ${exerciseData.baseWeight || 0} lbs (equipment weight)
- Muscle Groups: ${exerciseData.muscleGroups?.join(", ") || "not specified"}

USER'S EDIT INSTRUCTION: "${exerciseData.editInstruction}"

IMPORTANT RULES:
1. ONLY change the fields that the user specifically mentions in their instruction
2. Keep all other fields exactly the same as the current data
3. Be intelligent about interpreting natural language:
   - "change weight to 135" → update weight to 135
   - "make it 3 sets" → update sets to 3
   - "rpe was actually 8" → update rpe to 8
   - "add 10 pounds" → add 10 to current weight
   - "reduce reps by 2" → subtract 2 from current reps
   - "it wasn't bodyweight, I used 25lb dumbbells" → set isBodyweight to false, weight to 25, baseWeight to 0
   - "this should be barbell not dumbbell" → update name, set baseWeight to 45 if barbell
   - "add shoulders to muscle groups" → add "shoulders" to muscleGroups array

4. BODYWEIGHT AND BASE WEIGHT DETECTION:
   - Bodyweight exercises: push-ups, pull-ups, chin-ups, dips, bodyweight squats, lunges, burpees, planks
   - Barbell exercises (baseWeight: 45): barbell bench press, barbell squats, deadlifts, barbell rows
   - Smith machine exercises (baseWeight: 25): smith machine bench press, smith machine squats
   - Dumbbell/Cable exercises (baseWeight: 0): dumbbell press, cable rows, lat pulldowns

5. RPE/RIR CONVERSION:
   - If user mentions RIR, convert to RPE: RPE = 10 - RIR
   - Always store as RPE in the response

6. MUSCLE GROUPS: Use standard names: chest, back, shoulders, biceps, triceps, forearms, abs, obliques, lower_back, quads, hamstrings, glutes, calves

Respond with JSON in this exact format:
{
  "name": "exercise name",
  "sets": number or null,
  "reps": number or null,
  "weight": number or null,
  "rpe": number or null,
  "isBodyweight": boolean,
  "baseWeight": number,
  "muscleGroups": ["array", "of", "muscles"],
  "changesSummary": "Brief description of what was changed"
}

CRITICAL: Only modify the fields mentioned in the user's instruction. Keep everything else exactly the same.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent editing
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and clean the response
    return {
      name: result.name || exerciseData.name,
      sets: typeof result.sets === 'number' ? result.sets : exerciseData.sets,
      reps: typeof result.reps === 'number' ? result.reps : exerciseData.reps,
      weight: typeof result.weight === 'number' ? result.weight : exerciseData.weight,
      rpe: typeof result.rpe === 'number' ? result.rpe : exerciseData.rpe,
      isBodyweight: typeof result.isBodyweight === 'boolean' ? result.isBodyweight : exerciseData.isBodyweight || false,
      baseWeight: typeof result.baseWeight === 'number' ? result.baseWeight : exerciseData.baseWeight || 0,
      muscleGroups: Array.isArray(result.muscleGroups) ? result.muscleGroups : exerciseData.muscleGroups || [],
      changesSummary: result.changesSummary || "Exercise updated"
    };
  } catch (error) {
    console.error("Failed to edit exercise with AI:", error);
    throw new Error("Failed to process exercise edit instruction");
  }
}