import React from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import ExerciseHighLevel from "./ExerciseHighLevel";
import '../styles.css';

class Workout extends React.Component {
  render() {
    let exercises = this.props.exercises.map((e) => <ExerciseHighLevel name = "Weighted pull-ups" reps = "8" sets = "3" target_rpe = "7"></ExerciseHighLevel>) ;

    return (
      <Container>
        <Header size='medium'>{this.props.workout_name}</Header>
        {exercises}
      </Container>
    );
  }
}
export default Workout;