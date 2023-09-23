export enum Joint {
    UNILATERAL_SHOULDER,
    BILATERAL_SHOULDER,
    HIPS,
    UNILATERAL_KNEE,
    BILATERAL_KNEES,
    UNILATERAL_ELBOW,
    BILATERAL_ELBOW,
    UNILATERAL_WRIST,
    BILATERAL_WRIST,
    UNILATERAL_ANKLE,
    BILATERAL_ANKLE,
}

export enum FormalMuscleName {
    ANTERIOR_DELTOID, // FRONT DELT
    MEDIAL_DELTOID, // SIDE DELT
    POSTERIOR_DELTOID, // REAR DELT
    TRICEPS_LONG_HEAD, // BIG TRICEP
    TRICEPS_MEDIAL_HEAD, // DEEP TRICEP
    TRICEPS_LATERAL_HEAD, // OUTER TRICEP
    WRIST_FLEXORS, // OUTER FOREARM
    WRIST_EXTENSORS, // INNER FOREARM
    BICEPS_SHORT_HEAD, // INNER BICEP
    BICEPS_LONG_HEAD, // OUTER BICEP
    BRACHIALIS, // OUTER ARM BETWEEN BICEP AND TRICEP
    BRACHIORADIALIS,
    UPPER_PECTORALIS_MAJOR,
    LOWER_PECTORALIS_MAJOR,
    PECTORALIS_MINOR, // DEEP CHEST
    RECTUS_ABDOMINUS, // ABS
    SERRATUS_ANTERIOR, // UPPER SIDE ABS NEAR LATS
    OBLIQUES, // SIDE ABS
    LEVATOR_SCAPULAE, // SIDE NECK MUSCLE
    UPPER_TRAPEZIUS, // PART OF BACK YOU CAN SEE FROM YOUR FRONT, OFTEN MISTAKENLY CALLED "SHOULDERS"
    MIDDLE_TRAPEZIUS, // THE MIDDLE OF YOUR UPPER BACK
    LOWER_TRAPEZIUS, // THE CENTER OF YOUR BACK
    RHOMBOIDS, // DEEP CENTER OF BACK
    TERES_MAJOR, // THE LOWER EYELID
    TERES_MINOR, // THE UPPER EYELID
    INFRASPINATUS, // BELOW THE EYES OF THE DEMON BACK
    SUPRASPINATUS, // DEEP SHOULDER
    LATISSIMUS_DORSI,
    ERECTOR_SPINAE,
    GLUTEUS_MEDIUS, // HIP BUTT
    GLUTEUS_MINIMUS, // DEEP BUTT, KINDA LIKE UPPER BUTT THOUGH TBH
    GLUTEUS_MAXIMUS, // BUTT
    BICEPS_FEMORIS, // HAMSTRING
    SEMITENDINOSUS, // HAMSTRING
    SEMIMEMBRANOSUS, // HAMSTRING
    GASTROCNEMEUS_LONG_HEAD, // OUTER CALF
    GASTROCNEMEUS_MEDIAL_HEAD, // INNER CALF
    SOLEUS, // LOWER CALF
    TIBIALIS_ANTERIOR, // FRONT_CALF
    VASTUS_MEDIALIS, // TEARDROP QUAD
    RECTUS_FEMORIS, // MID QUAD (OUTER)
    VASTUS_INTERMEDIUS, // DEEP MID QUAD
    VASTUS_LATERALIS, // SIDE QUAD
    ADDUCTOR_BREVIS, // DEEP INNER THIGH
    ADDUCTOR_LONGUS, // INNER THIGH
    ADDUCTOR_MAGNUS, // INNER THIGH
}

export enum CommonMuscleName {
    DEEP_ADDUCTOR,
    ADDUCTOR,
    SIDE_QUAD,
    MID_QUAD,
    MID_DEEP_QUAD,
    TEARDROP,
    FRONT_CALF,
    LOWER_CALF,
    OUTER_CALF,
    INNER_CALF,
    HAMSTRING,
    HIP_BUTT,
    DEEP_BUTT,
    MAIN_BUTT,
    SPINAL_ERECTORS,
    LATS,
    DEEP_MID_BACK,
    DEEP_SHOULDER,
    DEEP_UPPER_BACK,
    UPPER_BACK,
    CENTER_BACK,
    CENTER_UPPER_BACK,
    TRAPS,
    SIDE_NECK,
    SIDE_ABS,
    SERRATUS,
    ABS,
    DEEP_CHEST,
    UPPER_CHEST,
    LOWER_CHEST,
    SIDE_FOREARM,
    SIDE_ARM,
    INNER_BICEP,
    OUTER_BICEP,
    INNER_FOREARM,
    OUTER_FOREARM,
    BIG_TRICEP,
    HORSESHOEMAKER_TRICEP,
    DEEP_TRICEP,
    REAR_DELT,
    SIDE_DELT,
    FRONT_DELT,
}

