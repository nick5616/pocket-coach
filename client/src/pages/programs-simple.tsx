import { useState, useEffect } from "react";
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
import styles from "./programs-simple.module.css";

const equipmentOptions = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell" },
  { id: "bench", label: "Bench" },
  { id: "pullup_bar", label: "Pull-up Bar" },
  { id: "cables", label: "Cable Machine" },
  { id: "machines", label: "Weight Machines" },
  { id: "resistance_bands", label: "Resistance Bands" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "bodyweight", label: "Bodyweight Only" }
];

const tabs = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" }
];

export default function Programs() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    difficulty: "beginner",
    durationWeeks: 8,
    focusAreas: [] as string[],
    equipment: [] as string[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => fetch("/api/auth/user").then(res => res.json()),
  });

  const userId = user?.id;

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["/api/programs", { userId }],
    queryFn: () => fetch(`/api/programs?userId=${userId}`).then(res => res.json()),
    enabled: !!userId,
  });

  const { data: activeProgram } = useQuery({
    queryKey: ["/api/programs/active", { userId }],
    queryFn: () => fetch(`/api/programs/active?userId=${userId}`).then(res => res.json()),
    enabled: !!userId,
  });

  const createProgramMutation = useMutation({
    mutationFn: async (programData: typeof newProgram) => {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create program: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Program created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setIsCreateOpen(false);
      setNewProgram({
        name: "",
        description: "",
        difficulty: "beginner",
        durationWeeks: 8,
        focusAreas: [],
        equipment: []
      });
    },
    onError: (error: Error) => {
      console.error("Program creation error:", error);
      toast({ 
        title: "Failed to create program",
        description: error.message 
      });
    },
  });

  const activateProgramMutation = useMutation({
    mutationFn: async (programId: number) => {
      const response = await fetch(`/api/programs/${programId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to activate program: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Program activated successfully" });
      // Invalidate and refetch programs and active program queries
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs/active"] });
    },
    onError: (error: Error) => {
      console.error("Program activation error:", error);
      toast({ 
        title: "Failed to activate program",
        description: error.message 
      });
    },
  });

  const filteredPrograms = programs.filter((program: Program) => {
    if (selectedTab === "active") return program.isActive;
    if (selectedTab === "completed") return program.isCompleted;
    return true;
  });

  const handleCreateProgram = () => {
    if (!newProgram.name.trim()) {
      toast({ title: "Program name is required" });
      return;
    }
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
      <div className={`${styles.container} ${isDark ? styles.dark : ''}`}>
        <div className={styles.emptyState}>
          <div className={`${styles.subtitle} ${isDark ? styles.dark : ''}`}>Loading programs...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className={`${styles.container} ${isDark ? styles.dark : ''}`}>
        {/* Header */}
        <header className={`${styles.header} ${isDark ? styles.dark : ''}`}>
          <div className={styles.headerFlex}>
            <div>
              <h1 className={`${styles.title} ${isDark ? styles.dark : ''}`}>Programs</h1>
              <p className={`${styles.subtitle} ${isDark ? styles.dark : ''}`}>Structured workout plans</p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Program
            </Button>
          </div>
        </header>

        {/* Active Program Banner */}
        {activeProgram && (
          <section className={`${styles.activeBanner} ${isDark ? styles.dark : ''}`}>
            <Card className={styles.activeCard}>
              <CardContent className={styles.activeCardContent}>
                <div className={styles.activeInfo}>
                  <div className={`${styles.activeIcon} ${isDark ? styles.dark : ''}`}>
                    <Play className="w-5 h-5" style={{color: isDark ? '#60a5fa' : '#2563eb'}} />
                  </div>
                  <div>
                    <h3 className={`${styles.activeTitle} ${isDark ? styles.dark : ''}`}>Active Program</h3>
                    <p className={`${styles.activeName} ${isDark ? styles.dark : ''}`}>{activeProgram.name}</p>
                  </div>
                </div>
                <Link href="/workout-journal">
                  <Button size="sm">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Tab Navigation */}
        <section className={`${styles.tabSection} ${isDark ? styles.dark : ''}`}>
          <div className={styles.tabGrid}>
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
              Active ({programs.filter((p: Program) => p.isActive).length})
            </Button>
            <Button 
              variant={selectedTab === "completed" ? "primary" : "outline"}
              onClick={() => setSelectedTab("completed")}
              size="sm"
            >
              Completed ({programs.filter((p: Program) => p.isCompleted).length})
            </Button>
          </div>
        </section>

        {/* Programs List */}
        <section className={styles.section}>
          <div className={styles.programsList}>
            {filteredPrograms.map((program: Program) => (
              <Card key={program.id}>
                <CardContent className={styles.programCard}>
                  <div className={styles.cardContent}>
                    {/* Header with title and status */}
                    <div className={styles.cardHeader}>
                      <div className={styles.headerContent}>
                        <div className={styles.titleRow}>
                          <h3 className={`${styles.programTitle} ${isDark ? styles.dark : ''}`}>{program.name}</h3>
                          {program.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                          {program.aiGenerated && (
                            <Badge variant="outline">AI Generated</Badge>
                          )}
                        </div>
                        
                        {program.description && (
                          <div className={`${styles.description} ${isDark ? styles.dark : ''}`}>
                            <p className={styles.descriptionText}>{program.description}</p>
                            <p className={`${styles.createdDate} ${isDark ? styles.dark : ''}`}>
                              Created {new Date(program.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Focus Areas and Equipment */}
                    {((program.focusAreas && program.focusAreas.length > 0) || (program.equipment && program.equipment.length > 0)) && (
                      <div className={styles.metadataSection}>
                        {program.focusAreas && program.focusAreas.length > 0 && (
                          <div className={`${styles.metadataRow} ${isDark ? styles.dark : ''}`}>
                            <Star className={styles.metadataIcon} style={{color: '#eab308'}} />
                            <div>
                              <span className={styles.metadataLabel}>Focus:</span>
                              <div className={styles.metadataBadges}>
                                {program.focusAreas.map((area, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {program.equipment && program.equipment.length > 0 && (
                          <div className={`${styles.metadataRow} ${isDark ? styles.dark : ''}`}>
                            <Dumbbell className={styles.metadataIcon} style={{color: '#a855f7'}} />
                            <div>
                              <span className={styles.metadataLabel}>Equipment:</span>
                              <div className={styles.metadataBadges}>
                                {program.equipment.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom row with badges and action button */}
                    <div className={`${styles.bottomRow} ${isDark ? styles.dark : ''}`}>
                      <div className={styles.badgeGroup}>
                        <Badge variant="outline" className="text-xs">
                          🕕 {program.durationWeeks || 4} weeks
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          🎯 {program.difficulty || "Beginner"}
                        </Badge>
                        {program.isActive && (
                          <Badge variant="default" className="text-xs">
                            <div className={styles.pulseDot}></div>
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        {!program.isActive && (
                          <Button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              activateProgramMutation.mutate(program.id);
                            }}
                            disabled={activateProgramMutation.isPending}
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {activateProgramMutation.isPending ? "Activating..." : "Activate"}
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
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPrograms.length === 0 && (
              <Card>
                <CardContent className={styles.emptyState}>
                  <BookOpen className={styles.emptyIcon} />
                  <h3 className={`${styles.emptyTitle} ${isDark ? styles.dark : ''}`}>
                    {selectedTab === "all" ? "No programs available" : `No ${selectedTab} programs`}
                  </h3>
                  <p className={`${styles.emptyDescription} ${isDark ? styles.dark : ''}`}>
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
          <div className={styles.dialog}>
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Program Name</label>
              <Input
                placeholder="e.g., 12-Week Strength Builder"
                value={newProgram.name}
                onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Description</label>
              <Input
                placeholder="Brief description of the program"
                value={newProgram.description}
                onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
              />
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Difficulty</label>
                <select 
                  className={`${styles.formSelect} ${isDark ? styles.dark : ''}`}
                  value={newProgram.difficulty}
                  onChange={(e) => setNewProgram({...newProgram, difficulty: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Duration (weeks)</label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={newProgram.durationWeeks}
                  onChange={(e) => setNewProgram({...newProgram, durationWeeks: parseInt(e.target.value) || 4})}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Focus Areas</label>
              <div className={styles.checkboxGrid}>
                {["Strength", "Cardio", "Flexibility", "Muscle Building", "Fat Loss"].map((area) => (
                  <div key={area} className={styles.checkboxRow}>
                    <Checkbox
                      checked={newProgram.focusAreas.includes(area)}
                      onChange={() => toggleFocusArea(area)}
                    />
                    <label className={`${styles.checkboxLabel} ${isDark ? styles.dark : ''}`}>{area}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${isDark ? styles.dark : ''}`}>Available Equipment</label>
              <div className={styles.checkboxGrid}>
                {equipmentOptions.map((equipment) => (
                  <div key={equipment.id} className={styles.checkboxRow}>
                    <Checkbox
                      checked={newProgram.equipment.includes(equipment.id)}
                      onChange={() => toggleEquipment(equipment.id)}
                    />
                    <label className={`${styles.checkboxLabel} ${isDark ? styles.dark : ''}`}>{equipment.label}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.buttonGroup}>
              <Button 
                onClick={handleCreateProgram}
                disabled={createProgramMutation.isPending || !newProgram.name}
                className={styles.buttonFlex}
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