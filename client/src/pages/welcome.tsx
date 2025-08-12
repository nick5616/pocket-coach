import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Dumbbell, Target, TrendingUp, Users } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('pocket_coach_visited');
    if (hasVisited) {
      setIsReturningUser(true);
    }
  }, []);

  const handleGetStarted = () => {
    // Mark user as having visited
    localStorage.setItem('pocket_coach_visited', 'true');
    setLocation('/register');
  };

  const handleSignIn = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Pocket Coach
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your fitness journey with AI-powered workout programs, 
            intelligent tracking, and personalized coaching that adapts to your goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-generated workout programs tailored to your goals, experience level, and available equipment.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-blue-200 dark:border-blue-800">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your workouts, monitor progress, and get insights that help you reach your fitness goals faster.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
              <CardTitle className="text-lg">Personal Coach</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized recommendations and adaptive programs that evolve with your fitness journey.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isReturningUser ? "Welcome Back!" : "Ready to Start?"}
              </CardTitle>
              <CardDescription>
                {isReturningUser 
                  ? "Sign in to continue your fitness journey or create a new account."
                  : "Join thousands of users transforming their fitness with AI-powered coaching."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                {isReturningUser ? "Create Account" : "Get Started Free"}
              </Button>
              
              {isReturningUser && (
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
              )}
              
              {!isReturningUser && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={handleSignIn}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Start your transformation today • No equipment required • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}