export const formalToCommon = new Map<FormalMuscleName, CommonMuscleName>([
    [FormalMuscleName.ADDUCTOR_BREVIS, CommonMuscleName.DEEP_ADDUCTOR],
    [FormalMuscleName.ADDUCTOR_LONGUS, CommonMuscleName.ADDUCTOR],
    [FormalMuscleName.ADDUCTOR_MAGNUS, CommonMuscleName.ADDUCTOR],
    [FormalMuscleName.ANTERIOR_DELTOID, CommonMuscleName.FRONT_DELT],
    [FormalMuscleName.BICEPS_FEMORIS, CommonMuscleName.HAMSTRING],
    [FormalMuscleName.BICEPS_LONG_HEAD, CommonMuscleName.HAMSTRING],
    [FormalMuscleName.BICEPS_SHORT_HEAD, CommonMuscleName.HAMSTRING],
    [FormalMuscleName.BRACHIALIS, CommonMuscleName.SIDE_ARM],
    [FormalMuscleName.BRACHIORADIALIS, CommonMuscleName.SIDE_FOREARM],
    [FormalMuscleName.ERECTOR_SPINAE, CommonMuscleName.SPINAL_ERECTORS],
    [FormalMuscleName.GASTROCNEMEUS_LONG_HEAD, CommonMuscleName.LOWER_CALF],
    [FormalMuscleName.GASTROCNEMEUS_MEDIAL_HEAD, CommonMuscleName.INNER_CALF],
    [FormalMuscleName.GLUTEUS_MAXIMUS, CommonMuscleName.MAIN_BUTT],
    [FormalMuscleName.GLUTEUS_MINIMUS, CommonMuscleName.DEEP_BUTT],
    [FormalMuscleName.GLUTEUS_MEDIUS, CommonMuscleName.HIP_BUTT],
    [FormalMuscleName.INFRASPINATUS, CommonMuscleName.DEEP_UPPER_BACK],
    [FormalMuscleName.LATISSIMUS_DORSI, CommonMuscleName.LATS],
    [FormalMuscleName.LEVATOR_SCAPULAE, CommonMuscleName.SIDE_NECK],
    [FormalMuscleName.LOWER_PECTORALIS_MAJOR, CommonMuscleName.LOWER_CHEST],
    [FormalMuscleName.LOWER_TRAPEZIUS, CommonMuscleName.CENTER_BACK],
    [FormalMuscleName.MEDIAL_DELTOID, CommonMuscleName.SIDE_DELT],
    [FormalMuscleName.MIDDLE_TRAPEZIUS, CommonMuscleName.CENTER_UPPER_BACK],
    [FormalMuscleName.OBLIQUES, CommonMuscleName.SIDE_ABS],
    [FormalMuscleName.PECTORALIS_MINOR, CommonMuscleName.DEEP_CHEST],
    [FormalMuscleName.POSTERIOR_DELTOID, CommonMuscleName.REAR_DELT],
    [FormalMuscleName.RECTUS_ABDOMINUS, CommonMuscleName.ABS],
    [FormalMuscleName.RECTUS_FEMORIS, CommonMuscleName.MID_QUAD],
    [FormalMuscleName.RHOMBOIDS, CommonMuscleName.DEEP_MID_BACK],
    [FormalMuscleName.SEMIMEMBRANOSUS, CommonMuscleName.HAMSTRING],
    [FormalMuscleName.SEMITENDINOSUS, CommonMuscleName.HAMSTRING],
    [FormalMuscleName.SERRATUS_ANTERIOR, CommonMuscleName.SERRATUS],
    [FormalMuscleName.SOLEUS, CommonMuscleName.LOWER_CALF],
    [FormalMuscleName.SUPRASPINATUS, CommonMuscleName.DEEP_SHOULDER],
    [FormalMuscleName.TERES_MAJOR, CommonMuscleName.UPPER_CHEST],
    [FormalMuscleName.TERES_MINOR, CommonMuscleName.UPPER_BACK],
    [FormalMuscleName.TIBIALIS_ANTERIOR, CommonMuscleName.FRONT_CALF],
    [
        FormalMuscleName.TRICEPS_LATERAL_HEAD,
        CommonMuscleName.HORSESHOEMAKER_TRICEP,
    ],
    [FormalMuscleName.TRICEPS_LONG_HEAD, CommonMuscleName.BIG_TRICEP],
    [FormalMuscleName.TRICEPS_MEDIAL_HEAD, CommonMuscleName.DEEP_TRICEP],
    [FormalMuscleName.UPPER_PECTORALIS_MAJOR, CommonMuscleName.UPPER_CHEST],
    [FormalMuscleName.UPPER_TRAPEZIUS, CommonMuscleName.TRAPS],
    [FormalMuscleName.VASTUS_INTERMEDIUS, CommonMuscleName.MID_DEEP_QUAD],
    [FormalMuscleName.VASTUS_LATERALIS, CommonMuscleName.SIDE_QUAD],
    [FormalMuscleName.VASTUS_MEDIALIS, CommonMuscleName.TEARDROP],
    [FormalMuscleName.WRIST_EXTENSORS, CommonMuscleName.OUTER_FOREARM],
    [FormalMuscleName.WRIST_FLEXORS, CommonMuscleName.INNER_FOREARM],
]);

