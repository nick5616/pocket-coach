import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Play, 
  Plus, 
  Star, 
  Clock, 
  Target,
  Dumbbell,
  CheckCircle
} from "lucide-react";
import type { Program } from "@shared/schema";

const equipmentOptions = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell" },
  { id: "bench", label: "Bench" },
  { id: "pullup_bar", label: "Pull-up Bar" },
  { id: "cables", label: "Cable Machine" },
  { id: "machines", label: "Weight Machines" },
  { id: "resistance_bands", label: "Resistance Bands" },
  { id: "bodyweight", label: "Bodyweight Only" },
];

export default function Programs() {
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "completed">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    durationWeeks: 4,
    focusAreas: [] as string[],
    equipment: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = 1; // Demo user

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs", { userId }],
    queryFn: () => fetch(`/api/programs?userId=${userId}`).then(res => res.json()),
  });

  const { data: activeProgram } = useQuery<Program | null>({
    queryKey: ["/api/programs/active", { userId }],
    queryFn: () => fetch(`/api/programs/active?userId=${userId}`).then(res => res.json()),
  });

  const activateProgramMutation = useMutation({
    mutationFn: (programId: number) =>
      fetch(`/api/programs/${programId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Program activated successfully" });
    },
  });

  const createProgramMutation = useMutation({
    mutationFn: async (program: any) => {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(program),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create program: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Program created successfully" });
      setIsCreateOpen(false);
      setNewProgram({
        name: "",
        description: "",
        difficulty: "beginner",
        durationWeeks: 4,
        focusAreas: [],
        equipment: []
      });
      // Invalidate and refetch programs list
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
    },
    onError: (error: Error) => {
      console.error("Program creation error:", error);
      toast({ 
        title: "Failed to create program",
        description: error.message 
      });
    },
  });

  const filteredPrograms = programs.filter(program => {
    if (selectedTab === "active") return program.isActive;
    if (selectedTab === "completed") return program.isCompleted;
    return true;
  });

  const handleCreateProgram = () => {
    createProgramMutation.mutate(newProgram);
  };

  const toggleFocusArea = (area: string) => {
    setNewProgram(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const toggleEquipment = (equipmentId: string) => {
    setNewProgram(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading programs...</div>
      </div>
    );
  }

  return (
    <>
      <main className="pb-20 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
              <p className="text-gray-600 mt-1">Structured workout plans</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Program
            </Button>
          </div>
        </header>

        {/* Active Program Banner */}
        {activeProgram && (
          <section className="px-4 py-4 bg-blue-50 border-b">
            <Card className="border-blue-200 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">Active Program</h3>
                      <p className="text-sm text-blue-700">{activeProgram.name}</p>
                    </div>
                  </div>
                  <Link href="/workout-journal">
                    <Button size="sm">
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Tab Navigation */}
        <section className="px-4 py-4 bg-white border-b">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={selectedTab === "all" ? "primary" : "outline"}
              onClick={() => setSelectedTab("all")}
              size="sm"
            >
              All ({programs.length})
            </Button>
            <Button 
              variant={selectedTab === "active" ? "primary" : "outline"}
              onClick={() => setSelectedTab("active")}
              size="sm"
            >
              Active ({programs.filter(p => p.isActive).length})
            </Button>
            <Button 
              variant={selectedTab === "completed" ? "primary" : "outline"}
              onClick={() => setSelectedTab("completed")}
              size="sm"
            >
              Done ({programs.filter(p => p.isCompleted).length})
            </Button>
          </div>
        </section>

        {/* Programs List */}
        <section className="px-4 py-4">
          <div className="space-y-4">
            {filteredPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{program.name}</h3>
                        {program.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                        {program.isCompleted && (
                          <Badge variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {program.durationWeeks} weeks
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {program.difficulty}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {program.focusAreas?.join(", ") || "General"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!program.isActive && !program.isCompleted && (
                        <Button 
                          onClick={() => activateProgramMutation.mutate(program.id)}
                          disabled={activateProgramMutation.isPending}
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {program.isActive && (
                        <Link href="/workout-journal">
                          <Button size="sm">
                            <Dumbbell className="w-4 h-4 mr-2" />
                            Workout
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedTab === "all" ? "No programs available" : `No ${selectedTab} programs`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedTab === "all" 
                      ? "Create your first workout program to get started"
                      : `You don't have any ${selectedTab} programs yet`
                    }
                  </p>
                  {selectedTab === "all" && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Program
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Create Program Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
              <Input
                placeholder="e.g., 12-Week Strength Builder"
                value={newProgram.name}
                onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                placeholder="Brief description of the program"
                value={newProgram.description}
                onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newProgram.difficulty}
                  onChange={(e) => setNewProgram({...newProgram, difficulty: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={newProgram.durationWeeks}
                  onChange={(e) => setNewProgram({...newProgram, durationWeeks: parseInt(e.target.value) || 4})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas</label>
              <div className="space-y-2">
                {["Strength", "Cardio", "Flexibility", "Muscle Building", "Fat Loss"].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newProgram.focusAreas.includes(area)}
                      onChange={() => toggleFocusArea(area)}
                    />
                    <label className="text-sm text-gray-700">{area}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Equipment</label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newProgram.equipment.includes(equipment.id)}
                      onChange={() => toggleEquipment(equipment.id)}
                    />
                    <label className="text-sm text-gray-700">{equipment.label}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateProgram}
                disabled={createProgramMutation.isPending || !newProgram.name}
                className="flex-1"
              >
                Create Program
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
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