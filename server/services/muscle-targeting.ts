import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TargetedProgramRequest {
  targetMuscles: string[];
  userPreferences?: {
    priority: number;
    targetGrowth: string;
    weeklyVolumeTarget: number;
  }[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek?: number;
  equipmentAvailable?: string[];
}

export interface MuscleAnalysis {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  muscleGroups: { [group: string]: string[] };
  recommendedSplit: {
    type: 'ppl' | 'bro_split' | 'upper_lower' | 'full_body' | 'custom';
    confidence: number;
    reasoning: string;
  };
  volumeDistribution: { [muscle: string]: number };
}

export interface GeneratedProgram {
  name: string;
  description: string;
  programType: string;
  splitType: string;
  schedule: any;
  targetMuscles: string[];
  focusAreas: string[];
  durationWeeks: number;
  difficulty: string;
}

export async function analyzeTargetMuscles(targetMuscles: string[]): Promise<MuscleAnalysis> {
  const prompt = `Analyze the following specific muscles and provide detailed insights:

Muscles: ${targetMuscles.join(', ')}

Please analyze and return JSON with:
1. Primary muscles (main targets)
2. Secondary muscles (supporting/synergist muscles that should be included)
3. Muscle groups (group the muscles by anatomical regions)
4. Recommended training split with confidence score and reasoning
5. Weekly volume distribution (sets per week for each muscle)

Consider biomechanics, muscle functions, and optimal training patterns. For muscles like rear delt, medial delt, anterior delt - treat these as separate entities requiring specific targeting.

Return valid JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert exercise physiologist and strength training specialist with deep knowledge of muscle anatomy and biomechanics. Provide precise, evidence-based analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to analyze target muscles:', error);
    throw new Error('Failed to analyze target muscles');
  }
}

export async function generateTargetedProgram(request: TargetedProgramRequest): Promise<GeneratedProgram> {
  // First analyze the target muscles
  const analysis = await analyzeTargetMuscles(request.targetMuscles);
  
  const prompt = `Create a comprehensive workout program targeting these specific muscles:

TARGET MUSCLES: ${request.targetMuscles.join(', ')}

ANALYSIS RESULTS:
- Primary muscles: ${analysis.primaryMuscles?.join(', ') || 'N/A'}
- Secondary muscles: ${analysis.secondaryMuscles?.join(', ') || 'N/A'}
- Recommended split: ${analysis.recommendedSplit?.type || 'custom'} (${analysis.recommendedSplit?.confidence || 0}% confidence)

REQUIREMENTS:
- Experience level: ${request.experienceLevel || 'intermediate'}
- Days per week: ${request.daysPerWeek || 4}
- Equipment: ${request.equipmentAvailable?.join(', ') || 'full gym'}

CRITICAL REQUIREMENTS:
1. For deltoid muscles (rear delt, medial delt, anterior delt), include SPECIFIC exercises that target each head
2. For muscles like teres minor/major, include specialized movements
3. Use the recommended split type from analysis
4. Provide weekly schedule with day-by-day workouts
5. Include sets, reps, and specific exercise selection reasoning

Create a program that maximizes the development of the selected muscles while maintaining overall balance and preventing injury.

Return JSON with:
- name: descriptive program name
- description: detailed program overview
- programType: detected type (ppl, bro_split, etc.)
- splitType: specific split pattern
- schedule: complete weekly schedule object
- targetMuscles: array of target muscle names
- focusAreas: training focus areas
- durationWeeks: recommended duration
- difficulty: difficulty level

Return valid JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert personal trainer and program designer specializing in targeted muscle development. Create scientifically-based, effective training programs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const program = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      name: program.name || 'Custom Targeted Program',
      description: program.description || 'AI-generated program for specific muscle targeting',
      programType: analysis.recommendedSplit?.type || 'custom',
      splitType: program.splitType || 'custom',
      schedule: program.schedule || {},
      targetMuscles: request.targetMuscles,
      focusAreas: program.focusAreas || ['strength', 'muscle_building'],
      durationWeeks: program.durationWeeks || 6,
      difficulty: program.difficulty || request.experienceLevel || 'intermediate'
    };
  } catch (error) {
    console.error('Failed to generate targeted program:', error);
    throw new Error('Failed to generate targeted program');
  }
}

export async function detectOptimalSplit(targetMuscles: string[]): Promise<{
  recommendedSplit: string;
  confidence: number;
  reasoning: string;
  alternativeSplits: string[];
}> {
  const prompt = `Analyze these target muscles and determine the optimal training split:

MUSCLES: ${targetMuscles.join(', ')}

Consider:
1. Muscle anatomy and recovery patterns
2. Training synergies and conflicts
3. Traditional split effectiveness (PPL, Bro Split, Upper/Lower, Full Body)
4. Specific requirements for detailed muscles (rear delt vs front delt)

Provide recommendations for:
- Best split type with confidence percentage
- Clear reasoning based on muscle groupings
- Alternative split options
- Specific considerations for granular muscle targeting

Return JSON with:
- recommendedSplit: primary recommendation
- confidence: percentage (0-100)
- reasoning: detailed explanation
- alternativeSplits: array of alternative options

Return valid JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in exercise science and program design, specializing in optimal training split selection for specific muscle targeting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to detect optimal split:', error);
    throw new Error('Failed to detect optimal split');
  }
}

export async function generateExerciseRecommendations(targetMuscle: string, muscleFunction: string): Promise<{
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    reasoning: string;
    targetingSpecificity: number; // 1-10 how specifically it targets the muscle
  }>;
}> {
  const prompt = `Generate specific exercise recommendations for this muscle:

MUSCLE: ${targetMuscle}
PRIMARY FUNCTION: ${muscleFunction}

Requirements:
1. Focus on exercises that SPECIFICALLY target this muscle
2. Include both isolation and compound movements when appropriate
3. Consider different angles and movement patterns
4. Provide sets/reps recommendations
5. Rate how specifically each exercise targets this muscle (1-10 scale)

For muscles like rear delt, medial delt, anterior delt - provide exercises that specifically emphasize that particular head of the deltoid.

Return JSON with exercises array containing name, sets, reps, reasoning, and targetingSpecificity.

Return valid JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert exercise physiologist with comprehensive knowledge of muscle-specific exercise selection and biomechanics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to generate exercise recommendations:', error);
    throw new Error('Failed to generate exercise recommendations');
  }
}