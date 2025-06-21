import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  Edit, 
  Trash2, 
  Send,
  Trophy,
  Target,
  Calendar,
  Clock
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Checkbox } from "@/components/Checkbox";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import AchievementModal from "@/components/achievement-modal";
import { insertWorkoutSchema, insertExerciseSchema, type Workout, type Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const workoutFormSchema = insertWorkoutSchema.extend({
  aiGenerateName: z.boolean().default(false)
});

const exerciseFormSchema = insertExerciseSchema.omit({ workoutId: true });

export default function WorkoutJournal() {
  const { workoutId } = useParams<{ workoutId?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [isEditing, setIsEditing] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  // Journal states
  const [currentInput, setCurrentInput] = useState("");
  const [currentThought, setCurrentThought] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'typing' | 'saved'>('idle');
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Forms
  const form = useForm<z.infer<typeof workoutFormSchema>>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: "",
      aiGenerateName: false
    }
  });

  const editForm = useForm<z.infer<typeof exerciseFormSchema>>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: "",
      sets: 0,
      notes: ""
    }
  });

  // Queries
  const { data: workout, isLoading: workoutLoading } = useQuery<Workout>({
    queryKey: ['/api/workouts', workoutId],
    enabled: !!workoutId
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/workouts', workoutId, 'exercises'],
    enabled: !!workoutId
  });

  const { data: activeProgram } = useQuery({
    queryKey: ['/api/programs/active', { userId: 1 }],
    queryFn: () => fetch('/api/programs/active?userId=1').then(res => res.json()),
    enabled: !workoutId
  });

  const { data: todaysWorkout } = useQuery({
    queryKey: ['/api/programs', activeProgram?.id, 'today'],
    queryFn: () => fetch(`/api/programs/${activeProgram.id}/today`).then(res => res.json()),
    enabled: !!activeProgram && !workoutId
  });

  // Mutations
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workoutFormSchema>) => {
      // Create workout with program-based name if available
      const workoutData = {
        ...data,
        name: todaysWorkout ? `${todaysWorkout.programName} - ${todaysWorkout.workout.name}` : data.name,
        userId: 1
      };
      
      const response = await apiRequest('POST', `/api/workouts`, workoutData);
      const workout = await response.json();

      // If we have a program workout, pre-load exercises
      if (todaysWorkout && todaysWorkout.workout.exercises) {
        for (const programExercise of todaysWorkout.workout.exercises) {
          await apiRequest('POST', `/api/exercises`, {
            workoutId: workout.id,
            name: programExercise.name,
            sets: parseInt(programExercise.sets.split('-')[0]) || 3,
            reps: parseInt(programExercise.reps.split('-')[0]) || 8,
            restTime: programExercise.restTime || 60,
            notes: programExercise.notes || `Target: ${programExercise.sets} sets × ${programExercise.reps} reps`
          });
        }
      }

      return workout;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      navigate(`/workout-journal/${data.id}`);
      toast({
        title: "Workout started!",
        description: todaysWorkout ? "Program exercises loaded - ready to train!" : "Ready to log your exercises"
      });
    }
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Exercise> }) => {
      const response = await apiRequest('PATCH', `/api/exercises/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', workoutId, 'exercises'] });
      setEditingExercise(null);
      toast({
        title: "Exercise updated!",
        description: "Changes saved successfully"
      });
    }
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', workoutId, 'exercises'] });
      toast({
        title: "Exercise deleted",
        description: "Exercise removed from workout"
      });
    }
  });

  const parseJournalMutation = useMutation({
    mutationFn: async (journalText: string) => {
      const response = await apiRequest('POST', `/api/workouts/${workoutId}/parse-journal`, { journalText });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', workoutId, 'exercises'] });
      setCurrentThought("");
      setCurrentInput("");
      setSendProgress(0);
      setIsSending(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      toast({
        title: "Exercises added!",
        description: "AI parsed your journal entry"
      });
    },
    onError: () => {
      setIsSending(false);
      setSendProgress(0);
    }
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/workouts/${workoutId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', workoutId] });
      
      if (data.achievements && data.achievements.length > 0) {
        setCurrentAchievement(data.achievements[0]);
        setShowAchievement(true);
      }
      
      setShowCompleteDialog(false);
      toast({
        title: "Workout completed!",
        description: "Great job finishing your workout"
      });
    }
  });

  // Handlers
  const onSubmit = (data: z.infer<typeof workoutFormSchema>) => {
    createWorkoutMutation.mutate(data);
  };

  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setCurrentThought(value);
    setSaveStatus('typing');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendBatch();
    }
  };

  const handleSendBatch = () => {
    if (!currentInput.trim() || isSending) return;

    setIsSending(true);
    setSendProgress(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    parseJournalMutation.mutate(currentInput.trim());
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    editForm.reset({
      name: exercise.name,
      sets: exercise.sets || 0,
      notes: exercise.notes || ""
    });
  };

  const handleUpdateExercise = (data: z.infer<typeof exerciseFormSchema>) => {
    if (editingExercise?.id) {
      updateExerciseMutation.mutate({
        id: editingExercise.id,
        data
      });
    }
  };

  const handleDeleteExercise = (id: number) => {
    deleteExerciseMutation.mutate(id);
  };

  // Effects
  useEffect(() => {
    if (workoutId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [workoutId]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (workoutId && (workoutLoading || exercisesLoading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border border-gray-300 border-t-duolingo-green rounded-full"></div>
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
          {/* Program Workout Info */}
          {todaysWorkout && (
            <section className="bg-gradient-to-r from-duolingo-green to-green-600 text-white px-4 py-6">
              <h2 className="text-xl font-bold mb-2">Today's Program Workout</h2>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{todaysWorkout.workout.name}</h3>
                  <Badge className="bg-white/20 text-white">
                    Day {todaysWorkout.dayNumber} of {todaysWorkout.totalDays}
                  </Badge>
                </div>
                <p className="text-green-100 text-sm mb-3">
                  {todaysWorkout.workout.exercises?.length || 0} exercises planned from {todaysWorkout.programName}
                </p>
                <div className="text-xs text-green-100">
                  Exercises will be pre-loaded when you start your workout
                </div>
              </div>
            </section>
          )}

          <section className="px-4 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                {!todaysWorkout && (
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
                )}

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

                <Button 
                  type="submit" 
                  className="w-full bg-duolingo-green hover:bg-green-600 text-white"
                  disabled={createWorkoutMutation.isPending}
                >
                  {createWorkoutMutation.isPending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2" />
                      {todaysWorkout ? "Loading Program Exercises..." : "Creating..."}
                    </>
                  ) : (
                    todaysWorkout ? `Start ${todaysWorkout.workout.name}` : "Start Workout"
                  )}
                </Button>
              </form>
            </Form>
          </section>
        </main>
      )}

      {/* iMessage-Style Journal Interface */}
      {workoutId && (
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Current batch display */}
            {currentThought && (
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-xs break-words">
                  {currentThought}
                </div>
              </div>
            )}

            {/* Exercise cards */}
            {exercises.map((exercise: any, index: number) => (
              <div key={exercise.id || index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExercise(exercise)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExercise(exercise.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0 && (
                  <div className="space-y-1">
                    {exercise.sets.map((set: any, setIndex: number) => (
                      <div key={setIndex} className="text-sm text-gray-600 flex justify-between">
                        <span>Set {setIndex + 1}</span>
                        <span>
                          {set.reps && `${set.reps} reps`}
                          {set.weight && ` × ${set.weight}${set.unit || 'lbs'}`}
                          {set.duration && ` for ${set.duration}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {exercise.notes && (
                  <div className="mt-2 text-sm text-gray-600 italic">
                    {exercise.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type what you're doing..."
                  className="resize-none border-gray-300 rounded-2xl px-4 py-3 min-h-[44px] max-h-32"
                  rows={1}
                  style={{ 
                    height: 'auto',
                    minHeight: '44px'
                  }}
                />
                
                {/* Save status indicator */}
                <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                  {saveStatus === 'typing' && '...'}
                  {saveStatus === 'saved' && '✓ saved!'}
                </div>
              </div>
              
              <Button
                onClick={handleSendBatch}
                disabled={!currentInput.trim() || isSending}
                className="rounded-full h-11 w-11 p-0 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSending ? (
                  <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Progress indicator */}
            {isSending && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                       style={{ width: `${sendProgress}%` }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Sending to AI...</div>
              </div>
            )}
          </div>

          {/* Complete Workout Button */}
          {!workout?.isCompleted && (
            <div className="p-4 bg-white border-t">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                disabled={exercises.length === 0}
              >
                Complete Workout
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Exercise Edit Dialog */}
      <Dialog open={!!editingExercise} onOpenChange={() => setEditingExercise(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          
          {editingExercise && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateExercise)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingExercise(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-duolingo-green hover:bg-green-600 text-white"
                    disabled={updateExerciseMutation.isPending}
                  >
                    {updateExerciseMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Workout Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you ready to finish this workout? AI will analyze your session and provide insights.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-5 w-5 text-duolingo-green" />
                <span className="font-medium">{exercises.length} exercises logged</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Started {workout?.createdAt ? new Date(workout.createdAt).toLocaleTimeString() : 'today'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                className="flex-1"
              >
                Keep Going
              </Button>
              <Button
                onClick={() => completeWorkoutMutation.mutate()}
                disabled={completeWorkoutMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                {completeWorkoutMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2" />
                    Completing...
                  </>
                ) : (
                  "Complete Workout"
                )}
              </Button>
            </div>
          </div>
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