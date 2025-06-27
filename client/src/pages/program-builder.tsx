import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import BottomNavigation from "../components/bottom-navigation";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { 
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Dumbbell,
  Sparkles,
  Info,
  Moon,
  Sun
} from "lucide-react";
import { useLocation } from "wouter";
import styles from "./program-builder.module.css";

interface SplitOption {
  id: string;
  name: string;
  simpleDescription: string;
  detailedDescription: string;
  daysPerWeek: number;
  bestFor: string[];
  example: string;
}

const splitOptions: SplitOption[] = [
  {
    id: "ai_optimal",
    name: "AI Optimal (Recommended)",
    simpleDescription: "Let Pocket Coach design the perfect split based on your goals and experience",
    detailedDescription: "The AI analyzes your goals, experience level, and available time to create the most effective training split for you. This adapts over time and considers exercise science principles for optimal results.",
    daysPerWeek: 0, // Will be determined by AI
    bestFor: ["Best results", "Science-based", "Adaptive programming"],
    example: "Customized based on your specific goals and constraints"
  },
  {
    id: "ppl",
    name: "Push Pull Legs",
    simpleDescription: "Push muscles one day, pull muscles another, legs on the third",
    detailedDescription: "Day 1: Chest, shoulders, triceps (pushing movements). Day 2: Back, biceps (pulling movements). Day 3: Legs and glutes. Repeat the cycle.",
    daysPerWeek: 6,
    bestFor: ["Building muscle", "Getting stronger", "Balanced development"],
    example: "Monday: Push | Tuesday: Pull | Wednesday: Legs | Thursday: Push | Friday: Pull | Saturday: Legs"
  },
  {
    id: "upper_lower",
    name: "Upper Lower Split",
    simpleDescription: "Upper body one day, lower body the next",
    detailedDescription: "Alternate between upper body workouts (arms, chest, back, shoulders) and lower body workouts (legs, glutes). Simple and effective.",
    daysPerWeek: 4,
    bestFor: ["Beginners", "Busy schedules", "Recovery focus"],
    example: "Monday: Upper | Tuesday: Lower | Thursday: Upper | Friday: Lower"
  },
  {
    id: "full_body",
    name: "Full Body",
    simpleDescription: "Work your entire body in each workout session",
    detailedDescription: "Every workout includes exercises for all major muscle groups. Great for beginners or people with limited time.",
    daysPerWeek: 3,
    bestFor: ["Beginners", "Fat loss", "Limited time"],
    example: "Monday: Full Body | Wednesday: Full Body | Friday: Full Body"
  },
  {
    id: "bro_split",
    name: "Body Part Split",
    simpleDescription: "Focus on one muscle group per day (like chest day, back day)",
    detailedDescription: "Each workout targets one specific muscle group intensely. Popular with experienced lifters who want to really focus on individual muscles.",
    daysPerWeek: 5,
    bestFor: ["Advanced lifters", "Muscle specialization", "High volume"],
    example: "Monday: Chest | Tuesday: Back | Wednesday: Shoulders | Thursday: Arms | Friday: Legs"
  }
];