export enum MuscleGroup {
    SHOULDER,
    CHEST,
    TRICEP,
    BICEP,
    GLUTES,
    HAMSTRINGS,
    ADDUCTORS,
    QUADS,
    CALVES,
    ROTATOR_CUFF,
    FOREARM,
}

export interface Muscle {
    formalName: FormalMuscleName;
    commonName: CommonMuscleName;
    description: string;
}

export enum InvolvementLevel {
    NONE,
    QUATERNARY,
    TERTIARY,
    SECONDARY,
    PRIMARY,
}

export interface MuscleRecruitment {
    involvementLevel: InvolvementLevel;
    muscle: Muscle;
}

export enum WeightType {
    /**
     * 
     *  1. Two dumbbells
        2. One dumbbell
        3. bodyweight calisthenics
        4. weighted calisthenics
        5. free weights
        6. machine weights
        7. cable weights
     */
    BILATERAL_DUMBBELL = "BILATERAL_DUMBBELL",
    UNILATERAL_DUMBBELL = "UNILATERAL_DUMBBELL",
    PIN_MACHINE = "PIN_MACHINE",
    PLATE_MACHINE = "PLATE_MACHINE",
    SINGLE_PULLEY_CABLE = "SINGLE_PULLEY_CABLE",
    DOUBLE_PULLEY_CABLE = "DOUBLE_PULLEY_CABLE",
    FREE_WEIGHT = "FREE_WEIGHT",
    BODYWEIGHT_CALISTHENICS = "BODYWEIGHT_CALISTHENICS",
    WEIGHTED_CALISTHENICS = "WEIGHTED_CALISTHENICS",
}

/**
 * TODO: FILL THIS OUT
 */
export interface ExerciseSet {
    reps: number;
    weight: number;
    rpe?: number;
}

export interface Exercise {
    name: string;
    sets: ExerciseSet[];
    weightType: WeightType;
    jointsUnderPressure?: Joint[];
    mechanicalTensionPoints?: Joint[];
    musclesInvolved: MuscleRecruitment[];
}

export interface RecreationalActivity {}

export type Activity = Workout | RecreationalActivity | "Rest";

export interface Workout {
    exercises: Exercise[];
}

export interface Day {
    activities: Activity[];
    calendarDay: number;
}

export interface Program {
    name: string;
    days: Day[];
}
export interface WorkoutSession {
    timeStarted: Date;
    timeEnded: Date;
    exercises: Exercise[];
}

export interface RecreationSession {}
export type ActivitySession = WorkoutSession | RecreationSession;
export interface DayLog {
    plannedActivities: Activity[];
    completedActivities: ActivitySession[];
    calendarDate: number;
}

export interface ProgramLog {
    days: DayLog[];
}

export interface UserLog {
    pastPrograms: ProgramLog[];
    currentProgram: ProgramLog;
}

