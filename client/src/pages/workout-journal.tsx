import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { type Workout, type Exercise } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function WorkoutJournal() {
  const { workoutId } = useParams<{ workoutId?: string }>();
  const [, setLocation] = useLocation();
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

  // Form data states
  const [workoutName, setWorkoutName] = useState("");
  const [aiGenerateName, setAiGenerateName] = useState(false);
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editExerciseNotes, setEditExerciseNotes] = useState("");

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Queries
  const { data: workout } = useQuery({
    queryKey: ["/api/workouts", workoutId],
    enabled: !!workoutId
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["/api/workouts", workoutId, "exercises"],
    enabled: !!workoutId
  });

  const { data: todaysWorkout } = useQuery({
    queryKey: ["/api/programs/active/today"],
    enabled: !workoutId
  });

  // Mutations
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: { userId: number; name: string; aiGenerateName: boolean }) => {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create workout');
      return response.json();
    }
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to complete workout');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.achievements?.length > 0) {
        setCurrentAchievement(data.achievements[0]);
        setShowAchievement(true);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      setLocation("/");
    }
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; notes: string }) => {
      const response = await fetch(`/api/exercises/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, notes: data.notes })
      });
      if (!response.ok) throw new Error('Failed to update exercise');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId, "exercises"] });
      setEditingExercise(null);
      toast({ title: "Exercise updated successfully" });
    }
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error('Failed to delete exercise');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId, "exercises"] });
      toast({ title: "Exercise deleted successfully" });
    }
  });

  // Handlers
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workoutData = {
        userId: 1,
        name: workoutName || "Unnamed Workout",
        aiGenerateName: aiGenerateName
      };
      
      const result = await createWorkoutMutation.mutateAsync(workoutData);
      setLocation(`/workout-journal/${result.id}`);
    } catch (error) {
      console.error("Failed to create workout:", error);
    }
  };

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;
    
    try {
      await updateExerciseMutation.mutateAsync({
        id: editingExercise.id,
        name: editExerciseName,
        notes: editExerciseNotes
      });
    } catch (error) {
      console.error("Failed to update exercise:", error);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditExerciseName(exercise.name);
    setEditExerciseNotes(exercise.notes || "");
  };

  const handleDeleteExercise = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this exercise?")) {
      await deleteExerciseMutation.mutateAsync(id);
    }
  };

  // Journal logic (simplified for this clean version)
  const handleSendThoughts = async () => {
    if (!currentInput.trim()) return;
    
    setIsSending(true);
    setSendProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setSendProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      await fetch(`/api/workouts/${workoutId}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentInput })
      });

      clearInterval(progressInterval);
      setSendProgress(100);
      
      setTimeout(() => {
        setCurrentInput("");
        setIsSending(false);
        setSendProgress(0);
        queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId, "exercises"] });
      }, 500);
      
    } catch (error) {
      console.error("Failed to send thoughts:", error);
      setIsSending(false);
      setSendProgress(0);
    }
  };

  // Loading states
  if (workoutId && !workout) {
    return <div>Loading workout...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              {workoutId ? (workout?.name || "Workout") : "New Workout"}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {!workoutId ? (
          // Create Workout Form
          <section className="px-4 py-6">
            <form onSubmit={handleCreateWorkout} className="space-y-4">
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

              <div>
                <label htmlFor="workoutName" className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name
                </label>
                <Input
                  id="workoutName"
                  type="text"
                  placeholder="e.g., Push Day - Chest & Shoulders"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="aiGenerateName"
                  checked={aiGenerateName}
                  onChange={(e) => setAiGenerateName(e.target.checked)}
                />
                <div>
                  <label htmlFor="aiGenerateName" className="text-sm font-medium text-gray-700">
                    Have AI name it later
                  </label>
                  <div className="text-sm text-gray-500">
                    AI will create a name based on your exercises
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createWorkoutMutation.isPending || (!workoutName && !aiGenerateName)}
              >
                {createWorkoutMutation.isPending ? "Creating..." : "Start Workout"}
              </Button>
            </form>
          </section>
        ) : (
          // Workout Journal
          <div className="space-y-6">
            {/* Exercise List */}
            <section className="px-4 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercises</h2>
              <div className="space-y-3">
                {exercises.map((exercise: Exercise) => (
                  <div key={exercise.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                        {exercise.notes && (
                          <p className="text-sm text-gray-600 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Journal Input */}
            <section className="px-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="How's your workout going? Log exercises, sets, reps, or just your thoughts..."
                  className="border-0 resize-none min-h-[120px]"
                />
                <div className="border-t border-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {saveStatus === 'typing' && "Typing..."}
                      {saveStatus === 'saved' && "✓ Saved!"}
                    </div>
                    <Button
                      onClick={handleSendThoughts}
                      disabled={!currentInput.trim() || isSending}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to AI
                    </Button>
                  </div>
                  {isSending && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${sendProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Complete Workout Button */}
            <section className="px-4 pb-6">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Complete Workout
              </Button>
            </section>
          </div>
        )}
      </main>

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
                <Target className="h-5 w-5 text-green-500" />
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

      {/* Exercise Edit Dialog */}
      <Dialog open={!!editingExercise} onOpenChange={() => setEditingExercise(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          
          {editingExercise && (
            <form onSubmit={handleUpdateExercise} className="space-y-4">
              <div>
                <label htmlFor="exerciseName" className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name
                </label>
                <Input
                  id="exerciseName"
                  type="text"
                  value={editExerciseName}
                  onChange={(e) => setEditExerciseName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="exerciseNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Textarea
                  id="exerciseNotes"
                  value={editExerciseNotes}
                  onChange={(e) => setEditExerciseNotes(e.target.value)}
                />
              </div>

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
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  disabled={updateExerciseMutation.isPending}
                >
                  {updateExerciseMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
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