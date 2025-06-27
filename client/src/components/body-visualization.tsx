import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./body-visualization.module.css";

interface MuscleGroup {
  id: number;
  name: string;
  region: string;
  displayName: string;
  svgId: string;
}

interface ProgressData {
  frequency: number;
  volume: number;
  lastWorked: Date | null;
  intensity: number;
}

interface HeatMapData {
  muscleGroup: MuscleGroup;
  progress: ProgressData;
}

interface BodyVisualizationProps {
  userId: number;
  onMuscleSelect?: (muscleGroup: MuscleGroup) => void;
  selectedMuscles?: number[];
}

export default function BodyVisualization({ 
  userId, 
  onMuscleSelect, 
  selectedMuscles = [] 
}: BodyVisualizationProps) {
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);

  const { data: heatMapData, isLoading } = useQuery<HeatMapData[]>({
    queryKey: ['/api/progress/heat-map', userId],
    queryFn: async () => {
      const response = await fetch(`/api/progress/heat-map?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch heat map data');
      return response.json();
    }
  });

  const getHeatColor = (intensity: number): string => {
    if (intensity === 0) return '#f3f4f6'; // No activity - gray
    
    // Create heat map from blue (low) to red (high)
    const colors = [
      '#dbeafe', // Very light blue
      '#93c5fd', // Light blue
      '#3b82f6', // Blue
      '#f59e0b', // Amber
      '#f97316', // Orange
      '#ef4444', // Red
    ];
    
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  };

  const handleMuscleClick = (muscleGroup: MuscleGroup) => {
    if (onMuscleSelect) {
      onMuscleSelect(muscleGroup);
    }
  };

  const getMuscleData = (svgId: string): HeatMapData | undefined => {
    return heatMapData?.find(data => data.muscleGroup.svgId === svgId);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div style={{ width: '3rem', height: '3rem', border: '2px solid transparent', borderTop: '2px solid var(--pb-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* View Toggle */}
      <div className={styles.viewToggle}>
        <div className={styles.toggleButtons}>
          <button
            onClick={() => setViewMode('front')}
            className={`${styles.toggleButton} ${viewMode === 'front' ? styles.active : ''}`}
          >
            Front
          </button>
          <button
            onClick={() => setViewMode('back')}
            className={`${styles.toggleButton} ${viewMode === 'back'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Body SVG */}
      <div className="relative bg-white rounded-lg shadow-sm p-4">
        <svg
          viewBox="0 0 300 500"
          className="w-full h-auto"
          style={{ maxHeight: '600px' }}
        >
          {viewMode === 'front' ? (
            // Front view body parts
            <>
              {/* Head */}
              <ellipse cx="150" cy="50" rx="30" ry="40" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
              
              {/* Chest */}
              <rect
                id="chest"
                x="120" y="80" width="60" height="50" rx="15"
                fill={getMuscleData('chest')?.progress.intensity ? getHeatColor(getMuscleData('chest')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('chest')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('chest')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('chest');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('chest');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />
              
              {/* Abs */}
              <rect
                id="abs"
                x="135" y="140" width="30" height="60" rx="8"
                fill={getMuscleData('abs')?.progress.intensity ? getHeatColor(getMuscleData('abs')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('abs')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('abs')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('abs');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('abs');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Shoulder */}
              <circle
                id="left-shoulder"
                cx="100" cy="95" r="20"
                fill={getMuscleData('shoulders')?.progress.intensity ? getHeatColor(getMuscleData('shoulders')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('shoulders')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('shoulders')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('shoulders');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('shoulders');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Shoulder */}
              <circle
                id="right-shoulder"
                cx="200" cy="95" r="20"
                fill={getMuscleData('shoulders')?.progress.intensity ? getHeatColor(getMuscleData('shoulders')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('shoulders')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('shoulders')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('shoulders');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('shoulders');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Bicep */}
              <ellipse
                id="left-bicep"
                cx="85" cy="135" rx="12" ry="25"
                fill={getMuscleData('biceps')?.progress.intensity ? getHeatColor(getMuscleData('biceps')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('biceps')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('biceps')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('biceps');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('biceps');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Bicep */}
              <ellipse
                id="right-bicep"
                cx="215" cy="135" rx="12" ry="25"
                fill={getMuscleData('biceps')?.progress.intensity ? getHeatColor(getMuscleData('biceps')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('biceps')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('biceps')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('biceps');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('biceps');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Quad */}
              <rect
                id="left-quad"
                x="120" y="220" width="25" height="80" rx="8"
                fill={getMuscleData('quads')?.progress.intensity ? getHeatColor(getMuscleData('quads')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('quads')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('quads')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('quads');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('quads');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Quad */}
              <rect
                id="right-quad"
                x="155" y="220" width="25" height="80" rx="8"
                fill={getMuscleData('quads')?.progress.intensity ? getHeatColor(getMuscleData('quads')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('quads')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('quads')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('quads');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('quads');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Calf */}
              <ellipse
                id="left-calf"
                cx="132" cy="350" rx="10" ry="30"
                fill={getMuscleData('calves')?.progress.intensity ? getHeatColor(getMuscleData('calves')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('calves')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('calves')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('calves');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('calves');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Calf */}
              <ellipse
                id="right-calf"
                cx="168" cy="350" rx="10" ry="30"
                fill={getMuscleData('calves')?.progress.intensity ? getHeatColor(getMuscleData('calves')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('calves')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('calves')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('calves');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('calves');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />
            </>
          ) : (
            // Back view body parts
            <>
              {/* Head */}
              <ellipse cx="150" cy="50" rx="30" ry="40" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
              
              {/* Back */}
              <rect
                id="back"
                x="120" y="80" width="60" height="70" rx="15"
                fill={getMuscleData('back')?.progress.intensity ? getHeatColor(getMuscleData('back')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('back')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('back')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('back');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('back');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Lower Back */}
              <rect
                id="lower-back"
                x="130" y="160" width="40" height="40" rx="8"
                fill={getMuscleData('lower-back')?.progress.intensity ? getHeatColor(getMuscleData('lower-back')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('lower-back')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('lower-back')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('lower-back');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('lower-back');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Tricep */}
              <ellipse
                id="left-tricep"
                cx="85" cy="135" rx="12" ry="25"
                fill={getMuscleData('triceps')?.progress.intensity ? getHeatColor(getMuscleData('triceps')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('triceps')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('triceps')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('triceps');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('triceps');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Tricep */}
              <ellipse
                id="right-tricep"
                cx="215" cy="135" rx="12" ry="25"
                fill={getMuscleData('triceps')?.progress.intensity ? getHeatColor(getMuscleData('triceps')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('triceps')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('triceps')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('triceps');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('triceps');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Glutes */}
              <ellipse
                id="glutes"
                cx="150" cy="210" rx="35" ry="20"
                fill={getMuscleData('glutes')?.progress.intensity ? getHeatColor(getMuscleData('glutes')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('glutes')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('glutes')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('glutes');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('glutes');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Left Hamstring */}
              <rect
                id="left-hamstring"
                x="120" y="240" width="25" height="60" rx="8"
                fill={getMuscleData('hamstrings')?.progress.intensity ? getHeatColor(getMuscleData('hamstrings')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('hamstrings')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('hamstrings')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('hamstrings');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('hamstrings');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />

              {/* Right Hamstring */}
              <rect
                id="right-hamstring"
                x="155" y="240" width="25" height="60" rx="8"
                fill={getMuscleData('hamstrings')?.progress.intensity ? getHeatColor(getMuscleData('hamstrings')!.progress.intensity) : '#f3f4f6'}
                stroke={selectedMuscles.includes(getMuscleData('hamstrings')?.muscleGroup.id || 0) ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={selectedMuscles.includes(getMuscleData('hamstrings')?.muscleGroup.id || 0) ? '3' : '2'}
                className="cursor-pointer hover:stroke-blue-500 transition-colors"
                onClick={() => {
                  const data = getMuscleData('hamstrings');
                  if (data) handleMuscleClick(data.muscleGroup);
                }}
                onMouseEnter={() => {
                  const data = getMuscleData('hamstrings');
                  if (data) setHoveredMuscle(data.muscleGroup);
                }}
                onMouseLeave={() => setHoveredMuscle(null)}
              />
            </>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredMuscle && (
          <div className="absolute top-2 left-2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
            <div className="font-medium">{hoveredMuscle.displayName}</div>
            {heatMapData && (
              <div className="text-xs text-gray-300">
                {getMuscleData(hoveredMuscle.svgId)?.progress.frequency || 0} workouts •{' '}
                {getMuscleData(hoveredMuscle.svgId)?.progress.lastWorked 
                  ? `${Math.floor((Date.now() - new Date(getMuscleData(hoveredMuscle.svgId)!.progress.lastWorked!).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                  : 'Never trained'
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heat Map Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
        <span>Low</span>
        <div className="flex gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatColor(intensity) }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}