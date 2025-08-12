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
import styles from "./profile.module.css";

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
      <header className={styles.header}>
        <h1>Profile</h1>
      </header>

      <main className={styles.main}>
        {/* User Info */}
        <section className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User className="h-8 w-8" style={{color: '#ffffff'}} />
            </div>
            <div>
              <h2 className={styles.userName}>{user?.username || "User"}</h2>
              <p className={styles.userEmail}>{user?.email || "user@example.com"}</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{userStats.totalWorkouts}</div>
              <div className={styles.statLabel}>Workouts</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{userStats.currentStreak}</div>
              <div className={styles.statLabel}>Day Streak</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{userStats.achievements}</div>
              <div className={styles.statLabel}>Badges</div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className={styles.tabSection}>
          <div className={styles.tabContainer}>
            <button
              onClick={() => setActiveTab("profile")}
              className={`${styles.tab} ${activeTab === "profile" ? styles.active : styles.inactive}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`${styles.tab} ${activeTab === "goals" ? styles.active : styles.inactive}`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`${styles.tab} ${activeTab === "achievements" ? styles.active : styles.inactive}`}
            >
              Badges
            </button>
          </div>
        </section>

        {/* Tab Content */}
        <section className={styles.tabContent}>
          {activeTab === "profile" && (
            <div className={styles.profileContent}>
              <Card>
                <CardHeader>
                  <CardTitle className={styles.headerLeft}>
                    <Settings className="h-5 w-5 marginRight: "0.5rem"}} />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                  <div className={styles.settingsItem}>
                    <div>
                      <Label>Push Notifications</Label>
                      <p className={styles.settingsDescription}>Get reminders about workouts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className={styles.settingsItem}>
                    <div>
                      <Label>Achievement Celebrations</Label>
                      <p className={styles.settingsDescription}>Show achievement animations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className={styles.settingsItem}>
                    <div>
                      <Label>AI Recommendations</Label>
                      <p className={styles.settingsDescription}>Personalized workout suggestions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className={styles.headerLeft}>
                    <Smartphone className="h-5 w-5 marginRight: "0.5rem"}} />
                    App Info
                  </CardTitle>
                </CardHeader>
                <CardContent style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
                  <div className={styles.appInfoItem}>
                    <span>Version</span>
                    <span style={{color: "var(--text-secondary)"}}>1.0.0</span>
                  </div>
                  <div className={styles.appInfoItem}>
                    <span>Storage Used</span>
                    <span style={{color: "var(--text-secondary)"}}>12.4 MB</span>
                  </div>
                  <Button variant="outline" style={{width: "100%"}}>
                    <Download className="h-4 w-4 marginRight: "0.5rem"}} />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "goals" && (
            <div className={styles.goalsContent}>
              <div className={styles.goalsHeader}>
                <h3 className={styles.goalsTitle}>Fitness Goals</h3>
                <Button
                  onClick={() => {
                    setEditingGoal(null);
                    form.reset();
                    setShowGoalDialog(true);
                  }}
                  size="sm"
                  className={styles.addGoalButton}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </Button>
              </div>

              {goals.length > 0 ? (
                <div className={styles.goalsList}>
                  {goals.map((goal) => {
                    const progress = goal.targetValue ? 
                      Math.min(100, (goal.currentValue! / goal.targetValue) * 100) : 0;
                    
                    return (
                      <Card key={goal.id} className={styles.goalCard}>
                        <CardContent className={styles.content}>
                          <div className={styles.header}>
                            <div style={{flex: "1"}}>
                              <h4 className={styles.goalTitle}>{goal.title}</h4>
                              <p className={styles.goalCategory}>
                                {goal.category} {goal.muscleGroup && `• ${goal.muscleGroup}`}
                              </p>
                            </div>
                            <div className={styles.goalActions}>
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
                                className={styles.deleteButton}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className={styles.progressSection}>
                            <div className={styles.progressInfo}>
                              <span>Progress</span>
                              <span>
                                {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            <Progress value={progress} className={styles.progressBar} />
                            <div className={styles.progressText}>
                              {Math.round(progress)}% complete
                            </div>
                          </div>

                          {goal.description && (
                            <p className={styles.goalDescription}>{goal.description}</p>
                          )}

                          {goal.targetDate && (
                            <div className={styles.goalDate}>
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
                <Card className={styles.emptyGoals}>
                  <CardContent className={styles.emptyGoalsContent}>
                    <div className={styles.emptyIcon}>
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className={styles.emptyTitle}>No goals yet</h3>
                    <p className={styles.emptyDescription}>
                      Set your first fitness goal to track progress and stay motivated!
                    </p>
                    <Button
                      onClick={() => setShowGoalDialog(true)}
                      className={styles.addGoalButton}
                    >
                      <Plus className="h-4 w-4" style={{marginRight: "0.5rem"}} />
                      Create First Goal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className={styles.achievementsContent}>
              <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem"}}>
                <Card style={{textAlign: "center"}}>
                  <CardContent className={styles.content}>
                    <div style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)"}}>{achievements.length}</div>
                    <div className={styles.statLabel}>Total Badges</div>
                  </CardContent>
                </Card>
                <Card style={{textAlign: "center"}}>
                  <CardContent className={styles.content}>
                    <div style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)"}}>{userStats.longestStreak}</div>
                    <div className={styles.statLabel}>Longest Streak</div>
                  </CardContent>
                </Card>
              </div>

              {achievements.length > 0 ? (
                <div style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
                  {achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className={styles.content}>
                        <div className={styles.headerLeft}>
                          <div className={styles.achievementIcon}>
                            <Trophy className="h-6 w-6" />
                          </div>
                          <div style={{flex: "1"}}>
                            <h4 className={styles.achievementName}>{achievement.title}</h4>
                            <p className={styles.achievementDescription}>{achievement.description}</p>
                            <div className={styles.achievementDate}>
                              {new Date(achievement.createdAt!).toLocaleDateString()}
                            </div>
                          </div>
                          {!achievement.isViewed && (
                            <Badge style={{background: "var(--warning)", color: "white"}}>New!</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className={styles.emptyGoals}>
                  <CardContent className={styles.emptyGoalsContent}>
                    <div className={styles.emptyIcon}>
                      <Award className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className={styles.emptyTitle}>No badges yet</h3>
                    <p className={styles.emptyDescription}>
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
            <form onSubmit={form.handleSubmit(onSubmitGoal)} style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
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

              <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem"}}>
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
                  style={{flex: "1"}}
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
