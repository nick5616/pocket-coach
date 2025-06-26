import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import styles from './body-map.module.css';

interface MuscleGroup {
  id: number;
  name: string;
  parentGroup: string;
  displayName: string;
  svgId: string;
  anatomicalName: string;
  primaryFunction: string;
}

interface UserMusclePreference {
  id: number;
  userId: string;
  muscleGroupId: number;
  priority: number; // 1-10
  currentSatisfaction: number; // 1-10
  targetGrowth: string; // "shrink", "maintain", "grow", "grow_significantly"
  weeklyVolumeTarget?: number;
}

interface BodyMapProps {
  onMuscleSelect?: (muscleGroup: MuscleGroup, preference: UserMusclePreference | null) => void;
  selectedMuscles?: number[];
  mode?: 'select' | 'preferences' | 'heat_map';
}

export default function BodyMap({ onMuscleSelect, selectedMuscles = [], mode = 'select' }: BodyMapProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch detailed muscle map
  const { data: muscleMap } = useQuery({
    queryKey: ['/api/muscles/detailed-map']
  });

  // Fetch user muscle preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/muscles/preferences']
  });

  // Update muscle preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: (data: { muscleGroupId: number; preference: Partial<UserMusclePreference> }) =>
      apiRequest('PUT', `/api/muscles/preferences/${data.muscleGroupId}`, data.preference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/muscles/preferences'] });
      setShowPreferenceModal(false);
    }
  });

  const handleMuscleClick = (muscleGroup: MuscleGroup) => {
    if (mode === 'select') {
      onMuscleSelect?.(muscleGroup, getUserPreference(muscleGroup.id));
    } else if (mode === 'preferences') {
      setSelectedMuscleGroup(muscleGroup);
      setShowPreferenceModal(true);
    }
  };

  const getUserPreference = (muscleGroupId: number): UserMusclePreference | null => {
    return userPreferences?.find((p: UserMusclePreference) => p.muscleGroupId === muscleGroupId) || null;
  };

  const getMuscleIntensity = (muscleGroupId: number): number => {
    const preference = getUserPreference(muscleGroupId);
    if (!preference) return 0;
    
    // Calculate intensity based on priority and target growth
    const growthMultiplier = {
      'shrink': 0.2,
      'maintain': 0.5,
      'grow': 0.8,
      'grow_significantly': 1.0
    }[preference.targetGrowth] || 0.5;
    
    return (preference.priority / 10) * growthMultiplier;
  };

  const renderMuscleGroup = (parentGroup: string, muscles: MuscleGroup[]) => (
    <div key={parentGroup} className={styles.muscleGroup}>
      <h3 className={styles.groupTitle}>{parentGroup.charAt(0).toUpperCase() + parentGroup.slice(1)}</h3>
      <div className={styles.muscleList}>
        {muscles.map(muscle => {
          const preference = getUserPreference(muscle.id);
          const intensity = mode === 'heat_map' ? getMuscleIntensity(muscle.id) : 0;
          const isSelected = selectedMuscles.includes(muscle.id);
          
          return (
            <div
              key={muscle.id}
              className={`${styles.muscleItem} ${isSelected ? styles.selected : ''}`}
              style={mode === 'heat_map' ? {
                background: `rgba(255, 0, 0, ${intensity})`,
                border: intensity > 0.5 ? '2px solid #ff0000' : '1px solid #ccc'
              } : {}}
              onClick={() => handleMuscleClick(muscle)}
            >
              <div className={styles.muscleName}>{muscle.displayName}</div>
              <div className={styles.muscleFunction}>{muscle.primaryFunction}</div>
              {preference && mode === 'preferences' && (
                <div className={styles.preferenceIndicator}>
                  <span className={styles.priority}>Priority: {preference.priority}/10</span>
                  <span className={styles.growth}>{preference.targetGrowth}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.bodyMap}>
      <div className={styles.header}>
        <h2>Body Map - Granular Muscle Targeting</h2>
        <p>Select specific muscles to target in your workouts</p>
      </div>

      {mode === 'heat_map' && (
        <div className={styles.heatMapLegend}>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ background: 'rgba(255, 0, 0, 0.2)' }}></div>
            <span>Low Priority</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ background: 'rgba(255, 0, 0, 0.5)' }}></div>
            <span>Medium Priority</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.colorBox} style={{ background: 'rgba(255, 0, 0, 1)' }}></div>
            <span>High Priority</span>
          </div>
        </div>
      )}

      <div className={styles.muscleGroups}>
        {muscleMap && Object.entries(muscleMap).map(([parentGroup, muscles]) =>
          renderMuscleGroup(parentGroup, muscles as MuscleGroup[])
        )}
      </div>

      {/* Preference Modal */}
      {showPreferenceModal && selectedMuscleGroup && (
        <MusclePreferenceModal
          muscle={selectedMuscleGroup}
          currentPreference={getUserPreference(selectedMuscleGroup.id)}
          onSave={(preference) => {
            updatePreferenceMutation.mutate({
              muscleGroupId: selectedMuscleGroup.id,
              preference
            });
          }}
          onClose={() => setShowPreferenceModal(false)}
        />
      )}
    </div>
  );
}

