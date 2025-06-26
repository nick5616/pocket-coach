import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import BodyMap from '../components/body-map';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import LoadingScreen from '../components/loading-screen';
import styles from './muscle-targeting.module.css';

export default function MuscleTargeting() {
  const [selectedMode, setSelectedMode] = useState<'preferences' | 'heat_map' | 'program_builder'>('preferences');
  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: muscleMap, isLoading: mapLoading } = useQuery({
    queryKey: ['/api/muscles/detailed-map']
  });

  const { data: userPreferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['/api/muscles/preferences']
  });

  const generateProgramMutation = useMutation({
    mutationFn: (data: { targetMuscles: string[]; programType?: string }) =>
      apiRequest('POST', '/api/programs/generate-targeted', data),
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      alert(`Generated program: ${program.name}. Check your Programs page!`);
    }
  });

  const detectProgramTypeMutation = useMutation({
    mutationFn: (data: { targetMuscles: string[] }) =>
      apiRequest('POST', '/api/programs/detect-optimal-split', data),
    onSuccess: (detection) => {
      console.log('Program type detection:', detection);
    }
  });

  if (mapLoading || prefsLoading) {
    return <LoadingScreen message="Loading muscle targeting system..." />;
  }

  const handleMuscleSelect = (muscleGroup: any) => {
    if (selectedMuscles.includes(muscleGroup.id)) {
      setSelectedMuscles(prev => prev.filter(id => id !== muscleGroup.id));
    } else {
      setSelectedMuscles(prev => [...prev, muscleGroup.id]);
    }
  };

  const handleGenerateProgram = () => {
    if (selectedMuscles.length === 0) {
      alert('Please select at least one muscle to target');
      return;
    }

    const muscleNames = selectedMuscles.map(id => {
      for (const [parentGroup, muscles] of Object.entries(muscleMap || {})) {
        const muscle = (muscles as any[]).find(m => m.id === id);
        if (muscle) return muscle.name;
      }
      return null;
    }).filter(Boolean);

    generateProgramMutation.mutate({ targetMuscles: muscleNames });
  };

  const handleDetectOptimalSplit = () => {
    if (selectedMuscles.length === 0) {
      alert('Please select muscles to analyze optimal split');
      return;
    }

    const muscleNames = selectedMuscles.map(id => {
      for (const [parentGroup, muscles] of Object.entries(muscleMap || {})) {
        const muscle = (muscles as any[]).find(m => m.id === id);
        if (muscle) return muscle.name;
      }
      return null;
    }).filter(Boolean);

    detectProgramTypeMutation.mutate({ targetMuscles: muscleNames });
  };

  const getHighPriorityMuscles = () => {
    if (!userPreferences) return [];
    return userPreferences
      .filter((pref: any) => pref.priority >= 7)
      .sort((a: any, b: any) => b.priority - a.priority);
  };

  const getGrowthTargetMuscles = () => {
    if (!userPreferences) return [];
    return userPreferences.filter((pref: any) => 
      pref.targetGrowth === 'grow' || pref.targetGrowth === 'grow_significantly'
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Granular Muscle Targeting</h1>
        <p>Target specific muscles like rear delt, medial delt, teres minor, and teres major for precise program creation</p>
      </div>

      <div className={styles.modeSelector}>
        <Button
          variant={selectedMode === 'preferences' ? 'primary' : 'ghost'}
          onClick={() => setSelectedMode('preferences')}
        >
          Set Preferences
        </Button>
        <Button
          variant={selectedMode === 'heat_map' ? 'primary' : 'ghost'}
          onClick={() => setSelectedMode('heat_map')}
        >
          Heat Map View
        </Button>
        <Button
          variant={selectedMode === 'program_builder' ? 'primary' : 'ghost'}
          onClick={() => setSelectedMode('program_builder')}
        >
          Program Builder
        </Button>
      </div>

      <div className={styles.content}>
        {selectedMode === 'preferences' && (
          <>
            <Card className={styles.instructionsCard}>
              <CardHeader>
                <CardTitle>Set Your Muscle Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Click on any muscle to set your preferences:</p>
                <ul>
                  <li><strong>Priority (1-10):</strong> How important is building this muscle?</li>
                  <li><strong>Current Satisfaction (1-10):</strong> How happy are you with its current size?</li>
                  <li><strong>Target Growth:</strong> Do you want to grow, maintain, or reduce this muscle?</li>
                  <li><strong>Weekly Volume:</strong> How many sets per week should target this muscle?</li>
                </ul>
              </CardContent>
            </Card>
            <BodyMap mode="preferences" />
          </>
        )}

        {selectedMode === 'heat_map' && (
          <>
            <Card className={styles.summaryCard}>
              <CardHeader>
                <CardTitle>Your Muscle Priority Heat Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.summary}>
                  <div className={styles.summarySection}>
                    <h4>High Priority Muscles:</h4>
                    {getHighPriorityMuscles().length > 0 ? (
                      <ul>
                        {getHighPriorityMuscles().slice(0, 5).map((pref: any) => (
                          <li key={pref.id}>
                            Priority {pref.priority}/10 - {pref.targetGrowth}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No high priority muscles set. Use the preferences tab to set priorities.</p>
                    )}
                  </div>
                  <div className={styles.summarySection}>
                    <h4>Growth Target Muscles:</h4>
                    {getGrowthTargetMuscles().length > 0 ? (
                      <ul>
                        {getGrowthTargetMuscles().slice(0, 5).map((pref: any) => (
                          <li key={pref.id}>
                            {pref.targetGrowth === 'grow_significantly' ? 'Significant Growth' : 'Moderate Growth'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No growth targets set.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <BodyMap mode="heat_map" />
          </>
        )}

        {selectedMode === 'program_builder' && (
          <>
            <Card className={styles.builderCard}>
              <CardHeader>
                <CardTitle>Smart Program Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.builderContent}>
                  <div className={styles.instructions}>
                    <h4>How It Works:</h4>
                    <ol>
                      <li>Select specific muscles you want to target (e.g., rear delt, medial delt)</li>
                      <li>AI analyzes your selection and detects the optimal program type (PPL, Bro Split, etc.)</li>
                      <li>Generate a personalized program with exercises targeting your chosen muscles</li>
                    </ol>
                  </div>

                  {selectedMuscles.length > 0 && (
                    <div className={styles.selection}>
                      <h4>Selected Muscles ({selectedMuscles.length}):</h4>
                      <div className={styles.selectedMuscles}>
                        {selectedMuscles.map(id => {
                          for (const [parentGroup, muscles] of Object.entries(muscleMap || {})) {
                            const muscle = (muscles as any[]).find(m => m.id === id);
                            if (muscle) {
                              return (
                                <span key={id} className={styles.muscleTag}>
                                  {muscle.displayName}
                                </span>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                      
                      <div className={styles.builderActions}>
                        <Button
                          onClick={handleDetectOptimalSplit}
                          variant="ghost"
                          disabled={detectProgramTypeMutation.isPending}
                        >
                          {detectProgramTypeMutation.isPending ? 'Analyzing...' : 'Detect Optimal Split'}
                        </Button>
                        <Button
                          onClick={handleGenerateProgram}
                          variant="primary"
                          disabled={generateProgramMutation.isPending}
                        >
                          {generateProgramMutation.isPending ? 'Generating...' : 'Generate Program'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <BodyMap 
              mode="select" 
              selectedMuscles={selectedMuscles}
              onMuscleSelect={handleMuscleSelect}
            />
          </>
        )}
      </div>

      <Card className={styles.featuresCard}>
        <CardHeader>
          <CardTitle>Granular Muscle Targeting Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h4>🎯 Precise Targeting</h4>
              <p>Target specific muscle heads like rear delt, medial delt, anterior delt rather than just "shoulders"</p>
            </div>
            <div className={styles.feature}>
              <h4>🧠 Smart Program Detection</h4>
              <p>AI automatically detects if your selection fits PPL, Bro Split, Upper/Lower, or custom patterns</p>
            </div>
            <div className={styles.feature}>
              <h4>📊 Priority-Based Training</h4>
              <p>Set priorities for each muscle and get programs that focus on your specific goals</p>
            </div>
            <div className={styles.feature}>
              <h4>🔥 Heat Map Visualization</h4>
              <p>See your muscle priorities visualized in an interactive heat map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}