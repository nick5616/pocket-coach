import {
    Exercise,
    ExerciseSet,
    FormalMuscleName,
    InvolvementLevel,
    Joint,
    MuscleInvolved,
    USER,
    WeightType,
} from "./models";

export class ExerciseBuilder {
    constructor(name: string) {
        this.name = name;
    }
    name = "exercise name";

    primaryMusclesInvolved: MuscleInvolved[] = [];
    secondaryMusclesInvolved: MuscleInvolved[] = [];
    tertiaryMusclesInvolved: MuscleInvolved[] = [];
    quaternaryMusclesInvolved: MuscleInvolved[] = [];

    weightType: WeightType = WeightType.FREE_WEIGHT;
    startingWeight: number = 0;

    jointsUnderPressure: Joint[] = [];
    mechanicalTensionPoints: Joint[] = [];

    addPrimaryMusclesInvolved(MusclesInvolvedFormalNames: FormalMuscleName[]) {
        for (const muscleInvolvedFormalName of MusclesInvolvedFormalNames) {
            this.primaryMusclesInvolved.push({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel: InvolvementLevel.PRIMARY,
            });
        }
        return this;
    }

    addSecondaryMusclesInvolved(
        MusclesInvolvedFormalNames: FormalMuscleName[]
    ) {
        for (const muscleInvolvedFormalName of MusclesInvolvedFormalNames) {
            this.secondaryMusclesInvolved.push({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel: InvolvementLevel.SECONDARY,
            });
        }
        return this;
    }

    addTertiaryMusclesInvolved(MusclesInvolvedFormalNames: FormalMuscleName[]) {
        for (const muscleInvolvedFormalName of MusclesInvolvedFormalNames) {
            this.tertiaryMusclesInvolved.push({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel: InvolvementLevel.TERTIARY,
            });
        }
        return this;
    }

    addQuaternaryMusclesInvolved(
        MusclesInvolvedFormalNames: FormalMuscleName[]
    ) {
        for (const muscleInvolvedFormalName of MusclesInvolvedFormalNames) {
            this.quaternaryMusclesInvolved.push({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel: InvolvementLevel.QUATERNARY,
            });
        }
        return this;
    }

    setStartingWeight(weight: number) {
        this.startingWeight = weight;
        return this;
    }

    setWeightType(type: WeightType) {
        this.weightType = type;
        return this;
    }

    addJointsUnderPressure(joints: Joint[]) {
        this.jointsUnderPressure.push(...joints);
        return this;
    }

    addMechanicalTensionPoints(joints: Joint[]) {
        this.mechanicalTensionPoints.push(...joints);
        return this;
    }

    build(): Exercise {
        return {
            name: this.name,
            weightType: this.weightType,
            startingWeight: this.startingWeight,
            musclesInvolved: [
                ...this.primaryMusclesInvolved,
                ...this.secondaryMusclesInvolved,
                ...this.tertiaryMusclesInvolved,
                ...this.quaternaryMusclesInvolved,
            ],
            jointsUnderPressure: this.jointsUnderPressure,
            mechanicalTensionPoints: this.mechanicalTensionPoints,
        };
    }
}

const legPress = new ExerciseBuilder("Sled Leg Press")
    .addPrimaryMusclesInvolved([FormalMuscleName.VASTUS_MEDIALIS])
    .addSecondaryMusclesInvolved([])
    .addTertiaryMusclesInvolved([])
    .build();

console.log(legPress);

export const predefinedOrDownloadedExercises: any = {
    cableRow: {
        name: "Cable Row",
        weightType: WeightType.DOUBLE_PULLEY_CABLE,
        jointsUnderPressure: [Joint.BILATERAL_ELBOW, Joint.BILATERAL_SHOULDER],
        mechanicalTensionPoints: [
            Joint.BILATERAL_ELBOW,
            Joint.BILATERAL_SHOULDER,
        ],
        musclesInvolved: [
            {
                muscle: {
                    formalName: FormalMuscleName.LATISSIMUS_DORSI,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.LOWER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.MIDDLE_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.UPPER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.POSTERIOR_DELTOID,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },

            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_LONG_HEAD,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_SHORT_HEAD,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.ERECTOR_SPINAE,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.WRIST_FLEXORS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.INFRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.SUPRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TERES_MINOR,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
        ],
        startingWeight: 0,
    },

    weightedPullup: {
        name: "Weighted Pull-up",
        weightType: WeightType.WEIGHTED_CALISTHENICS,
        // progress: addFiveIfSucceeded,
        jointsUnderPressure: [Joint.BILATERAL_ELBOW, Joint.BILATERAL_SHOULDER],
        mechanicalTensionPoints: [
            Joint.BILATERAL_ELBOW,
            Joint.BILATERAL_SHOULDER,
        ],
        musclesInvolved: [
            {
                muscle: {
                    formalName: FormalMuscleName.LATISSIMUS_DORSI,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_LONG_HEAD,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_SHORT_HEAD,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },

            {
                muscle: {
                    formalName: FormalMuscleName.RHOMBOIDS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.LOWER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.MIDDLE_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.UPPER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },

            {
                muscle: {
                    formalName: FormalMuscleName.UPPER_PECTORALIS_MAJOR,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.LOWER_PECTORALIS_MAJOR,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.POSTERIOR_DELTOID,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.SERRATUS_ANTERIOR,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TERES_MAJOR,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BRACHIALIS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BRACHIORADIALIS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.ERECTOR_SPINAE,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TRICEPS_LATERAL_HEAD,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TRICEPS_LONG_HEAD,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TRICEPS_MEDIAL_HEAD,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.SUPRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.INFRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.ANTERIOR_DELTOID,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.PECTORALIS_MINOR,
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
                    formalName: FormalMuscleName.LEVATOR_SCAPULAE,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.WRIST_EXTENSORS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.WRIST_FLEXORS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TERES_MINOR,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
        ],

        startingWeight: USER.bodyweight,
    },
    bicepCurl: {
        name: "Bicep curl",
        weightType: WeightType.DOUBLE_PULLEY_CABLE,
        jointsUnderPressure: [Joint.BILATERAL_ELBOW, Joint.BILATERAL_SHOULDER],
        mechanicalTensionPoints: [
            Joint.BILATERAL_ELBOW,
            Joint.BILATERAL_SHOULDER,
        ],
        musclesInvolved: [
            {
                muscle: {
                    formalName: FormalMuscleName.LATISSIMUS_DORSI,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.LOWER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.MIDDLE_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.UPPER_TRAPEZIUS,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.POSTERIOR_DELTOID,
                },
                involvementLevel: InvolvementLevel.PRIMARY,
            },

            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_LONG_HEAD,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.BICEPS_SHORT_HEAD,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.ERECTOR_SPINAE,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.WRIST_FLEXORS,
                },
                involvementLevel: InvolvementLevel.SECONDARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.INFRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.SUPRASPINATUS,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
            {
                muscle: {
                    formalName: FormalMuscleName.TERES_MINOR,
                },
                involvementLevel: InvolvementLevel.TERTIARY,
            },
        ],
    },
    sledLegPress: legPress,
};
