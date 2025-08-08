import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Sparkles,
  ArrowLeft,
  Info
} from "lucide-react";
import type { Program } from "@shared/schema";
import styles from "./program-generation.module.css";

export default function ProgramModify() {
  const [, setLocation] = useLocation();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { toast } = useToast();

  // Get program ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('id');

  const { data: program, isLoading } = useQuery<Program>({
    queryKey: ["/api/programs", programId],
    queryFn: () => fetch(`/api/programs/${programId}`).then(res => res.json()),
    enabled: !!programId
  });

  const form = useForm({
    defaultValues: {
      feedback: "",
    },
  });

  const modifyProgramMutation = useMutation({
    mutationFn: async (data: { feedback: string }) => {
      const response = await apiRequest("POST", "/api/programs/modify", {
        program,
        feedback: data.feedback
      });
      return response.json();
    },
    onSuccess: (modifiedProgram) => {
      toast({
        title: "Program Modified",
        description: "Your program has been updated based on your feedback.",
      });
      
      // Navigate back to programs page
      setLocation("/programs");
      
      // Invalidate program queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
    },
    onError: (error) => {
      console.error("Program modification error:", error);
      toast({
        title: "Modification Failed",
        description: "Unable to modify program. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: { feedback: string }) => {
    console.log("Modifying program with feedback:", data.feedback);
    modifyProgramMutation.mutate(data);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Modify button clicked!");
    
    // Trigger form validation and submission
    form.handleSubmit(handleSubmit)();
  };

  if (isLoading || !program) {
    return (
      <div className={`${styles.container} page`}>
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
          <CardContent>
            <p>Loading program...</p>
          </CardContent>
        </Card>
      </div>
    );
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
              Modify Program: {program.name}
            </CardTitle>
            <p className={styles.cardDescription}>
              Tell us what you'd like to change about your current program. Our AI will intelligently modify it while maintaining balance and effectiveness.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  What would you like to change?
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe the changes you want... For example: 'Add more shoulder exercises', 'Make workouts shorter', 'Focus more on legs', 'Reduce intensity', etc."
                  rows={4}
                  onFocus={() => setIsInputFocused(true)}
                  {...form.register("feedback", {
                    required: "Please describe what you'd like to change",
                    onBlur: () => setIsInputFocused(false)
                  })}
                />
                <div className={styles.helpText}>
                  <Info style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
                  Be specific about your needs. Our AI will analyze your request and make intelligent modifications to your program.
                </div>
                {form.formState.errors.feedback && (
                  <div className={styles.errorMessage}>
                    {form.formState.errors.feedback.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className={styles.buttonGroup}>
                <Button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={modifyProgramMutation.isPending}
                  size="lg"
                  variant="primary"
                  className={styles.generateButton}
                >
                  {modifyProgramMutation.isPending ? (
                    <>
                      <Sparkles className={styles.loadingIcon} />
                      Modifying your program...
                    </>
                  ) : (
                    <>
                      <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      Modify Program
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