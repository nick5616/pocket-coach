import {GenericExercise} from "../constants/Exercise"
import * as Muscles from "../constants/Muscles"

export let ExerciseData = {
  'pullUp': new GenericExercise('C:\\Users\\nickb\\source\\repos\\pocket-coach\\assets\\images\\chinabovebar.jpg', 
  [
    Muscles.ScientificName.Biceps, Muscles.ScientificName.LatissimusDorsi, Muscles.ScientificName.Trapezius, 
    Muscles.ScientificName.Rhomboid, Muscles.ScientificName.ReatDeltoid, 
    Muscles.ScientificName.TeresMajor, Muscles.ScientificName.TeresMinor
  ])
}

export default ExerciseData;