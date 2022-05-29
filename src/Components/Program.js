import React, {useState, useEffect, useRef} from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import Workout from "./Workout";
import FileUploader from "./Utility/FileUploader";
import ExerciseHighLevel from './ExerciseHighLevel';
import ProgramSummary from "./ProgramSummary";
function Program() {
  
  let programData = null;
  let current_workout_name;
  let current_workout_exercises;
  
  //let current_workout = programData.workouts[0];
  //programData.workouts.forEach((current_workout)=>{
  //  console.log("current workout", current_workout);
  //  current_workout_name = current_workout.name;
  //  current_workout_exercises = current_workout.exercises;
    //const workouts = programData.workouts.map((w)=> <Workout name={w.workout_name} exercises={w.exercises}></Workout>);
  //});
  const [file, setFile] = useState("");
  
  const handleUpload = e => {
    console.log("in handle upload", e);
    
    programData = require("../"+e.name);
    console.log("PROGRAM DATA", programData);
    const fileReader = new FileReader();
    fileReader.readAsText(e);
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      
      setFile(programData);
      
      console.log("hi there! fancy seeing you here");     
    };
    
    
    
  };
  

  let programContent = <div>
    <Header size = "large"> {file.program_name} </Header>
    <ProgramSummary workouts={file.workouts}></ProgramSummary>
    <Button icon labelPosition='left'>
      <Icon name='cloud download' />
      Download
    </Button>
  </div>;

  let noProgramContent = <div>
    <div style={{display: "inline"}}>
      <Header size="large">Upload a workout program, you dingus</Header>
      <FileUploader handleFile={handleUpload}></FileUploader>
    </div>
    
  </div>;
  
  
  return (
    <Container>
      { file ? programContent : noProgramContent }
    </Container>
  );
  
}
export default Program;