const program: Program = {
    name: "Push Legs Pull",
    days: [
        {
            activities: [
                {
                    exercises: [
                        {
                            name: "Weighted Pull-ups",
                            sets: [
                                { reps: 5, weight: 25, rpe: 8 },
                                { reps: 5, weight: 25, rpe: 8 },
                                { reps: 5, weight: 25, rpe: 8 },
                            ],
                            weightType: WeightType.WEIGHTED_CALISTHENICS,
                            jointsUnderPressure: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_SHOULDER,
                            ],
                            mechanicalTensionPoints: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_SHOULDER,
                            ],
                            musclesInvolved: [
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LATISSIMUS_DORSI,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_LONG_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_SHORT_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },

                                {
                                    muscle: {
                                        formalName: FormalMuscleName.RHOMBOIDS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LOWER_TRAPEZIUS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.MIDDLE_TRAPEZIUS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.UPPER_TRAPEZIUS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },

                                {
                                    muscle: {
                                        formalName: FormalMuscleName.RHOMBOIDS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.UPPER_PECTORALIS_MAJOR,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LOWER_PECTORALIS_MAJOR,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.POSTERIOR_DELTOID,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.SERRATUS_ANTERIOR,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TERES_MAJOR,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName: FormalMuscleName.BRACHIALIS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BRACHIORADIALIS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },

                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.ERECTOR_SPINAE,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TRICEPS_LATERAL_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TRICEPS_LONG_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TRICEPS_MEDIAL_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.SUPRASPINATUS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.INFRASPINATUS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.ANTERIOR_DELTOID,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.PECTORALIS_MINOR,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName: FormalMuscleName.OBLIQUES,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName: FormalMuscleName.RHOMBOIDS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LEVATOR_SCAPULAE,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.WRIST_EXTENSORS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.WRIST_FLEXORS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TERES_MINOR,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                            ],
                        },
                        {
                            name: "Cable Row",
                            sets: [
                                { reps: 12, weight: 100, rpe: 6 },
                                { reps: 9, weight: 120, rpe: 7 },
                                { reps: 8, weight: 140, rpe: 9 },
                            ],
                            weightType: WeightType.DOUBLE_PULLEY_CABLE,
                            jointsUnderPressure: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_SHOULDER,
                            ],
                            mechanicalTensionPoints: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_SHOULDER,
                            ],
                            musclesInvolved: [
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LATISSIMUS_DORSI,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.LOWER_TRAPEZIUS,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.MIDDLE_TRAPEZIUS,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.UPPER_TRAPEZIUS,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.POSTERIOR_DELTOID,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },

                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_LONG_HEAD,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_SHORT_HEAD,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.ERECTOR_SPINAE,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.WRIST_FLEXORS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.INFRASPINATUS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.SUPRASPINATUS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.TERES_MINOR,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                            ],
                        },
                        {
                            name: "Bicep curl",
                            sets: [{ reps: 7, weight: 20, rpe: 5 }],
                            weightType: WeightType.BILATERAL_DUMBBELL,
                            jointsUnderPressure: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_WRIST,
                            ],
                            mechanicalTensionPoints: [Joint.BILATERAL_ELBOW],
                            musclesInvolved: [
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_LONG_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_SHORT_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },
                                {
                                    muscle: {
                                        formalName: FormalMuscleName.BRACHIALIS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BRACHIORADIALIS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },
                            ],
                        },
                        {
                            name: "example blank",
                            sets: [
                                { reps: 7, weight: 20, rpe: 5 },
                                { reps: 7, weight: 20, rpe: 5 },
                                { reps: 7, weight: 20, rpe: 5 },
                            ],
                            weightType: WeightType.BILATERAL_DUMBBELL,
                            jointsUnderPressure: [
                                Joint.BILATERAL_ELBOW,
                                Joint.BILATERAL_WRIST,
                            ],
                            mechanicalTensionPoints: [Joint.BILATERAL_ELBOW],
                            musclesInvolved: [
                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BICEPS_LONG_HEAD,
                                    },
                                    involvementLevel: InvolvementLevel.PRIMARY,
                                },

                                {
                                    muscle: {
                                        formalName: FormalMuscleName.BRACHIALIS,
                                    },
                                    involvementLevel:
                                        InvolvementLevel.SECONDARY,
                                },

                                {
                                    muscle: {
                                        formalName:
                                            FormalMuscleName.BRACHIORADIALIS,
                                    },
                                    involvementLevel: InvolvementLevel.TERTIARY,
                                },
                            ],
                        },
                    ],
                },
            ],
            calendarDay: 321434,
        },
        { activities: ["rest"], calendarDay: 43 },
    ],
};
