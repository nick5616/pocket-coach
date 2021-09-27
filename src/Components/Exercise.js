import React from 'react'
import { Card, Icon, Image, Container, Header } from 'semantic-ui-react'
import Set from "./Set.js";
class Exercise extends React.Component {
  render() {
    return (
      <Container style = {{margin: "2em"}}>
        <Header size='large'>Exercise 1: '{this.props.name}'</Header>
        <Card.Group>
          <Set 
            name = {this.props.name}
            set_number = "1"
            bodyweight = {160}
            added_weight = {45}
            reps = {5}
            target_rpe = {7}
          ></Set>
          <Set 
            name = {this.props.name}
            set_number = "2"
            bodyweight = {160}
            added_weight = {45}
            reps = {5}
            target_rpe = {7}
          ></Set>
          <Set 
            name = {this.props.name}
            set_number = "3"
            bodyweight = {160}
            reps = {5}
            target_rpe = {7}
          ></Set>
          
        </Card.Group>
      </Container>
    );
  }
}
export default Exercise;