export default function ProgramBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );
  const [hoveredSplit, setHoveredSplit] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    split: '',
    experience: '',
    goals: [] as string[],
    daysPerWeek: 3,
    equipment: [] as string[]
  });

  // Check if user is authenticated
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please log in to create workout programs.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [user, userLoading, setLocation, toast]);

  const generateProgramMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/programs/generate-simple", data);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to create programs");
        }
        throw new Error("Failed to generate program");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({
        title: "Program Created!",
        description: "Your personalized workout program is ready.",
      });
      setLocation("/programs");
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Unable to create program. Please try again.",
        variant: "destructive",
      });
      
      // If unauthorized, redirect to login
      if (error.message?.includes("log in")) {
        setLocation("/auth");
      }
    },
  });

  const goalOptions = [
    {
      value: "Build muscle",
      title: "Build Muscle",
      description: "Higher volume training (3-4 sets, 8-12 reps) with progressive overload. Focus on compound movements and adequate rest between sets for muscle growth."
    },
    {
      value: "Lose weight",
      title: "Lose Weight", 
      description: "Circuit-style training with shorter rest periods. Mix of resistance and cardio exercises to maximize calorie burn while preserving muscle mass."
    },
    {
      value: "Get stronger",
      title: "Get Stronger",
      description: "Lower rep ranges (3-6 reps) with heavier weights. Emphasis on compound movements like squats, deadlifts, and bench press with longer rest periods."
    },
    {
      value: "Improve fitness",
      title: "Improve Fitness",
      description: "Balanced approach combining strength, endurance, and mobility. Moderate intensity with functional movements and varied training styles."
    },
    {
      value: "Tone up",
      title: "Tone Up",
      description: "Moderate weight with higher reps (12-15) focusing on muscle endurance. Targets muscle definition while burning calories effectively."
    },
    {
      value: "Train for sport",
      title: "Train for Sport",
      description: "Sport-specific movements and explosive power training. Includes plyometrics, agility work, and functional patterns relevant to athletic performance."
    }
  ];

  const equipmentOptions = [
    "Full gym access",
    "Home with dumbbells",
    "Bodyweight only",
    "Resistance bands",
    "Basic home gym"
  ];

  const handleSplitSelect = (split: SplitOption) => {
    if (split.id === "ai_optimal") {
      // For AI optimal, don't set daysPerWeek - let AI decide
      setFormData({ ...formData, split: split.id, daysPerWeek: 0 });
    } else {
      setFormData({ ...formData, split: split.id, daysPerWeek: split.daysPerWeek });
    }
    setStep(2);
  };

  const handleGoalToggle = (goalValue: string) => {
    const newGoals = formData.goals.includes(goalValue)
      ? formData.goals.filter(g => g !== goalValue)
      : [...formData.goals, goalValue];
    setFormData({ ...formData, goals: newGoals });
  };

  const handleSubmit = () => {
    const selectedSplit = splitOptions.find(s => s.id === formData.split);
    generateProgramMutation.mutate({
      splitType: formData.split,
      splitName: selectedSplit?.name,
      experience: formData.experience,
      goals: formData.goals,
      daysPerWeek: formData.daysPerWeek,
      equipment: formData.equipment
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.split !== '';
      case 2: return formData.experience !== '';
      case 3: return formData.goals.length > 0;
      case 4: return formData.equipment.length > 0;
      default: return false;
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className={styles.container} data-theme={theme}>
        <div className={styles.header}>
          <div></div>
          <h1 className={styles.headerTitle}>Loading...</h1>
          <div></div>
        </div>
        <div className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className={styles.container} data-theme={theme}>
      {/* Backdrop SVGs */}
      <div className={styles.backdrop}>
        <svg className={styles.shape1} viewBox="0 0 120 120">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pb-primary)" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="var(--pb-primary)" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="50" fill="url(#grad1)"/>
          <path d="M30 60 L50 40 L90 80 L70 100 Z" fill="var(--pb-primary)" opacity="0.08"/>
        </svg>
        
        <svg className={styles.shape2} viewBox="0 0 80 80">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pb-primary)" stopOpacity="0.08"/>
              <stop offset="100%" stopColor="var(--pb-primary)" stopOpacity="0.03"/>
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="60" height="60" rx="15" fill="url(#grad2)"/>
          <circle cx="40" cy="40" r="15" fill="var(--pb-primary)" opacity="0.06"/>
        </svg>
        
        <svg className={styles.shape3} viewBox="0 0 60 60">
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pb-primary)" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="var(--pb-primary)" stopOpacity="0.02"/>
            </linearGradient>
          </defs>
          <polygon points="30,5 55,25 45,55 15,55 5,25" fill="url(#grad3)"/>
        </svg>
      </div>

      <div className={styles.header}>
        <Button
          variant="ghost"
          onClick={() => step === 1 ? setLocation("/programs") : setStep(step - 1)}
          className={styles.backButton}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
        </Button>
        <h1 className={styles.headerTitle}>Create Your Program</h1>
        <div className={styles.headerRight}>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={styles.themeToggle}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div className={styles.stepIndicator}>
            {step}/4
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {step === 1 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <Calendar className={styles.stepIcon} />
              <div>
                <h2 className={styles.stepTitle}>Choose Your Workout Split</h2>
                <p className={styles.stepDescription}>
                  How do you want to organize your workouts during the week?
                </p>
              </div>
            </div>

            <div className={styles.splitOptions}>
              {splitOptions.map((split) => (
                <Card 
                  key={split.id} 
                  className={`${styles.splitCard} ${formData.split === split.id ? styles.selected : ''} ${split.id === 'ai_optimal' ? styles.recommended : ''}`}
                  onClick={() => handleSplitSelect(split)}
                  onMouseEnter={() => setHoveredSplit(split.id)}
                  onMouseLeave={() => setHoveredSplit(null)}
                >
                  <CardHeader>
                    <CardTitle className={styles.splitName}>{split.name}</CardTitle>
                    <div className={styles.splitMeta}>
                      <span className={styles.daysPerWeek}>
                        {split.id === 'ai_optimal' ? 'AI decides' : `${split.daysPerWeek} days/week`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={styles.splitDescription}>{split.simpleDescription}</p>
                    <div className={styles.bestFor}>
                      <strong>Best for:</strong> {split.bestFor.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className={styles.splitDescriptionArea}>
              {hoveredSplit && (() => {
                const split = splitOptions.find(s => s.id === hoveredSplit);
                return split ? (
                  <div className={styles.splitDetailedDescription}>
                    <h3 className={styles.splitDetailTitle}>About {split.name}</h3>
                    <p className={styles.splitDetailText}>{split.detailedDescription}</p>
                    <div className={styles.splitExample}>
                      <Info style={{ width: '1rem', height: '1rem' }} />
                      <span>{split.example}</span>
                    </div>
                  </div>
                ) : null;
              })()}
              {!hoveredSplit && (
                <div className={styles.splitPlaceholder}>
                  <p>Hover over a split option to see detailed information</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <Users className={styles.stepIcon} />
              <div>
                <h2 className={styles.stepTitle}>Your Experience Level</h2>
                <p className={styles.stepDescription}>
                  This helps us create the right intensity for you
                </p>
              </div>
            </div>

            <div className={styles.optionGrid}>
              {[
                { value: "beginner", label: "Beginner", desc: "New to working out or getting back into it" },
                { value: "intermediate", label: "Intermediate", desc: "Been working out consistently for 6+ months" },
                { value: "advanced", label: "Advanced", desc: "2+ years of consistent training experience" }
              ].map((option) => (
                <Card 
                  key={option.value}
                  className={`${styles.optionCard} ${formData.experience === option.value ? styles.selected : ''}`}
                  onClick={() => setFormData({ ...formData, experience: option.value })}
                >
                  <CardContent>
                    <h3 className={styles.optionTitle}>{option.label}</h3>
                    <p className={styles.optionDescription}>{option.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <Target className={styles.stepIcon} />
              <div>
                <h2 className={styles.stepTitle}>What's Your Goal?</h2>
                <p className={styles.stepDescription}>
                  Select all that apply - we'll balance your program accordingly
                </p>
              </div>
            </div>

            <div className={styles.goalGrid}>
              {goalOptions.map((goal) => (
                <Card 
                  key={goal.value}
                  className={`${styles.goalCard} ${formData.goals.includes(goal.value) ? styles.selected : ''}`}
                  onClick={() => handleGoalToggle(goal.value)}
                >
                  <CardContent>
                    <div className={styles.goalHeader}>
                      <span className={styles.goalText}>{goal.title}</span>
                    </div>
                    <p className={styles.goalDescription}>{goal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <Dumbbell className={styles.stepIcon} />
              <div>
                <h2 className={styles.stepTitle}>What Equipment Do You Have?</h2>
                <p className={styles.stepDescription}>
                  We'll create exercises that work with what you've got
                </p>
              </div>
            </div>

            <div className={styles.equipmentGrid}>
              {equipmentOptions.map((equipment) => (
                <Card 
                  key={equipment}
                  className={`${styles.equipmentCard} ${formData.equipment.includes(equipment) ? styles.selected : ''}`}
                  onClick={() => {
                    const newEquipment = formData.equipment.includes(equipment)
                      ? formData.equipment.filter(e => e !== equipment)
                      : [...formData.equipment, equipment];
                    setFormData({ ...formData, equipment: newEquipment });
                  }}
                >
                  <CardContent>
                    <span className={styles.equipmentText}>{equipment}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={styles.nextButton}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || generateProgramMutation.isPending}
            className={styles.createButton}
          >
            {generateProgramMutation.isPending ? (
              <>
                <Sparkles className={styles.loadingIcon} />
                Creating Your Program...
              </>
            ) : (
              <>
                <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                Create My Program
              </>
            )}
          </Button>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}