import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Clock, 
  Target, 
  Zap,
  Plus,
  Edit3,
  Sparkles,
  Calendar,
  Check,
  Activity,
  StopCircle,
  Trash2,
  Edit,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Workout, Exercise, Achievement } from "@shared/schema";

const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  notes: z.string().optional(),
  aiGenerateName: z.boolean().optional(),
});

const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.union([z.number().min(1), z.null()]).optional(),
  reps: z.union([z.number().min(1), z.null()]).optional(),
  weight: z.union([z.number().min(0), z.null()]).optional(),
  rpe: z.union([z.number().min(1).max(10), z.null()]).optional(),
  restTime: z.union([z.number().min(0), z.null()]).optional(),
  notes: z.string().optional(),
});

export default function WorkoutJournal() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [journalText, setJournalText] = useState("");
  const [writeUpContent, setWriteUpContent] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(!id);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  
  // Real-time status states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'parsed'>('idle');
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [showParseAnimation, setShowParseAnimation] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('');
  const [showWriteUpSection, setShowWriteUpSection] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [nextBatchIn, setNextBatchIn] = useState(5000);
  const [lastBatchedThought, setLastBatchedThought] = useState('');
  
  // Debounce refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const parseTimeoutRef = useRef<NodeJS.Timeout>();
  const parseProgressRef = useRef<NodeJS.Timeout>();

  const userId = 1; // Mock user ID
  const workoutId = id ? parseInt(id) : null;

  const form = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      notes: "",
      aiGenerateName: false,
    },
  });

  const exerciseForm = useForm<any>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      sets: null,
      reps: null,
      weight: null,
      rpe: null,
      restTime: null,
      notes: "",
    },
  });

  // Fetch existing workout if editing
  const { data: workout, isLoading: workoutLoading } = useQuery<Workout & { exercises: Exercise[] }>({
    queryKey: ["/api/workouts", workoutId],
    queryFn: () => fetch(`/api/workouts/${workoutId}`).then(res => res.json()),
    enabled: !!workoutId,
  });

  // Fetch exercises for the workout
  const { data: exercises = [], refetch: refetchExercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", workoutId],
    queryFn: () => fetch(`/api/exercises?workoutId=${workoutId}`).then(res => res.json()),
    enabled: !!workoutId,
  });

  useEffect(() => {
    if (workout) {
      form.setValue("name", workout.name);
      form.setValue("notes", workout.notes || "");
      setJournalText(workout.notes || "");
    }
  }, [workout, form]);

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: { name: string; notes?: string }) => {
      const response = await apiRequest("POST", "/api/workouts", {
        userId,
        name: data.name,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/workout-journal/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout Created",
        description: "Your workout has been started!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create workout",
        variant: "destructive",
      });
    },
  });

  // Update workout mutation
  const updateWorkoutMutation = useMutation({
    mutationFn: async (data: { name: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/workouts/${workoutId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId] });
      toast({
        title: "Workout Updated",
        description: "Your changes have been saved!",
      });
    },
  });

  // Journal parsing mutation
  const parseJournalMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", `/api/workouts/${workoutId}/journal`, {
        journalText: text,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises", workoutId] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId] });
      refetchExercises();
      toast({
        title: "Journal Processed",
        description: `Found ${data.parsedData.exercises.length} exercises in your notes!`,
      });
    },
    onError: () => {
      toast({
        title: "Processing Failed",
        description: "Unable to process your journal entry",
        variant: "destructive",
      });
    },
  });

  // Add exercise mutation
  const addExerciseMutation = useMutation({
    mutationFn: async (exerciseData: any) => {
      const response = await apiRequest("POST", "/api/exercises", {
        workoutId: workoutId!,
        ...exerciseData,
      });
      return response.json();
    },
    onSuccess: () => {
      refetchExercises();
      setShowExerciseDialog(false);
      setCurrentExercise(null);
      exerciseForm.reset();
      toast({
        title: "Exercise Added",
        description: "Exercise has been added to your workout!",
      });
    },
  });

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: async (exerciseData: any) => {
      const response = await apiRequest("PATCH", `/api/exercises/${currentExercise!.id}`, exerciseData);
      return response.json();
    },
    onSuccess: () => {
      refetchExercises();
      setShowExerciseDialog(false);
      setCurrentExercise(null);
      exerciseForm.reset();
      toast({
        title: "Exercise Updated",
        description: "Exercise has been updated successfully!",
      });
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: async (exerciseId: number) => {
      await apiRequest("DELETE", `/api/exercises/${exerciseId}`, {});
    },
    onSuccess: () => {
      refetchExercises();
      toast({
        title: "Exercise Deleted",
        description: "Exercise has been removed from your workout.",
      });
    },
  });

  // Complete workout mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/workouts/${workoutId}/complete`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setCompletionData(data);
      setShowCompletion(true);
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      
      // Check for achievements
      if (data.achievement) {
        setCurrentAchievement(data.achievement);
        setTimeout(() => setShowAchievement(true), 1000);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete workout",
        variant: "destructive",
      });
    },
  });

  // Debounced auto-save (500ms)
  const debouncedSave = useCallback(() => {
    if (!workoutId || !journalText.trim() || journalText === lastSavedText) return;
    
    setSaveStatus('saving');
    
    updateWorkoutMutation.mutate({
      name: form.getValues("name"),
      notes: journalText,
    }, {
      onSuccess: () => {
        setSaveStatus('saved');
        setLastSavedText(journalText);
        setIsDirty(false);
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }
    });
  }, [workoutId, journalText, lastSavedText, form, updateWorkoutMutation]);

  // Batch thoughts after 5 seconds (no AI processing)
  const debouncedBatch = useCallback(() => {
    if (!journalText.trim()) return;
    
    // Store the last thought for persistent display
    setLastBatchedThought(journalText.trim());
    
    // Add current text to writeup content (batch it)
    const textToBatch = journalText.trim();
    regroupWriteUpContent({ parsedData: null });
    
    // Clear input after batching
    setJournalText('');
    setLastSavedText('');
    setIsDirty(false);
    setSaveStatus('idle');
    setBatchProgress(0);
    
    // Refocus on input for seamless continuation
    const textarea = document.querySelector('textarea[placeholder*="Start writing"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }, [journalText]);

  // Regroup write-up content with batching
  const regroupWriteUpContent = (parsedData: any) => {
    if (!journalText.trim()) return;
    
    // For now, add all content to writeup for AI processing
    // Split by sentences or meaningful chunks
    const content = journalText.trim();
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length > 0) {
      // Add each sentence as a separate thought
      setWriteUpContent(prev => [...prev, ...sentences.map(s => s.trim())]);
    } else {
      // If no clear sentences, add the whole content as one thought
      setWriteUpContent(prev => [...prev, content]);
    }
  };

  // Handle journal text changes with proper save indicator and batching behavior
  const handleJournalChange = (value: string) => {
    setJournalText(value);
    setIsDirty(value !== lastSavedText);
    
    // Show typing dots immediately when user types
    if (value !== lastSavedText && value.trim().length > 0) {
      setSaveStatus('saving');
    }
    
    // Clear existing save timeout but preserve batch timeout if it's close to completion
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    // Only clear batch timeout if batch progress is less than 80% (allow batching to complete)
    if (parseTimeoutRef.current && batchProgress < 80) {
      clearTimeout(parseTimeoutRef.current);
      setBatchProgress(0);
    }
    
    // Auto-save after 500ms of no typing
    if (value.trim().length > 0) {
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave();
        setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }, 100);
      }, 500);
      
      // Start batching countdown only if not already in progress
      if (batchProgress === 0 && !parseTimeoutRef.current) {
        const startTime = Date.now();
        const batchInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = (elapsed / 5000) * 100;
          setBatchProgress(Math.min(progress, 100));
          
          if (progress >= 100) {
            clearInterval(batchInterval);
          }
        }, 50);
        
        // Batch after 5 seconds (clear input, add to writeup)
        parseTimeoutRef.current = setTimeout(() => {
          clearInterval(batchInterval);
          debouncedBatch();
        }, 5000);
      }
    } else {
      setSaveStatus('idle');
      if (batchProgress < 80) {
        setBatchProgress(0);
      }
    }
  };

  // Manual send handler for write-up content
  const handleSendWriteUp = async () => {
    if (writeUpContent.length === 0 || !workoutId) return;
    
    // Check if writeup content is not empty
    const fullText = writeUpContent.join(' ').trim();
    if (!fullText) {
      toast({
        title: "No Content",
        description: "No content to send to AI",
        variant: "destructive",
      });
      return;
    }
    
    setParseStatus('parsing');
    setParseProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setParseProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const response = await apiRequest("POST", `/api/workouts/${workoutId}/journal`, {
        journalText: fullText
      });
      
      clearInterval(progressInterval);
      setParseProgress(100);
      setParseStatus('parsed');
      
      // Clear write-up content after successful processing
      setWriteUpContent([]);
      setShowWriteUpSection(false);
      
      // Refresh exercises
      refetchExercises();
      
      setTimeout(() => {
        setParseStatus('idle');
        setParseProgress(0);
      }, 2000);
      
    } catch (error) {
      clearInterval(progressInterval);
      setParseStatus('idle');
      setParseProgress(0);
      toast({
        title: "Processing Failed",
        description: "Failed to process your journal entry",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (parseTimeoutRef.current) clearTimeout(parseTimeoutRef.current);
      if (parseProgressRef.current) clearTimeout(parseProgressRef.current);
    };
  }, []);

  const onSubmit = (data: z.infer<typeof workoutSchema>) => {
    if (workoutId) {
      updateWorkoutMutation.mutate(data);
    } else {
      createWorkoutMutation.mutate(data);
    }
  };

  const handleEndWorkout = () => {
    if (!workoutId) return;
    
    // Save final state and navigate back
    updateWorkoutMutation.mutate({
      name: form.getValues("name"),
      notes: journalText,
    }, {
      onSuccess: () => {
        navigate('/workouts');
        toast({
          title: "Workout Ended",
          description: "Your workout has been saved successfully!",
        });
      }
    });
  };

  const handleAddExercise = (data: z.infer<typeof exerciseSchema>) => {
    if (currentExercise) {
      updateExerciseMutation.mutate(data);
    } else {
      addExerciseMutation.mutate({
        ...data,
        muscleGroups: [], // This would be determined by exercise type
      });
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    exerciseForm.reset({
      name: exercise.name,
      sets: exercise.sets ?? null,
      reps: exercise.reps ?? null,
      weight: exercise.weight ?? null,
      rpe: exercise.rpe ?? null,
      restTime: exercise.restTime ?? null,
      notes: exercise.notes || "",
    } as any);
    setShowExerciseDialog(true);
  };

  const handleDeleteExercise = (exerciseId: number) => {
    deleteExerciseMutation.mutate(exerciseId);
  };

  const calculateWorkoutStats = () => {
    if (!exercises.length) return { totalSets: 0, totalVolume: 0, duration: 0 };
    
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
    const totalVolume = exercises.reduce((sum, ex) => 
      sum + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0)), 0
    );
    
    return { totalSets, totalVolume, duration: workout?.duration || 0 };
  };

  const stats = calculateWorkoutStats();

  if (workoutLoading) {
    return (
      <div className="pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
          <div className="bg-gray-200 h-6 w-32 rounded loading-shimmer"></div>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-gray-200 rounded-xl h-40 loading-shimmer"></div>
          <div className="bg-gray-200 rounded-xl h-32 loading-shimmer"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={workoutId ? "/workouts" : "/"}>
              <Button variant="ghost" size="icon" className="text-gray-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {workoutId ? (workout?.name || 'Workout') : 'New Workout'}
              </h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {workout?.isCompleted && (
              <Badge className="bg-green-500 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Done
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* New Workout Form */}
      {!workoutId && (
        <main className="flex-1 overflow-y-auto pb-4">
          <section className="px-4 py-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!workoutId && (
                <div className="text-center py-2 mb-4">
                  <div className="text-sm text-gray-500">Today's workout</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workout Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Push Day - Chest & Shoulders"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!workoutId && (
                <FormField
                  control={form.control}
                  name="aiGenerateName"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Generate workout name with AI
                        </FormLabel>
                        <div className="text-sm text-gray-500">
                          AI will create a name based on your exercises
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {!workoutId && (
                <Button
                  type="submit"
                  className="w-full bg-duolingo-green hover:bg-duolingo-green/90"
                  disabled={createWorkoutMutation.isPending}
                >
                  {createWorkoutMutation.isPending ? "Creating..." : "Start Workout"}
                </Button>
              )}
            </form>
          </Form>
        </section>

        {/* Workout Stats */}
        {workoutId && (
          <section className="px-4 mb-6">
            <Card className="border-0" style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              color: 'white'
            }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3" style={{color: '#ffffff'}}>Workout Progress</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{color: '#ffffff'}}>{exercises.length}</div>
                    <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{color: '#ffffff'}}>{stats.totalSets}</div>
                    <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Sets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{color: '#ffffff'}}>
                      {stats.totalVolume > 0 ? `${Math.round(stats.totalVolume / 1000)}K` : "0"}
                    </div>
                    <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Volume (lbs)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* iMessage-Style Journal Interface */}
        {workoutId && (
          <section className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-duolingo-green" />
                  <h2 className="font-semibold text-gray-900">Workout Journal</h2>
                </div>
                {writeUpContent.length > 0 && (
                  <Button
                    onClick={handleSendWriteUp}
                    size="sm"
                    disabled={parseStatus === 'parsing'}
                    className="bg-duolingo-green hover:bg-green-600 text-white"
                  >
                    {parseStatus === 'parsing' ? (
                      <>
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-2" />
                        Generate Exercises ({writeUpContent.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {/* Your sent messages */}
              {writeUpContent.map((message, index) => (
                <div key={index} className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md bg-duolingo-green text-white rounded-2xl rounded-br-md px-4 py-2">
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              ))}
              
              {/* Processing message */}
              {parseStatus === 'parsing' && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md bg-white border rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">AI is analyzing your workout...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div 
                        className="bg-duolingo-green h-1 rounded-full transition-all duration-200"
                        style={{ width: `${parseProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Current typing indicator */}
              {journalText.trim() && (
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md bg-blue-100 border border-blue-200 text-blue-800 rounded-2xl rounded-br-md px-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Writing...</span>
                      {saveStatus === 'saved' && (
                        <Check className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm">{journalText.length > 80 ? journalText.substring(0, 80) + '...' : journalText}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your workout thoughts... Press Enter to send"
                    value={journalText}
                    onChange={(e) => handleJournalChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (journalText.trim()) {
                          debouncedBatch();
                        }
                      }
                    }}
                    rows={1}
                    disabled={!isEditing || Boolean(workout?.isCompleted)}
                    className="resize-none w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-duolingo-green focus:border-transparent max-h-32"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (journalText.trim()) {
                      debouncedBatch();
                    }
                  }}
                  disabled={!journalText.trim()}
                  size="sm"
                  className="bg-duolingo-green hover:bg-green-600 text-white rounded-full w-10 h-10 p-0 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Exercises List - Optimized for Mobile */}
        {workoutId && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
              {isEditing && !workout?.isCompleted && (
                <Button
                  onClick={() => {
                    setCurrentExercise(null);
                    exerciseForm.reset();
                    setShowExerciseDialog(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="border-duolingo-green text-duolingo-green hover:bg-duolingo-green hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            <AnimatePresence>
              {exercises.length > 0 ? (
                <div className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="mx-4">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">{exercise.name}</h4>
                            <div className="flex items-center space-x-1">
                              {exercise.rpe && (
                                <Badge variant="secondary" className="text-xs px-2 py-1">RPE {exercise.rpe}</Badge>
                              )}
                              {isEditing && !workout?.isCompleted && (
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditExercise(exercise)}
                                    className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteExercise(exercise.id!)}
                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Individual Set Rows */}
                          <div className="space-y-2">
                            {/* Header Row - Compact Mobile */}
                            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 border-b border-gray-100 pb-1">
                              <span>Set</span>
                              <span>Reps</span>
                              <span>Wt</span>
                              <span>RPE</span>
                            </div>
                            
                            {/* Set Rows - Compact Mobile Layout */}
                            {exercise.sets ? (
                              Array.from({ length: exercise.sets }, (_, setIndex) => (
                                <div key={setIndex} className="grid grid-cols-4 gap-2 text-sm py-1.5 border-b border-gray-50 last:border-b-0">
                                  <span className="font-medium text-gray-700 text-center">{setIndex + 1}</span>
                                  <span className="text-gray-900 text-center">{exercise.reps || '-'}</span>
                                  <span className="text-gray-900 text-center">{exercise.weight ? `${exercise.weight}` : '-'}</span>
                                  <span className="text-gray-900 text-center">{exercise.rpe || '-'}</span>
                                </div>
                              ))
                            ) : (
                              <div className="grid grid-cols-4 gap-2 text-sm py-1.5 border-b border-gray-50">
                                <span className="font-medium text-gray-700 text-center">1</span>
                                <span className="text-gray-900 text-center">{exercise.reps || '-'}</span>
                                <span className="text-gray-900 text-center">{exercise.weight ? `${exercise.weight}` : '-'}</span>
                                <span className="text-gray-900 text-center">{exercise.rpe || '-'}</span>
                              </div>
                            )}
                          </div>
                          
                          {exercise.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{exercise.notes}"</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">No exercises logged</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Add exercises manually or write in your journal above
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Write-up Section - Stream of consciousness content */}
        {workoutId && writeUpContent.length > 0 && (
          <section className="px-4 mb-6">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-amber-800">
                  <Edit3 className="h-5 w-5 mr-2" />
                  Your Write-up
                </CardTitle>
                <p className="text-sm text-amber-700">
                  Stream of consciousness thoughts that didn't match exercise patterns
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {writeUpContent.map((content, index) => (
                    <div key={index} className="bg-white/60 rounded-lg p-3 border border-amber-200">
                      <p className="text-sm text-gray-700 italic">"{content}"</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-amber-600 font-medium">
                  📝 These thoughts will be included in your workout summary
                </div>
              </CardContent>
            </Card>
          </section>
        )}



        {/* Complete Workout Button */}
        {workoutId && exercises.length > 0 && !workout?.isCompleted && (
          <section className="px-4 mb-6">
            <Button
              onClick={() => completeWorkoutMutation.mutate()}
              disabled={completeWorkoutMutation.isPending}
              className="w-full bg-success-green hover:bg-success-green/90 text-white py-6 text-lg font-semibold"
            >
              {completeWorkoutMutation.isPending ? (
                "Analyzing workout..."
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Workout
                </>
              )}
            </Button>
          </section>
        )}
      </main>

      {/* Add Exercise Dialog - Mobile Optimized */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{currentExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
          </DialogHeader>
          <Form {...exerciseForm}>
            <form onSubmit={exerciseForm.handleSubmit(handleAddExercise)} className="space-y-3">
              <FormField
                control={exerciseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Exercise Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bench Press" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={exerciseForm.control}
                  name="sets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={exerciseForm.control}
                  name="reps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={exerciseForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="135"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={exerciseForm.control}
                  name="rpe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RPE (1-10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="7"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={exerciseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How did it feel?"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExerciseDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addExerciseMutation.isPending || updateExerciseMutation.isPending}
                  className="flex-1 bg-duolingo-green hover:bg-duolingo-green/90"
                >
                  {addExerciseMutation.isPending || updateExerciseMutation.isPending ? 
                    (currentExercise ? "Updating..." : "Adding...") : 
                    (currentExercise ? "Update Exercise" : "Add Exercise")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Workout Complete</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 text-center bg-gradient-to-br from-success-green to-green-600 text-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <h3 className="text-xl font-bold mb-2" style={{color: '#ffffff'}}>Workout Complete! 🎉</h3>
            <p className="mb-4 font-medium" style={{color: '#ffffff', opacity: 0.95}}>
              Great job crushing your workout today!
            </p>

            {completionData?.analysis && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4 text-left border border-white/20">
                <h4 className="font-semibold mb-2" style={{color: '#ffffff'}}>AI Coach Says:</h4>
                <p className="text-sm font-medium" style={{color: '#ffffff', opacity: 0.9}}>
                  {completionData.analysis.nextWorkoutRecommendation}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCompletion(false)}
                variant="secondary"
                className="flex-1"
              >
                Close
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-white text-success-green hover:bg-gray-50">
                  Go Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Achievement Modal */}
      {currentAchievement && (
        <AchievementModal
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
          achievement={{
            type: currentAchievement.type,
            title: currentAchievement.title,
            description: currentAchievement.description || "Great achievement!",
            data: currentAchievement.data
          }}
        />
      )}

      {!workoutId && <BottomNavigation />}
    </div>
  );
}
