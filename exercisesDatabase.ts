import {
    Exercise,
    ExerciseSet,
    FormalMuscleName,
    getFormalNamesInMuscleGroup,
    InvolvementLevel,
    Joint,
    MuscleGroup,
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

    weightType: WeightType = WeightType.BARBELL;
    startingWeight: number = 0;

    jointsUnderPressure: Joint[] = [];
    mechanicalTensionPoints: Joint[] = [];
    predefined: boolean = true;
    setPredefined(predefined: boolean) {
        this.predefined = predefined;
        return this;
    }
    addPrimaryMusclesInvolved(MusclesInvolvedFormalNames: FormalMuscleName[]) {
        for (const muscleInvolvedFormalName of MusclesInvolvedFormalNames) {
            this.primaryMusclesInvolved.push({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel: InvolvementLevel.PRIMARY,
            });
        }
        return this;
    }

    addMuscleGroupInvolved(
        muscleGroup: MuscleGroup,
        involvementLevel: InvolvementLevel
    ) {
        const musclesInvolvedFormalNames =
            getFormalNamesInMuscleGroup(muscleGroup);
        for (const muscleInvolvedFormalName of musclesInvolvedFormalNames) {
            this._addMuscleInvolved({
                muscle: { formalName: muscleInvolvedFormalName },
                involvementLevel,
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

    _addMuscleInvolved(muscleInvolved: MuscleInvolved) {
        switch (muscleInvolved.involvementLevel) {
            case InvolvementLevel.PRIMARY:
                this.primaryMusclesInvolved.push(muscleInvolved);
                break;
            case InvolvementLevel.SECONDARY:
                this.secondaryMusclesInvolved.push(muscleInvolved);
                break;
            case InvolvementLevel.TERTIARY:
                this.tertiaryMusclesInvolved.push(muscleInvolved);
                break;
            case InvolvementLevel.QUATERNARY:
                this.quaternaryMusclesInvolved.push(muscleInvolved);
                break;
            default:
                break;
        }
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
            predefined: this.predefined,
        };
    }
}

const legPress = new ExerciseBuilder("Sled Leg Press")
    .addMuscleGroupInvolved(MuscleGroup.QUADS, InvolvementLevel.PRIMARY)
    .addMuscleGroupInvolved(MuscleGroup.GLUTES, InvolvementLevel.PRIMARY)
    .addMuscleGroupInvolved(MuscleGroup.ADDUCTORS, InvolvementLevel.PRIMARY)
    .addMuscleGroupInvolved(MuscleGroup.HAMSTRINGS, InvolvementLevel.SECONDARY)
    .setStartingWeight(120)
    .setWeightType(WeightType.PLATE_MACHINE)
    .build();
const barbellHipThrust = new ExerciseBuilder("Barbell Hip Thrust")
    .addMuscleGroupInvolved(MuscleGroup.GLUTES, InvolvementLevel.PRIMARY)
    .addMuscleGroupInvolved(MuscleGroup.ADDUCTORS, InvolvementLevel.SECONDARY)
    .addSecondaryMusclesInvolved([
        FormalMuscleName.ERECTOR_SPINAE,
        FormalMuscleName.RECTUS_ABDOMINUS,
    ])
    .addMuscleGroupInvolved(MuscleGroup.QUADS, InvolvementLevel.SECONDARY)
    .setStartingWeight(0)
    .setWeightType(WeightType.BARBELL)
    .build();
const plateLoadedHipThrust = new ExerciseBuilder("Barbell Hip Thrust")
    .addMuscleGroupInvolved(MuscleGroup.GLUTES, InvolvementLevel.PRIMARY)
    .addMuscleGroupInvolved(MuscleGroup.ADDUCTORS, InvolvementLevel.SECONDARY)
    .addMuscleGroupInvolved(MuscleGroup.QUADS, InvolvementLevel.SECONDARY)
    .setStartingWeight(45)
    .setWeightType(WeightType.PLATE_MACHINE)
    .setPredefined(true)
    .build();

console.log(legPress);
// TODO: Use exercise id (uuid) as the key into the map
// TODO: Add id to exercise type
export const predefinedOrDownloadedExercises = new Map<string, Exercise>([
    [legPress.name, legPress],
    [barbellHipThrust.name, barbellHipThrust],
    [plateLoadedHipThrust.name, plateLoadedHipThrust],
]);

export class ExerciseDB {
    constructor() {}
    exercises = predefinedOrDownloadedExercises;
    addExercise(exercise: Exercise) {
        this.exercises.set(exercise.name, exercise);
    }
}
