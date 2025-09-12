import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave, useOfflineStatus } from "@/hooks/use-auto-save";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProgramGenerationLoading from "@/components/program-generation-loading";
import { 
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Wifi,
  WifiOff
} from "lucide-react";
import { programGenerationSchema, type ProgramGenerationData } from "@shared/schema";
import styles from "./program-generation.module.css";

const equipmentOptions = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "barbell", label: "Barbell" },
  { id: "bench", label: "Bench" },
  { id: "pullup_bar", label: "Pull-up Bar" },
  { id: "cables", label: "Cable Machine" },
  { id: "machines", label: "Weight Machines" },
  { id: "resistance_bands", label: "Resistance Bands" },
  { id: "bodyweight", label: "Bodyweight" },
];

export default function ProgramGeneration() {
  const [, setLocation] = useLocation();
  const [showOptionalInfo, setShowOptionalInfo] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const { toast } = useToast();
  const isOffline = useOfflineStatus();

  const form = useForm<ProgramGenerationData>({
    resolver: zodResolver(programGenerationSchema),
    defaultValues: {
      goals: "",
      experience: "",
      availableDays: undefined, // Remove default 3 days
      equipment: [],
      isConfirmation: false,
    },
  });

  // Auto-save functionality
  const { saveData, restoreData, clearSavedData, hasSavedData } = useAutoSave({
    key: 'program-generation-form',
    data: form.watch(),
    enabled: true,
    interval: 5000, // Save every 5 seconds
    onSave: () => {
      // Optional: Show subtle feedback that data was saved
    },
    onRestore: (savedData) => {
      // Restore form data
      Object.keys(savedData).forEach(key => {
        form.setValue(key as keyof ProgramGenerationData, savedData[key]);
      });
    }
  });

  // Check for saved data on mount
  useEffect(() => {
    if (hasSavedData()) {
      setShowRestoreDialog(true);
    }
  }, [hasSavedData]);

  const generateProgramMutation = useMutation({
    mutationFn: async (data: ProgramGenerationData) => {
      const response = await apiRequest("POST", "/api/programs/generate", data);
      return response.json();
    },
    onSuccess: (generatedProgram) => {
      // Clear auto-saved data on successful submission
      clearSavedData();
      // Navigate to confirmation page with generated program data
      setLocation(`/programs/confirm?data=${encodeURIComponent(JSON.stringify(generatedProgram))}`);
    },
    onError: (error) => {
      console.error("Program generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate program. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProgramGenerationData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    generateProgramMutation.mutate(data);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Button clicked!");
    console.log("Current form values:", form.getValues());
    console.log("Form errors:", form.formState.errors);
    
    // Trigger form validation and submission
    form.handleSubmit(onSubmit)();
  };

  // Show loading screen when generating
  if (generateProgramMutation.isPending) {
    return <ProgramGenerationLoading />;
  }

  // Handle restore dialog actions
  const handleRestoreData = () => {
    restoreData();
    setShowRestoreDialog(false);
    toast({
      title: "Data Restored",
      description: "Your previous progress has been restored.",
    });
  };

  const handleDiscardData = () => {
    clearSavedData();
    setShowRestoreDialog(false);
  };

  return (
    <>
      {/* Restore Dialog */}
      {showRestoreDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <Card style={{ maxWidth: '28rem', width: '100%' }}>
            <CardHeader>
              <CardTitle>Restore Previous Progress?</CardTitle>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                We found some unsaved progress from your last session. Would you like to restore it?
              </p>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={handleDiscardData}>
                  Start Fresh
                </Button>
                <Button onClick={handleRestoreData}>
                  Restore Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Status Indicator */}
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'var(--warning)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 100,
          fontSize: '0.875rem'
        }}>
          <WifiOff style={{ width: '1rem', height: '1rem' }} />
          Offline - Changes saved locally
        </div>
      )}

      <div className={`${styles.container} page`} style={{ paddingBottom: isInputFocused ? '6rem' : '2rem' }}>
        <div className={styles.header}>
          <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/programs")}
          className={styles.backButton}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Back to Programs
          </Button>
        </div>

        <Card className={styles.mainCard}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <Sparkles className={styles.titleIcon} />
            Generate Custom Program
          </CardTitle>
          <p className={styles.cardDescription}>
            Describe your fitness goals and we'll create a personalized program that understands what you really need to achieve them. You'll be able to review and tweak the program before finalizing it.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            {/* Primary Goals Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                What are your fitness goals?
                <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Describe what you want to achieve... For example: 'I want to build defined shoulders and improve my upper body strength' or 'I want to lose weight and build lean muscle'"
                rows={4}
                onFocus={() => setIsInputFocused(true)}
                {...form.register("goals", {
                  onBlur: () => setIsInputFocused(false)
                })}
              />
              <div className={styles.helpText}>
                <Info style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                Be specific about your goals. We'll analyze what exercises and approach will best achieve what you want.
              </div>
              {form.formState.errors.goals && (
                <div className={styles.errorMessage}>
                  {form.formState.errors.goals.message}
                </div>
              )}
            </div>

            {/* Optional Info Section */}
            <div className={styles.optionalSection}>
              <button
                type="button"
                className={styles.optionalToggle}
                onClick={() => setShowOptionalInfo(!showOptionalInfo)}
              >
                <span className={styles.optionalTitle}>
                  Optional Info
                  {showOptionalInfo ? (
                    <ChevronUp style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
                  ) : (
                    <ChevronDown style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
                  )}
                </span>
              </button>
              <p className={styles.optionalSubtitle}>
                Any extra information helps generate the best possible program for your needs
              </p>

              {showOptionalInfo && (
                <div className={styles.optionalContent}>
                  {/* Experience Level */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Experience Level</label>
                    <select 
                      className={styles.select}
                      onFocus={() => setIsInputFocused(true)}
                      {...form.register("experience", {
                        onBlur: () => setIsInputFocused(false)
                      })}
                    >
                      <option value="">Select your experience (optional)</option>
                      <option value="beginner">Beginner (0-6 months)</option>
                      <option value="intermediate">Intermediate (6 months - 2 years)</option>
                      <option value="advanced">Advanced (2+ years)</option>
                    </select>
                  </div>

                  {/* Days per week */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Days per week</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      placeholder="Let AI decide"
                      className={styles.input}
                      onFocus={() => setIsInputFocused(true)}
                      {...form.register("availableDays", { 
                        setValueAs: (value) => value === '' ? undefined : Number(value),
                        onBlur: () => setIsInputFocused(false)
                      })}
                    />
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
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className={styles.buttonGroup}>
              <Button
                type="button"
                onClick={handleButtonClick}
                disabled={generateProgramMutation.isPending}
                size="lg"
                variant="primary"
                className={styles.generateButton}
              >
                {generateProgramMutation.isPending ? (
                  <>
                    <Sparkles className={styles.loadingIcon} />
                    Creating your personalized program...
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Generate My Program
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
      
      {/* Hide bottom navigation when input is focused */}
      {isInputFocused && (
        <style>{`
          nav[class*="navigation"] { display: none !important; }
        `}</style>
      )}
    </>
  );
}