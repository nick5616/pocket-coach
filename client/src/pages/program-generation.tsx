import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProgramGenerationLoading from "@/components/program-generation-loading";
import { 
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info
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
  const { toast } = useToast();

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

  const generateProgramMutation = useMutation({
    mutationFn: async (data: ProgramGenerationData) => {
      const response = await apiRequest("POST", "/api/programs/generate", data);
      return response.json();
    },
    onSuccess: (generatedProgram) => {
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

  return (
    <>
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
            Generate AI Program
          </CardTitle>
          <p className={styles.cardDescription}>
            Describe your fitness goals and our AI will create a personalized program that understands what you really need to achieve them. You'll be able to review and tweak the program before finalizing it.
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
                Be specific about your goals. Our AI will analyze what exercises and approach will best achieve what you want.
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