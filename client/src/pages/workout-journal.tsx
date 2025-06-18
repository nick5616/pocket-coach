import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Calendar
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
  sets: z.number().min(1).optional(),
  reps: z.number().min(1).optional(),
  weight: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
  restTime: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export default function WorkoutJournal() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [journalText, setJournalText] = useState("");
  const [isEditing, setIsEditing] = useState(!id);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

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

  const exerciseForm = useForm({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      sets: undefined,
      reps: undefined,
      weight: undefined,
      rpe: undefined,
      restTime: undefined,
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
    queryFn: () => workout?.exercises || [],
    enabled: !!workout,
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
      refetchExercises();
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId] });
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
      exerciseForm.reset();
      toast({
        title: "Exercise Added",
        description: "Exercise has been added to your workout!",
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

  const onSubmit = (data: z.infer<typeof workoutSchema>) => {
    if (workoutId) {
      updateWorkoutMutation.mutate(data);
    } else {
      createWorkoutMutation.mutate(data);
    }
  };

  const handleJournalSave = () => {
    if (!workoutId || !journalText.trim()) return;
    
    updateWorkoutMutation.mutate({
      name: form.getValues("name"),
      notes: journalText,
    });
    
    // Parse the journal with AI
    parseJournalMutation.mutate(journalText);
  };

  const handleAddExercise = (data: z.infer<typeof exerciseSchema>) => {
    addExerciseMutation.mutate({
      ...data,
      muscleGroups: [], // This would be determined by exercise type
    });
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
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={workoutId ? "/workouts" : "/"}>
              <Button variant="ghost" size="icon" className="text-gray-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">
              {workoutId ? (isEditing ? "Edit Workout" : "Workout Details") : "New Workout"}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {workoutId && !workout?.isCompleted && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="ghost"
                size="icon"
                className="text-gray-500"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {workout?.isCompleted && (
              <Badge className="bg-success-green text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Workout Form */}
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
            <Card className="bg-gradient-to-r from-duolingo-blue to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Workout Progress</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold">{exercises.length}</div>
                    <div className="text-xs text-blue-100">Exercises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.totalSets}</div>
                    <div className="text-xs text-blue-100">Sets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {stats.totalVolume > 0 ? `${Math.round(stats.totalVolume / 1000)}K` : "0"}
                    </div>
                    <div className="text-xs text-blue-100">Volume (lbs)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Free-form Journal */}
        {workoutId && (
          <section className="px-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="h-5 w-5 mr-2 text-duolingo-green" />
                  Workout Journal
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Write about your workout naturally - our AI will extract exercises and data!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Hit the gym hard today! Started with bench press - felt strong at 185lbs for 3 sets of 8. Moved to lateral raises with 20lb dumbbells, really felt the burn on the last set. Finished with some tricep work..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  rows={6}
                  disabled={!isEditing || Boolean(workout?.isCompleted)}
                  className="resize-none"
                />
                
                {isEditing && !workout?.isCompleted && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleJournalSave}
                      disabled={updateWorkoutMutation.isPending || parseJournalMutation.isPending}
                      className="bg-duolingo-green hover:bg-duolingo-green/90"
                    >
                      {parseJournalMutation.isPending ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save & Parse
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Exercises List */}
        {workoutId && (
          <section className="px-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
              {isEditing && !workout?.isCompleted && (
                <Button
                  onClick={() => setShowExerciseDialog(true)}
                  size="sm"
                  variant="outline"
                  className="border-duolingo-green text-duolingo-green hover:bg-duolingo-green hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exercise
                </Button>
              )}
            </div>

            <AnimatePresence>
              {exercises.length > 0 ? (
                <div className="space-y-3">
                  {exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                            {exercise.rpe && (
                              <Badge variant="secondary">RPE {exercise.rpe}</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            {exercise.sets && (
                              <div>
                                <span className="font-medium">{exercise.sets}</span>
                                <span className="text-gray-400 ml-1">sets</span>
                              </div>
                            )}
                            {exercise.reps && (
                              <div>
                                <span className="font-medium">{exercise.reps}</span>
                                <span className="text-gray-400 ml-1">reps</span>
                              </div>
                            )}
                            {exercise.weight && (
                              <div>
                                <span className="font-medium">{exercise.weight}</span>
                                <span className="text-gray-400 ml-1">lbs</span>
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

      {/* Add Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <Form {...exerciseForm}>
            <form onSubmit={exerciseForm.handleSubmit(handleAddExercise)} className="space-y-4">
              <FormField
                control={exerciseForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bench Press" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                  disabled={addExerciseMutation.isPending}
                  className="flex-1 bg-duolingo-green hover:bg-duolingo-green/90"
                >
                  {addExerciseMutation.isPending ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-0 overflow-hidden">
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
            
            <h3 className="text-xl font-bold mb-2">Workout Complete! 🎉</h3>
            <p className="text-green-100 mb-4">
              Great job crushing your workout today!
            </p>

            {completionData?.analysis && (
              <div className="bg-white/10 rounded-lg p-3 mb-4 text-left">
                <h4 className="font-semibold mb-2">AI Coach Says:</h4>
                <p className="text-sm text-green-100">
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

      <BottomNavigation />
    </>
  );
}
