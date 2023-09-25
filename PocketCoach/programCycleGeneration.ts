import { predefinedOrDownloadedExercises } from "./exercisesDatabase";
import {
    AttemptedExercise,
    ExerciseSet,
    ProgramLog,
    pplProgram,
    mockPplProgramLog,
    Exercise,
    Workout,
    Day,
} from "./models";

export function isSatisfactorySet(
    performed: ExerciseSet,
    expected: ExerciseSet
) {
    const didSatisfactoryReps = performed.reps >= expected.reps;

    const didSatisfactoryWeight = performed.weight >= expected.weight;

    if (didSatisfactoryWeight && didSatisfactoryReps) {
        return true;
    }
    return false;
}

export function isGreatSet(performed: ExerciseSet, expected: ExerciseSet) {
    const didMoreReps = performed.reps > expected.reps;
    const didMoreWeight = performed.weight > expected.weight;
    const didSameReps = performed.reps === expected.reps;
    const didSameWeight = performed.weight === expected.weight;
    const performedRpe = performed.rpe ?? 10;
    const expectedRpe = expected.rpe ?? 10;
    const wasEasier = performedRpe < expectedRpe;
    if ((didSameReps || didMoreReps) && (didMoreWeight || didSameWeight)) {
        return true;
    } else if (
        (wasEasier && didSameReps && didMoreWeight) ||
        (wasEasier && didSameWeight && didMoreReps)
    ) {
        return true;
    }
    return false;
}

export function isExtraordinarySet(
    performed: ExerciseSet,
    expected: ExerciseSet
) {
    const didMoreReps = performed.reps > expected.reps;
    const didMoreWeight = performed.weight > expected.weight;
    const didSameReps = performed.reps === expected.reps;
    const didSameWeight = performed.weight === expected.weight;
    const performedRpe = performed.rpe;
    const expectedRpe = expected.rpe;
    if (!performedRpe || !expectedRpe) {
        return false;
    }
    const wasEasier = performedRpe < expectedRpe;
    const wasMuchEasier = performedRpe - expectedRpe > 2;
    if (didMoreReps && didMoreWeight && wasEasier) {
        return true;
    } else if (
        (wasMuchEasier && didSameReps && didMoreWeight) ||
        (wasMuchEasier && didSameWeight && didMoreReps)
    ) {
        return true;
    }
    return false;
}

export function achievedMeetsOrExceedsProgrammingForSet(
    achieved: ExerciseSet[],
    programmed: ExerciseSet[]
) {
    let satisfactorySets = 0;
    let greatSets = 0;
    let extraordinarySets = 0;

    if (achieved.length < 1) {
        return false;
    }
    for (let i = 0; i < achieved.length; i++) {
        if (i > programmed.length - 1) {
            break;
        }
        if (isSatisfactorySet(achieved[i], programmed[i])) {
            satisfactorySets++;
        }
        if (isGreatSet(achieved[i], programmed[i])) {
            greatSets++;
        }
        if (isExtraordinarySet(achieved[i], programmed[i])) {
            extraordinarySets++;
        }
    }
    if (satisfactorySets === programmed.length) {
        return true;
    } else if (greatSets >= Math.ceil(programmed.length / 2)) {
        return true;
    } else if (extraordinarySets > 0) {
        return true;
    }
    return false;
}

function generateNextCycle(
    program: ProgramLog,
    progressionFunction: (
        log: ProgramLog,
        exerciseName: string
    ) => ExerciseSet[],
    options: { strictSets: boolean }
) {
    if (program.days.length < 1) {
        // user has not done a workout with this program
        // check past programs ?
    }
}

export class ProgressionScheme {
    constructor(
        program: ProgramLog,
        progressionFunction: (
            log: ProgramLog,
            exerciseName: string
        ) => ExerciseSet[]
    ) {
        this.program = program;
        this.progressionFunction = progressionFunction;
        // this.generateNextCycle = generateNextCycle;
    }
    generateNextCycle() {
        generateNextCycle(this.program, this.progressionFunction, {
            strictSets: this.strictSets,
        });
    }
    program;
    progressionFunction;
    strictSets = false; // you can or cannot advance with majority of sets done well. For example, if you only do 2 sets of the 3 prescribed but the first two are exceeding programming you can pass
}
const programProgressor = new ProgressionScheme(
    mockPplProgramLog,
    addFiveIfSucceeded
);

export function addFiveIfSucceeded(
    log: ProgramLog,
    exerciseName: string
): ExerciseSet[] {
    const exercise = predefinedOrDownloadedExercises.find(
        (val: { name: string }) => val.name === exerciseName
    );
    const lastCompletedWorkout: Workout = log.days[0].completedActivities.find(
        (activity) => "exercises" in activity
    ) as Workout;

    if (!lastCompletedWorkout) {
        const firstCycle = pplProgram.startingCycle;

        const startingExercise = firstCycle
            .find((day: Day) => {
                day.workouts.find((workout: Workout) =>
                    workout.plannedExercises.find(
                        (exercise: Exercise) => (exercise.name = exerciseName)
                    )
                );
            })
            ?.workouts.find((workout: Workout) =>
                workout.plannedExercises.find(
                    (exercise: Exercise) => exercise.name === exerciseName
                )
            )
            ?.plannedExercises.find(
                (exercise: Exercise) => exercise.name === exerciseName
            );
        return startingExercise?.programmedSets ?? [];
    }
    return [{ reps: 8, weight: exercise.startingWeight, rpe: 5 }];
}
