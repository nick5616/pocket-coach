import React from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import Workout from "./Workout";

let programData = require("../program.json");
class Program extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    let current_workout_name;
    let current_workout_exercises;
    let current_workout = programData.workouts[0];
    //programData.workouts.forEach((current_workout)=>{
      console.log("current workout", current_workout);
      current_workout_name = current_workout.name;
      current_workout_exercises = current_workout.exercises;
      const workouts = programData.workouts.map((w)=> <Workout name={w.workout_name} exercises={w.exercises}></Workout>);
    //});
    return (
      <Container>
        <Header size="large">{programData.program_name}</Header>
        <div>{workouts}</div>
        <Button icon labelPosition='left'>
          <Icon name='cloud download' />
          Export to CSV
        </Button>
      </Container>
    );
  }
}
export default Program;