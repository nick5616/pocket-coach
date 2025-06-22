import OpenAI from "openai";
import { storage } from "../storage.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ExerciseMuscleAnalysis {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export async function getExerciseMuscleGroups(exerciseName: string): Promise<string[]> {
  // First check if we have mappings in the database
  const existingMappings = await storage.getExerciseMuscleMapping(exerciseName.toLowerCase());
  
  if (existingMappings.length > 0) {
    // Get muscle group names from the mappings
    const muscleGroupIds = existingMappings.map(mapping => mapping.muscleGroupId);
    const allMuscleGroups = await storage.getAllMuscleGroups();
    
    return allMuscleGroups
      .filter(group => muscleGroupIds.includes(group.id))
      .map(group => group.displayName);
  }

  // If no mappings exist, use AI to determine muscle groups
  if (!process.env.OPENAI_API_KEY) {
    console.warn(`No muscle group mapping found for "${exerciseName}" and no OpenAI key available`);
    return [];
  }

  try {
    const analysis = await analyzeExerciseMuscles(exerciseName);
    
    // Store the AI analysis in database for future use
    await storeExerciseMuscleMapping(exerciseName, analysis);
    
    return [...analysis.primaryMuscles, ...analysis.secondaryMuscles];
  } catch (error) {
    console.error(`Failed to analyze muscle groups for "${exerciseName}":`, error);
    return [];
  }
}

async function analyzeExerciseMuscles(exerciseName: string): Promise<ExerciseMuscleAnalysis> {
  const allMuscleGroups = await storage.getAllMuscleGroups();
  const availableMuscles = allMuscleGroups.map(group => group.displayName).join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: `You are a fitness expert analyzing which muscle groups are targeted by exercises. 
        
Available muscle groups: ${availableMuscles}

Respond with JSON in this exact format:
{
  "primaryMuscles": ["muscle1", "muscle2"],
  "secondaryMuscles": ["muscle3", "muscle4"]
}

Primary muscles are the main targets (1-3 muscles). Secondary muscles provide assistance (0-3 muscles).
Only use muscle group names from the available list above.`
      },
      {
        role: "user",
        content: `Analyze the exercise: "${exerciseName}"`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  
  return {
    primaryMuscles: result.primaryMuscles || [],
    secondaryMuscles: result.secondaryMuscles || []
  };
}

async function storeExerciseMuscleMapping(exerciseName: string, analysis: ExerciseMuscleAnalysis): Promise<void> {
  const allMuscleGroups = await storage.getAllMuscleGroups();
  const muscleGroupMap = new Map(allMuscleGroups.map(group => [group.displayName, group.id]));

  // Store primary muscle mappings
  for (const muscleName of analysis.primaryMuscles) {
    const muscleGroupId = muscleGroupMap.get(muscleName);
    if (muscleGroupId) {
      try {
        await storage.createExerciseMuscleMapping({
          exerciseName: exerciseName.toLowerCase(),
          muscleGroupId,
          primaryMuscle: true
        });
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message?.includes('duplicate')) {
          console.error(`Failed to store primary muscle mapping for ${exerciseName}:`, error);
        }
      }
    }
  }

  // Store secondary muscle mappings  
  for (const muscleName of analysis.secondaryMuscles) {
    const muscleGroupId = muscleGroupMap.get(muscleName);
    if (muscleGroupId) {
      try {
        await storage.createExerciseMuscleMapping({
          exerciseName: exerciseName.toLowerCase(),
          muscleGroupId,
          primaryMuscle: false
        });
      } catch (error) {
        // Ignore duplicate key errors
        if (!error.message?.includes('duplicate')) {
          console.error(`Failed to store secondary muscle mapping for ${exerciseName}:`, error);
        }
      }
    }
  }
}