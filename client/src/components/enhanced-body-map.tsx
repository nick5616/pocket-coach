import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import styles from "./enhanced-body-map.module.css";

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

interface EnhancedBodyMapProps {
  userId: string;
  onMuscleSelect: (muscleGroup: MuscleGroup) => void;
  selectedMuscles: number[];
  mode?: 'heat' | 'selection' | 'preferences';
}

export default function EnhancedBodyMap({ 
  userId, 
  onMuscleSelect, 
  selectedMuscles, 
  mode = 'heat' 
}: EnhancedBodyMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  const { data: heatMapData = [], isLoading } = useQuery<HeatMapData[]>({
    queryKey: ['/api/progress/heat-map', { userId }],
    enabled: !!userId,
  });

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return '#e2e8f0'; // Gray for untrained
    if (intensity <= 0.2) return '#fef3c7'; // Light yellow
    if (intensity <= 0.4) return '#fed7aa'; // Light orange
    if (intensity <= 0.6) return '#fca5a5'; // Light red
    if (intensity <= 0.8) return '#f87171'; // Red
    return '#dc2626'; // Dark red for high intensity
  };

  const getMuscleOpacity = (muscleId: string, intensity: number) => {
    if (selectedMuscles.includes(parseInt(muscleId))) return 1;
    if (hoveredMuscle === muscleId) return 0.9;
    return Math.max(0.3, intensity);
  };

  const isSelected = (muscleId: string) => selectedMuscles.includes(parseInt(muscleId));

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading detailed muscle map...</p>
      </div>
    );
  }

  return (
    <div className={styles.bodyMapContainer}>
      {/* View Toggle */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${viewMode === 'front' ? styles.active : ''}`}
          onClick={() => setViewMode('front')}
        >
          Front View
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'back' ? styles.active : ''}`}
          onClick={() => setViewMode('back')}
        >
          Back View
        </button>
      </div>

      {/* 3D Style Body Visualization */}
      <div className={styles.bodyVisualization}>
        <svg
          viewBox="0 0 400 600"
          className={styles.bodySvg}
          style={{ transform: viewMode === 'back' ? 'scaleX(-1)' : 'none' }}
        >
          {/* Gradient Definitions for 3D Effect */}
          <defs>
            <radialGradient id="muscleGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </radialGradient>
            <filter id="shadowEffect">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Head */}
          <ellipse 
            cx="200" cy="60" rx="35" ry="45"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="2"
            className={styles.bodyPart}
          />

          {/* Neck */}
          <rect 
            x="185" y="100" width="30" height="25"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
            className={styles.bodyPart}
          />

          {/* Torso Base */}
          <path
            d="M 160 125 Q 200 120 240 125 L 245 300 Q 200 305 155 300 Z"
            fill="#f9fafb"
            stroke="#d1d5db"
            strokeWidth="2"
            className={styles.bodyPart}
          />

          {/* Chest Muscles - Upper, Middle, Lower */}
          <path
            id="upperChest"
            d="M 170 140 Q 200 135 230 140 Q 225 160 200 165 Q 175 160 170 140"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'upperChest')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('upperChest', heatMapData.find(d => d.muscleGroup.name === 'upperChest')?.progress.intensity || 0)}
            stroke={isSelected('upperChest') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('upperChest') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('upperChest')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'upperChest')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />
          
          <path
            id="middleChest"
            d="M 175 165 Q 200 160 225 165 Q 220 185 200 190 Q 180 185 175 165"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'middleChest')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('middleChest', heatMapData.find(d => d.muscleGroup.name === 'middleChest')?.progress.intensity || 0)}
            stroke={isSelected('middleChest') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('middleChest') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('middleChest')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'middleChest')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          <path
            id="lowerChest"
            d="M 180 190 Q 200 185 220 190 Q 215 210 200 215 Q 185 210 180 190"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'lowerChest')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('lowerChest', heatMapData.find(d => d.muscleGroup.name === 'lowerChest')?.progress.intensity || 0)}
            stroke={isSelected('lowerChest') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('lowerChest') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('lowerChest')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'lowerChest')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Shoulder Muscles - Anterior, Medial, Rear Delts */}
          <ellipse
            id="anteriorDelt"
            cx="150" cy="155" rx="20" ry="30"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'anteriorDelt')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('anteriorDelt', heatMapData.find(d => d.muscleGroup.name === 'anteriorDelt')?.progress.intensity || 0)}
            stroke={isSelected('anteriorDelt') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('anteriorDelt') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('anteriorDelt')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'anteriorDelt')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          <ellipse
            id="medialDelt"
            cx="130" cy="155" rx="15" ry="25"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'medialDelt')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('medialDelt', heatMapData.find(d => d.muscleGroup.name === 'medialDelt')?.progress.intensity || 0)}
            stroke={isSelected('medialDelt') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('medialDelt') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('medialDelt')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'medialDelt')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          <ellipse
            id="rearDelt"
            cx="250" cy="155" rx="20" ry="30"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'rearDelt')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('rearDelt', heatMapData.find(d => d.muscleGroup.name === 'rearDelt')?.progress.intensity || 0)}
            stroke={isSelected('rearDelt') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('rearDelt') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('rearDelt')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'rearDelt')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Arms */}
          <ellipse
            id="biceps"
            cx="120" cy="210" rx="15" ry="40"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'biceps')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('biceps', heatMapData.find(d => d.muscleGroup.name === 'biceps')?.progress.intensity || 0)}
            stroke={isSelected('biceps') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('biceps') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('biceps')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'biceps')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          <ellipse
            id="triceps"
            cx="280" cy="210" rx="15" ry="40"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'triceps')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('triceps', heatMapData.find(d => d.muscleGroup.name === 'triceps')?.progress.intensity || 0)}
            stroke={isSelected('triceps') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('triceps') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('triceps')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'triceps')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Abs */}
          <rect
            id="abs"
            x="185" y="220" width="30" height="50"
            rx="5"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'abs')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('abs', heatMapData.find(d => d.muscleGroup.name === 'abs')?.progress.intensity || 0)}
            stroke={isSelected('abs') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('abs') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('abs')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'abs')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Legs */}
          <ellipse
            id="quadriceps"
            cx="180" cy="380" rx="25" ry="60"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'quadriceps')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('quadriceps', heatMapData.find(d => d.muscleGroup.name === 'quadriceps')?.progress.intensity || 0)}
            stroke={isSelected('quadriceps') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('quadriceps') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('quadriceps')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'quadriceps')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          <ellipse
            id="hamstrings"
            cx="220" cy="380" rx="25" ry="60"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'hamstrings')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('hamstrings', heatMapData.find(d => d.muscleGroup.name === 'hamstrings')?.progress.intensity || 0)}
            stroke={isSelected('hamstrings') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('hamstrings') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('hamstrings')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'hamstrings')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Calves */}
          <ellipse
            id="calves"
            cx="200" cy="500" rx="20" ry="40"
            fill={getIntensityColor(heatMapData.find(d => d.muscleGroup.name === 'calves')?.progress.intensity || 0)}
            fillOpacity={getMuscleOpacity('calves', heatMapData.find(d => d.muscleGroup.name === 'calves')?.progress.intensity || 0)}
            stroke={isSelected('calves') ? '#3b82f6' : '#6b7280'}
            strokeWidth={isSelected('calves') ? '3' : '1'}
            className={styles.muscle}
            onMouseEnter={() => setHoveredMuscle('calves')}
            onMouseLeave={() => setHoveredMuscle(null)}
            onClick={() => {
              const muscle = heatMapData.find(d => d.muscleGroup.name === 'calves')?.muscleGroup;
              if (muscle) onMuscleSelect(muscle);
            }}
            filter="url(#shadowEffect)"
          />

          {/* Muscle Definition Lines for 3D Effect */}
          <g className={styles.definitionLines} stroke="#9ca3af" strokeWidth="0.5" fill="none">
            <path d="M 200 165 Q 200 175 200 185" /> {/* Chest separation */}
            <path d="M 185 230 L 185 260" /> {/* Ab definition */}
            <path d="M 200 230 L 200 260" />
            <path d="M 215 230 L 215 260" />
          </g>
        </svg>

        {/* Muscle Info Tooltip */}
        {hoveredMuscle && (
          <div className={styles.tooltip}>
            <h4>{hoveredMuscle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            <p>Click to select this muscle group</p>
            {heatMapData.find(d => d.muscleGroup.name === hoveredMuscle) && (
              <div className={styles.tooltipStats}>
                <span>Intensity: {Math.round((heatMapData.find(d => d.muscleGroup.name === hoveredMuscle)?.progress.intensity || 0) * 100)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h4>Training Intensity</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#e2e8f0' }}></div>
            <span>Untrained</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#fef3c7' }}></div>
            <span>Light</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#fed7aa' }}></div>
            <span>Moderate</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#f87171' }}></div>
            <span>High</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#dc2626' }}></div>
            <span>Intense</span>
          </div>
        </div>
      </div>
    </div>
  );
}