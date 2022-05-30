import React from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import Workout from "./Workout";
import FileUploader from "./Utility/FileUploader";
import ExerciseHighLevel from './ExerciseHighLevel';
import ProgramSummary from "./ProgramSummary";
import SweetAlert from 'sweetalert2-react';
import Swal from 'sweetalert2'

class Program extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      file: null
    }
  }

  render() {
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
 
  
  const handleUpload = e => {
    console.log("in handle upload", e);
    
    programData = require("../"+e.name);
    console.log("PROGRAM DATA", programData);
    const fileReader = new FileReader();
    fileReader.readAsText(e);
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      
      this.setState({file: programData});
      
      console.log("hi there! fancy seeing you here");     
    };
    Swal.fire({
      title: 'Success!',
      icon: 'success',
    });
    
    
  };
  
  let showme = false;

  let programContent = <div>
    <Header size = "large"> {this.state.file ? this.state.file.program_name : ""} </Header>
    <ProgramSummary workouts={this.state.file ? this.state.file.workouts: ""}></ProgramSummary>
    <Button  icon labelPosition='left'>
      <Icon name='cloud download' />
      Download
    </Button>
      

  </div>;
  
  
  return (
    <div>
      <div class="ui attached stackable menu">
        <div class="ui container">
          <a class="item">
            <i class="home icon"></i> Home
          </a>
          <a class="item">
            <i class="grid layout icon"></i> Browse
          </a>
          <a class="item">
            <i class="mail icon"></i> Messages
          </a>
          <div class="ui simple dropdown item">
            More
            <i class="dropdown icon"></i>
            <div class="menu">
              <a class="item"><i class="edit icon"></i> Edit Profile</a>
              <a class="item"><i class="globe icon"></i> Choose Language</a>
              <a class="item"><i class="settings icon"></i> Account Settings</a>
            </div>
          </div>
          <div class="right item">
            <div class="ui input">
              <input type="text" placeholder="Search..." spellcheck="false" data-ms-editor="true"/>
            </div>
          </div>
        </div>
      </div>
      
      { this.state.file ? programContent : <FileUploader handleFile={handleUpload}></FileUploader> }
    </div>
  );
  }
}
export default Program;