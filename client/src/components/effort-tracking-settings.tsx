import { useUserPreferences, getEffortTrackingInfo } from "@/contexts/user-preferences-context";
import type { EffortTrackingPreference } from "@shared/schema";
import styles from "./effort-tracking-settings.module.css";

export function EffortTrackingSettings() {
  const { effortTrackingPreference, setEffortTrackingPreference, isUpdating } = useUserPreferences();

  const options: { value: EffortTrackingPreference; label: string; description: string }[] = [
    {
      value: "rpe",
      label: "RPE (Rate of Perceived Exertion)",
      description: "Track how hard each set felt on a scale of 1-10"
    },
    {
      value: "rir",
      label: "RIR (Reps in Reserve)",
      description: "Track how many more reps you could have done"
    },
    {
      value: "none",
      label: "None",
      description: "Only track weight and reps (simplest option)"
    }
  ];

  const handlePreferenceChange = async (preference: EffortTrackingPreference) => {
    try {
      await setEffortTrackingPreference(preference);
    } catch (error) {
      console.error("Failed to update effort tracking preference:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Effort Tracking</h3>
        <p className={styles.subtitle}>
          Choose how you want to track workout intensity
        </p>
      </div>

      <div className={styles.optionsList}>
        {options.map((option) => (
          <div
            key={option.value}
            className={`${styles.option} ${
              effortTrackingPreference === option.value ? styles.selected : ""
            }`}
            onClick={() => handlePreferenceChange(option.value)}
          >
            <div className={styles.optionContent}>
              <div className={styles.optionHeader}>
                <div className={styles.radioButton}>
                  {effortTrackingPreference === option.value && (
                    <div className={styles.radioButtonActive} />
                  )}
                </div>
                <span className={styles.optionLabel}>{option.label}</span>
              </div>
              <p className={styles.optionDescription}>{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      {isUpdating && (
        <div className={styles.updating}>
          <span>Updating preference...</span>
        </div>
      )}
    </div>
  );
}