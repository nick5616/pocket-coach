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
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Settings, 
  Target, 
  Award, 
  Calendar,
  Edit,
  Save,
  X,
  LogOut,
  Mail
} from "lucide-react";
import type { User as UserType, Goal, Achievement } from "@shared/schema";

export default function Profile() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserType>>({});
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "strength",
    targetValue: 0,
    unit: "reps"
  });
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useAuth();

  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  // Show loading screen if any essential data is still loading
  const isLoading = userLoading || goalsLoading || achievementsLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  if (!user) {
    return <LoadingScreen message="Authenticating..." />;
  }

  const updateUserMutation = useMutation({
    mutationFn: (updatedUser: Partial<UserType>) =>
      fetch(`/api/user/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      setIsEditingProfile(false);
      setEditingUser({});
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (goal: any) =>
      fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...goal, userId: user?.id }),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Goal created successfully" });
      setIsCreateGoalOpen(false);
      setNewGoal({ title: "", description: "", category: "strength", targetValue: 0, unit: "reps" });
    },
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (userLoading || goalsLoading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  const handleProfileSave = () => {
    updateUserMutation.mutate(editingUser);
  };

  const handleGoalCreate = () => {
    createGoalMutation.mutate(newGoal);
  };

  const completedGoals = goals.filter(g => g.status === 'completed');
  const activeGoals = goals.filter(g => g.status !== 'completed');

  return (
    <>
      <main className="pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your fitness profile</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                {isEditingProfile ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Profile Section */}
        <section className="px-4 py-6 bg-white border-b">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  {isEditingProfile ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="First Name"
                        value={editingUser.firstName || user?.firstName || ""}
                        onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                      />
                      <Input
                        placeholder="Last Name"
                        value={editingUser.lastName || user?.lastName || ""}
                        onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={editingUser.email || user?.email || ""}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'User'}
                      </h2>
                      <div className="flex items-center mt-1 text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {user?.email}
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge variant="outline">
                          🔥 {user?.currentStreak || 0} day streak
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                {isEditingProfile && (
                  <Button onClick={handleProfileSave} disabled={updateUserMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Grid */}
        <section className="px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Goals Section */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
            <Button onClick={() => setIsCreateGoalOpen(true)} size="sm">
              <Target className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>

          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge variant="outline">{goal.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{goal.currentValue || 0} / {goal.targetValue} {goal.unit}</span>
                    </div>
                    <Progress 
                      value={((goal.currentValue || 0) / (goal.targetValue || 1)) * 100} 
                      max={100} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {goals.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No goals set</h4>
                  <p className="text-gray-600 mb-4">Set your first fitness goal to start tracking progress</p>
                  <Button onClick={() => setIsCreateGoalOpen(true)}>
                    <Target className="w-4 h-4 mr-2" />
                    Create First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="px-4 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          
          <div className="space-y-3">
            {achievements.slice(0, 3).map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <Badge>{achievement.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {achievements.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Complete workouts to earn achievements</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Create Goal Dialog */}
      <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                placeholder="Goal description"
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={newGoal.category}
                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
              >
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="muscle_building">Muscle Building</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                >
                  <option value="reps">Reps</option>
                  <option value="lbs">Lbs</option>
                  <option value="kg">Kg</option>
                  <option value="minutes">Minutes</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleGoalCreate} 
                disabled={createGoalMutation.isPending || !newGoal.title}
                className="flex-1"
              >
                Create Goal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateGoalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </>
  );
}