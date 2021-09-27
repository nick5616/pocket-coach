import React from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import ExerciseHighLevel from "./ExerciseHighLevel";
class Workout extends React.Component {
  render() {
    return (
      <Container>
        <Header size='huge'>Workout 1: 'Pull'</Header>
        <ExerciseHighLevel name = "Weighted pull-ups" reps = "8" sets = "3" target_rpe = "7"></ExerciseHighLevel>
      </Container>
    );
  }
}
export default Workout;