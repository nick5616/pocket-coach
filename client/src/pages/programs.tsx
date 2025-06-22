import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Dialog } from "@/components/Dialog";
import BottomNavigation from "@/components/bottom-navigation";
import LoadingScreen from "@/components/loading-screen";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Sparkles,
  Play,
  Star,
  Clock,
  Target
} from "lucide-react";
import type { Program } from "@shared/schema";
import styles from "./programs.module.css";

const programGenerationSchema = z.object({
  experience: z.string().min(1, "Experience level is required"),
  availableDays: z.number().min(1).max(7),
  equipment: z.array(z.string()).min(1, "Select at least one equipment type"),
});

type ProgramFormData = z.infer<typeof programGenerationSchema>;

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
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  if (!user) {
    return <div className={styles.container}>Loading...</div>;
  }

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programGenerationSchema),
    defaultValues: {
      experience: "",
      availableDays: 3,
      equipment: [],
    },
  });

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    queryFn: () => fetch(`/api/programs`).then(res => res.json()),
  });

  const { data: activeProgram } = useQuery<Program | null>({
    queryKey: ["/api/programs/active"],
    queryFn: () => fetch(`/api/programs/active`).then(res => res.json()),
  });

  const generateProgramMutation = useMutation({
    mutationFn: async (data: ProgramFormData) => {
      const response = await apiRequest("POST", "/api/programs/generate", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setShowGenerateDialog(false);
      form.reset();
      toast({
        title: "Program Generated!",
        description: "Your personalized workout program is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate program. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onGenerateProgram = (data: ProgramFormData) => {
    generateProgramMutation.mutate(data);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your workout programs..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Programs</h1>
        <Button
          onClick={() => setShowGenerateDialog(true)}
          size="sm"
          variant="primary"
        >
          <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
          Generate
        </Button>
      </div>

      <div className={styles.main}>
        {/* Active Program */}
        {activeProgram && (
          <Card style={{ marginBottom: '1.5rem', backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1e40af', display: 'flex', alignItems: 'center' }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                Active Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {activeProgram.name}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {activeProgram.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Badge variant="outline">
                  <Clock style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {activeProgram.duration}
                </Badge>
                <Badge variant="outline">
                  <Target style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {activeProgram.difficulty}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Programs List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {programs.length === 0 ? (
            <Card>
              <CardContent style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Sparkles style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#9ca3af' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  No Programs Yet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Generate your first AI-powered workout program
                </p>
                <Button
                  onClick={() => setShowGenerateDialog(true)}
                  variant="primary"
                >
                  <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Generate Program
                </Button>
              </CardContent>
            </Card>
          ) : (
            programs.map((program) => (
              <Card key={program.id}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{program.name}</span>
                    {program.isActive && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    {program.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <Badge variant="outline">{program.duration}</Badge>
                    <Badge variant="outline">{program.difficulty}</Badge>
                    <Badge variant="outline">{program.daysPerWeek} days/week</Badge>
                  </div>
                  {!program.isActive && (
                    <Button size="sm" variant="outline">
                      <Play style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.5rem' }} />
                      Activate
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Generate Program Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <h2 className={styles.dialogTitle}>
              <Sparkles className={styles.dialogIcon} />
              Generate AI Program
            </h2>
          </div>
          
          <form onSubmit={form.handleSubmit(onGenerateProgram)} className={styles.form}>
            {/* Experience Level */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Experience Level</label>
              <select 
                className={styles.select}
                {...form.register("experience")}
              >
                <option value="">Select your experience</option>
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
              {form.formState.errors.experience && (
                <div className={styles.errorMessage}>
                  {form.formState.errors.experience.message}
                </div>
              )}
            </div>

            {/* Days per week */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Days per week</label>
              <input
                type="number"
                min="1"
                max="7"
                placeholder="3"
                className={styles.input}
                {...form.register("availableDays", { 
                  valueAsNumber: true,
                  min: 1,
                  max: 7
                })}
              />
              {form.formState.errors.availableDays && (
                <div className={styles.errorMessage}>
                  {form.formState.errors.availableDays.message}
                </div>
              )}
            </div>

            {/* Equipment Selection */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Available Equipment</label>
              <div className={styles.equipmentGrid}>
                {equipmentOptions.map((equipment) => {
                  const isSelected = form.watch("equipment")?.includes(equipment.id);
                  return (
                    <div
                      key={equipment.id}
                      className={`${styles.equipmentItem} ${
                        isSelected ? styles.equipmentItemSelected : ""
                      }`}
                      onClick={() => {
                        const currentEquipment = form.getValues("equipment") || [];
                        const newEquipment = isSelected
                          ? currentEquipment.filter((id: string) => id !== equipment.id)
                          : [...currentEquipment, equipment.id];
                        form.setValue("equipment", newEquipment);
                      }}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div onClick
                      />
                      <label className={styles.equipmentLabel}>
                        {equipment.label}
                      </label>
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.equipment && (
                <div className={styles.errorMessage}>
                  {form.formState.errors.equipment.message}
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => setShowGenerateDialog(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generateProgramMutation.isPending}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                {generateProgramMutation.isPending ? (
                  <>
                    <Sparkles className={styles.loadingIcon} />
                    Generating...
                  </>
                ) : (
                  "Generate Program"
                )}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}