interface MusclePreferenceModalProps {
  muscle: MuscleGroup;
  currentPreference: UserMusclePreference | null;
  onSave: (preference: Partial<UserMusclePreference>) => void;
  onClose: () => void;
}

function MusclePreferenceModal({ muscle, currentPreference, onSave, onClose }: MusclePreferenceModalProps) {
  const [priority, setPriority] = useState(currentPreference?.priority || 5);
  const [satisfaction, setSatisfaction] = useState(currentPreference?.currentSatisfaction || 5);
  const [targetGrowth, setTargetGrowth] = useState(currentPreference?.targetGrowth || 'maintain');
  const [volumeTarget, setVolumeTarget] = useState(currentPreference?.weeklyVolumeTarget || 10);

  const handleSave = () => {
    onSave({
      priority,
      currentSatisfaction: satisfaction,
      targetGrowth,
      weeklyVolumeTarget: volumeTarget
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <Card className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Set Preferences for {muscle.displayName}</CardTitle>
          <p className={styles.anatomicalName}>{muscle.anatomicalName}</p>
          <p className={styles.function}>{muscle.primaryFunction}</p>
        </CardHeader>
        <CardContent>
          <div className={styles.preferenceForm}>
            <div className={styles.formGroup}>
              <label>Priority (1-10):</label>
              <input
                type="range"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className={styles.slider}
              />
              <span>{priority}/10</span>
            </div>

            <div className={styles.formGroup}>
              <label>Current Satisfaction (1-10):</label>
              <input
                type="range"
                min="1"
                max="10"
                value={satisfaction}
                onChange={(e) => setSatisfaction(Number(e.target.value))}
                className={styles.slider}
              />
              <span>{satisfaction}/10</span>
            </div>

            <div className={styles.formGroup}>
              <label>Target Growth:</label>
              <select
                value={targetGrowth}
                onChange={(e) => setTargetGrowth(e.target.value)}
                className={styles.select}
              >
                <option value="shrink">Shrink (Cut/Reduce)</option>
                <option value="maintain">Maintain Current Size</option>
                <option value="grow">Grow (Moderate)</option>
                <option value="grow_significantly">Grow Significantly</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Weekly Volume Target (Sets):</label>
              <input
                type="number"
                min="1"
                max="50"
                value={volumeTarget}
                onChange={(e) => setVolumeTarget(Number(e.target.value))}
                className={styles.numberInput}
              />
            </div>

            <div className={styles.modalActions}>
              <Button onClick={handleSave} variant="primary">
                Save Preferences
              </Button>
              <Button onClick={onClose} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}