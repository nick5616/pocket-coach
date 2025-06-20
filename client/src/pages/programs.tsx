import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  Play, 
  Settings, 
  Plus,
  Sparkles,
  Clock,
  Dumbbell,
  Users,
  Star,
  ChevronRight,
  Target
} from "lucide-react";
import type { Program, Goal } from "@shared/schema";

const programGenerationSchema = z.object({
  experience: z.string().min(1, "Experience level is required"),
  availableDays: z.number().min(1).max(7),
  equipment: z.array(z.string()).min(1, "Select at least one equipment type"),
});

export default function Programs() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const { toast } = useToast();
  
  const userId = 1; // Mock user ID

  const form = useForm({
    resolver: zodResolver(programGenerationSchema),
    defaultValues: {
      experience: "",
      availableDays: 3,
      equipment: [],
    },
  });

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs", { userId }],
    queryFn: () => fetch(`/api/programs?userId=${userId}`).then(res => res.json()),
  });

  const { data: activeProgram } = useQuery<Program | null>({
    queryKey: ["/api/programs/active", { userId }],
    queryFn: () => fetch(`/api/programs/active?userId=${userId}`).then(res => res.json()),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals", { userId }],
    queryFn: () => fetch(`/api/goals?userId=${userId}`).then(res => res.json()),
  });

  const generateProgramMutation = useMutation({
    mutationFn: async (data: z.infer<typeof programGenerationSchema>) => {
      const response = await apiRequest("POST", "/api/programs/generate", {
        userId,
        ...data,
      });
      return response.json();
    },
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      setShowGenerateDialog(false);
      setSelectedProgram(program);
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

  const activateProgramMutation = useMutation({
    mutationFn: async (programId: number) => {
      const response = await apiRequest("PATCH", `/api/programs/${programId}`, {
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs/active"] });
      toast({
        title: "Program Activated",
        description: "This program is now your active workout plan.",
      });
    },
  });

  const onGenerateProgram = (data: z.infer<typeof programGenerationSchema>) => {
    generateProgramMutation.mutate(data);
  };

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

  const predefinedPrograms = [
    {
      id: "push_pull_legs",
      name: "Push/Pull/Legs",
      description: "Classic 3-day split focusing on movement patterns",
      duration: "6-8 weeks",
      difficulty: "Intermediate",
      daysPerWeek: 3,
      popular: true,
    },
    {
      id: "upper_lower",
      name: "Upper/Lower Split",
      description: "4-day program alternating upper and lower body",
      duration: "8-10 weeks",
      difficulty: "Beginner",
      daysPerWeek: 4,
      popular: true,
    },
    {
      id: "full_body",
      name: "Full Body",
      description: "3-day full body routine for maximum efficiency",
      duration: "4-6 weeks",
      difficulty: "Beginner",
      daysPerWeek: 3,
      popular: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="pb-20">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
          <h1 className="text-lg font-bold text-gray-900">Programs</h1>
        </header>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 loading-shimmer"></div>
          ))}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-8 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Programs</h1>
          <Button
            onClick={() => setShowGenerateDialog(true)}
            size="sm"
            className="bg-duolingo-green hover:bg-duolingo-green/90"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
          </Button>
        </div>
      </header>

      <main className="pb-20">
        {/* Active Program */}
        {activeProgram && (
          <section className="bg-gradient-to-r from-duolingo-green to-green-600 text-white px-4 py-6">
            <h2 className="text-xl font-bold mb-2">Active Program</h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{activeProgram.name}</h3>
                {activeProgram.aiGenerated && (
                  <Badge className="bg-white/20 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              <p className="text-green-100 text-sm mb-3">{activeProgram.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-100">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Week 2 of 8</span>
                </div>
                <Link href="/workout-journal">
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Today
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <Tabs defaultValue="browse" className="px-4 py-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="my-programs">My Programs ({programs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6 mt-6">
            {/* AI Generate Section */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Program Generator</h3>
                    <p className="text-purple-100 text-sm">Personalized for your goals</p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm mb-4">
                  Get a custom workout program tailored to your experience, goals, and available equipment.
                </p>
                <Button
                  onClick={() => setShowGenerateDialog(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  Generate My Program
                </Button>
              </CardContent>
            </Card>

            {/* Popular Programs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Programs</h3>
              <div className="space-y-3">
                {predefinedPrograms.map((program) => (
                  <Card key={program.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-semibold text-gray-900 mr-2">{program.name}</h4>
                            {program.popular && (
                              <Badge className="bg-energetic-orange/10 text-energetic-orange">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {program.duration}
                            </div>
                            <div className="flex items-center">
                              <Dumbbell className="h-3 w-3 mr-1" />
                              {program.difficulty}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {program.daysPerWeek} days/week
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 ml-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Program Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Goal</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-duolingo-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-duolingo-green" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Strength</h4>
                    <p className="text-xs text-gray-500">Build maximum strength</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-duolingo-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Dumbbell className="h-6 w-6 text-duolingo-blue" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Muscle</h4>
                    <p className="text-xs text-gray-500">Hypertrophy focused</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-energetic-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-energetic-orange" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Endurance</h4>
                    <p className="text-xs text-gray-500">Improve conditioning</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Beginner</h4>
                    <p className="text-xs text-gray-500">Getting started</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-programs" className="space-y-4 mt-6">
            {programs.length > 0 ? (
              programs.map((program) => (
                <Card key={program.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center mb-1">
                          <h4 className="font-semibold text-gray-900 mr-2">{program.name}</h4>
                          {program.aiGenerated && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {program.isActive && (
                            <Badge className="bg-success-green text-white ml-2">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{program.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created {new Date(program.createdAt!).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {!program.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateProgramMutation.mutate(program.id)}
                            disabled={activateProgramMutation.isPending}
                          >
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs yet</h3>
                  <p className="text-gray-500 mb-4">
                    Generate your first AI-powered workout program or choose from our templates.
                  </p>
                  <Button 
                    onClick={() => setShowGenerateDialog(true)}
                    className="bg-duolingo-green hover:bg-duolingo-green/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Program
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Generate Program Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-duolingo-green" />
              Generate AI Program
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerateProgram)} className="space-y-4">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days per week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        placeholder="3"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipment"
                render={() => (
                  <FormItem>
                    <FormLabel>Available Equipment</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {equipmentOptions.map((equipment) => (
                        <FormField
                          key={equipment.id}
                          control={form.control}
                          name="equipment"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(equipment.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), equipment.id])
                                      : field.onChange(
                                          field.value?.filter((value: string) => value !== equipment.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {equipment.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generateProgramMutation.isPending}
                  className="flex-1 bg-duolingo-green hover:bg-duolingo-green/90"
                >
                  {generateProgramMutation.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Program"
                  )}
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
