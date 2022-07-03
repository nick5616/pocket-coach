//import * as Muscles from "./Muscles"

interface Exercise {
  imagePath: string,
  musclesWorked: number[]
}



export class GenericExercise implements Exercise {
  imagePath: string;
  musclesWorked: number[];

  constructor(path: string, muscles: number[]) {
    this.imagePath =  require('C:\\Users\\nickb\\source\\repos\\pocket-coach\\assets\\images\\chinabovebar.jpg');
    this.musclesWorked = [];
  }
  
} 
