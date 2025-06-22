import { Dumbbell, Target, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/Button";

export default function Landing() {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pocket Coach
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your intelligent fitness companion that transforms workout tracking into personalized coaching
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="w-full"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Analysis</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized insights and recommendations based on your workout patterns and goals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mr-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Goal Tracking</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Set meaningful fitness goals and track your progress with detailed analytics
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mr-3">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Progress Visualization</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Watch your strength and fitness improve with intuitive charts and muscle group heatmaps
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Ready to transform your fitness journey?</p>
        </div>
      </div>
    </div>
  );
}