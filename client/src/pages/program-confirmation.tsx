import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Sparkles,
  ArrowLeft,
  Edit3,
  Check,
  Calendar,
  Clock,
  Target,
  Dumbbell
} from "lucide-react";
import { programConfirmationSchema, type ProgramConfirmationData } from "@shared/schema";
import styles from "./program-confirmation.module.css";

export default function ProgramConfirmation() {
  const [, setLocation] = useLocation();
  const [programData, setProgramData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProgramConfirmationData>({
    resolver: zodResolver(programConfirmationSchema),
    defaultValues: {
      program: null,
      feedback: "",
    },
  });

  // Extract program data from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        setProgramData(parsed);
        form.setValue('program', parsed);
      } catch (error) {
        console.error('Failed to parse program data:', error);
        setLocation('/programs/generate');
      }
    } else {
      setLocation('/programs/generate');
    }
  }, []);

  const modifyProgramMutation = useMutation({
    mutationFn: async (data: { feedback: string; program: any }) => {
      const response = await apiRequest("POST", "/api/programs/modify", data);
      return response.json();
    },
    onSuccess: (modifiedProgram) => {
      setProgramData(modifiedProgram);
      form.setValue('program', modifiedProgram);
      form.setValue('feedback', '');
      setIsEditing(false);
      toast({
        title: "Program Updated",
        description: "Your program has been modified based on your feedback.",
      });
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

  const confirmProgramMutation = useMutation({
    mutationFn: async (program: any) => {
      const response = await apiRequest("POST", "/api/programs/confirm", { program });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({
        title: "Program Created!",
        description: "Your personalized workout program is ready to use.",
      });
      setLocation('/programs');
    },
    onError: (error) => {
      console.error("Program confirmation error:", error);
      toast({
        title: "Creation Failed",
        description: "Unable to create program. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleModifyProgram = () => {
    const feedback = form.getValues('feedback');
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please describe what changes you'd like to make.",
        variant: "destructive",
      });
      return;
    }
    
    modifyProgramMutation.mutate({
      feedback,
      program: programData
    });
  };

  const handleConfirmProgram = () => {
    confirmProgramMutation.mutate(programData);
  };

  if (!programData) {
    return (
      <div className={styles.loading}>
        <Sparkles className={styles.loadingIcon} />
        <p>Loading your program...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} page`}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/programs/generate")}
          className={styles.backButton}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Back to Generator
        </Button>
      </div>

      <div className={styles.content}>
        {/* Program Overview */}
        <Card className={styles.overviewCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Sparkles className={styles.titleIcon} />
              {programData.name}
            </CardTitle>
            <p className={styles.cardDescription}>
              {programData.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className={styles.programMeta}>
              {programData.durationWeeks && (
                <Badge variant="outline" className={styles.metaBadge}>
                  <Calendar style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {programData.durationWeeks} weeks
                </Badge>
              )}
              {programData.difficulty && (
                <Badge variant="outline" className={styles.metaBadge}>
                  <Target style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {programData.difficulty}
                </Badge>
              )}
              {programData.schedule?.days?.length && (
                <Badge variant="outline" className={styles.metaBadge}>
                  <Dumbbell style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                  {programData.schedule.days.length} days/week
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Schedule */}
        <Card className={styles.scheduleCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.scheduleGrid}>
              {programData.schedule?.days?.map((day: any, index: number) => (
                <div key={index} className={styles.dayCard}>
                  <div className={styles.dayHeader}>
                    <h4 className={styles.dayName}>Day {day.dayNumber}</h4>
                    <h5 className={styles.dayType}>{day.name}</h5>
                  </div>
                  <div className={styles.exercisesList}>
                    {day.exercises?.map((exercise: any, exerciseIndex: number) => (
                      <div key={exerciseIndex} className={styles.exerciseItem}>
                        <div className={styles.exerciseName}>{exercise.name}</div>
                        <div className={styles.exerciseDetails}>
                          {exercise.sets && exercise.reps && (
                            <span className={styles.exerciseSpec}>
                              {exercise.sets} × {exercise.reps}
                            </span>
                          )}
                          {exercise.restTime && (
                            <span className={styles.restTime}>
                              <Clock style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                              {exercise.restTime}s rest
                            </span>
                          )}
                        </div>
                        {exercise.notes && (
                          <div className={styles.exerciseNotes}>{exercise.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className={styles.feedbackCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <Edit3 className={styles.titleIcon} />
              Want to make changes?
            </CardTitle>
            <p className={styles.cardDescription}>
              Describe any modifications you'd like to make to your program
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleModifyProgram)} className={styles.feedbackForm}>
              <textarea
                className={styles.feedbackTextarea}
                placeholder="For example: 'Add more shoulder exercises' or 'Make it less intense' or 'Focus more on chest development'"
                rows={4}
                {...form.register("feedback")}
                disabled={modifyProgramMutation.isPending}
              />
              
              <div className={styles.buttonGroup}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={modifyProgramMutation.isPending || !form.watch('feedback')?.trim()}
                  className={styles.modifyButton}
                >
                  {modifyProgramMutation.isPending ? (
                    <>
                      <Sparkles className={styles.loadingIcon} />
                      Modifying...
                    </>
                  ) : (
                    <>
                      <Edit3 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      Modify Program
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={confirmProgramMutation.isPending}
                  onClick={handleConfirmProgram}
                  className={styles.confirmButton}
                >
                  {confirmProgramMutation.isPending ? (
                    <>
                      <Sparkles className={styles.loadingIcon} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      Confirm & Create Program
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}