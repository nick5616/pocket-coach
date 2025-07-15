import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/Badge";
import { Progress } from "@/components/Progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Settings, 
  Target, 
  Trophy, 
  Bell,
  Shield,
  Smartphone,
  Download,
  Plus,
  Edit,
  Trash2,
  Award,
  Calendar,
  TrendingUp
} from "lucide-react";
import type { User as UserType, Goal, Achievement } from "@shared/schema";

const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().optional(),
  category: z.enum(["strength", "muscle_building", "endurance"]),
  muscleGroup: z.string().optional(),
  targetValue: z.number().min(0),
  unit: z.string().min(1, "Unit is required"),
  targetDate: z.string().optional(),
});

export default function Profile() {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  
  const userId = 1; // Mock user ID

  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "muscle_building" as const,
      muscleGroup: "",
      targetValue: 0,
      unit: "",
      targetDate: "",
    },
  });

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user", userId],
    queryFn: () => fetch(`/api/user/${userId}`).then(res => res.json()),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () => fetch(`/api/goals?userId=${userId}`).then(res => res.json()),
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements", { userId }],
    queryFn: () => fetch(`/api/achievements?userId=${userId}`).then(res => res.json()),
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof goalSchema>) => {
      const response = await apiRequest("POST", "/api/goals", {
        userId,
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowGoalDialog(false);
      setEditingGoal(null);
      form.reset();
      toast({
        title: "Goal Created",
        description: "Your new goal has been added!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Goal> }) => {
      const response = await apiRequest("PATCH", `/api/goals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowGoalDialog(false);
      setEditingGoal(null);
      form.reset();
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated!",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Deleted",
        description: "Goal has been removed.",
      });
    },
  });

  const onSubmitGoal = (data: z.infer<typeof goalSchema>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    form.setValue("title", goal.title);
    form.setValue("description", goal.description || "");
    form.setValue("category", goal.category as any);
    form.setValue("muscleGroup", goal.muscleGroup || "");
    form.setValue("targetValue", goal.targetValue || 0);
    form.setValue("unit", goal.unit || "");
    form.setValue("targetDate", goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "");
    setShowGoalDialog(true);
  };

  const userStats = {
    totalWorkouts: 24,
    currentStreak: user?.currentStreak || 0,
    longestStreak: 15,
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.status === "completed").length,
    achievements: achievements.length,
  };

  const muscleGroups = [
    "chest", "back", "shoulders", "biceps", "triceps", 
    "legs", "glutes", "core", "calves", "forearms"
  ];

  const units = [
    "lbs", "kg", "reps", "seconds", "minutes", "miles", "km", "inches", "cm"
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
        <h1 className="text-lg font-bold text-gray-900">Profile</h1>
      </header>

      <main className="pb-20">
        {/* User Info */}
        <section className="px-4 py-6" style={{
          background: 'linear-gradient(135deg, #65a30d 0%, #16a34a 100%)',
          color: 'white'
        }}>
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <User className="h-8 w-8" style={{color: '#ffffff'}} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{color: '#ffffff'}}>{user?.username || "User"}</h2>
              <p className="font-medium" style={{color: '#ffffff', opacity: 0.9}}>{user?.email || "user@example.com"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{userStats.totalWorkouts}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Workouts</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{userStats.currentStreak}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Day Streak</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{
              backgroundColor: 'rgba(21, 128, 61, 0.7)',
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}>
              <div className="text-2xl font-bold" style={{color: '#ffffff'}}>{userStats.achievements}</div>
              <div className="text-xs font-medium" style={{color: '#ffffff', opacity: 0.9}}>Badges</div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-4 py-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "goals"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "achievements"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Badges
            </button>
          </div>
        </section>

        {/* Tab Content */}
        <section className="px-4">
          {activeTab === "profile" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 marginRight: "0.5rem"}} />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Get reminders about workouts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Achievement Celebrations</Label>
                      <p className="text-sm text-gray-500">Show achievement animations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Recommendations</Label>
                      <p className="text-sm text-gray-500">Personalized workout suggestions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="h-5 w-5 marginRight: "0.5rem"}} />
                    App Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Version</span>
                    <span className="text-gray-500">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <span className="text-gray-500">12.4 MB</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 marginRight: "0.5rem"}} />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Fitness Goals</h3>
                <Button
                  onClick={() => {
                    setEditingGoal(null);
                    form.reset();
                    setShowGoalDialog(true);
                  }}
                  size="sm"
                  className="bg-duolingo-green hover:bg-duolingo-green/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </div>

              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const progress = goal.targetValue ? 
                      Math.min(100, (goal.currentValue! / goal.targetValue) * 100) : 0;
                    
                    return (
                      <Card key={goal.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                              <p className="text-sm text-gray-500 capitalize">
                                {goal.category} {goal.muscleGroup && `• ${goal.muscleGroup}`}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditGoal(goal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteGoalMutation.mutate(goal.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>
                                {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs text-gray-500 text-right">
                              {Math.round(progress)}% complete
                            </div>
                          </div>

                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-3">{goal.description}</p>
                          )}

                          {goal.targetDate && (
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              Target: {new Date(goal.targetDate).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
                    <p className="text-gray-500 mb-4">
                      Set your first fitness goal to track progress and stay motivated!
                    </p>
                    <Button
                      onClick={() => setShowGoalDialog(true)}
                      className="bg-duolingo-green hover:bg-duolingo-green/90"
                    >
                      <Plus className="h-4 w-4 marginRight: "0.5rem"}} />
                      Create First Goal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)"}}>{achievements.length}</div>
                    <div className="text-sm text-gray-500">Total Badges</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)"}}>{userStats.longestStreak}</div>
                    <div className="text-sm text-gray-500">Longest Streak</div>
                  </CardContent>
                </Card>
              </div>

              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-duolingo-green/10 rounded-full flex items-center justify-center mr-4">
                            <Trophy className="h-6 w-6 text-duolingo-green" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(achievement.createdAt!).toLocaleDateString()}
                            </div>
                          </div>
                          {!achievement.isViewed && (
                            <Badge className="bg-energetic-orange text-white">New!</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet</h3>
                    <p className="text-gray-500">
                      Complete workouts and reach your goals to earn achievement badges!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Goal" : "Add New Goal"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitGoal)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bench 225 lbs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="muscle_building">Muscle Building</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="muscleGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Muscle Group (optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select muscle group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {muscleGroups.map((muscle) => (
                          <SelectItem key={muscle} value={muscle}>
                            {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="225"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your goal..."
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
                  onClick={() => setShowGoalDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                  className="flex-1 bg-duolingo-green hover:bg-duolingo-green/90"
                >
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </>
  );
}
