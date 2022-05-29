import React from 'react'
import { Card, Icon, Image, Container, Header } from 'semantic-ui-react'
import Set from "./Set.js";
class Exercise extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <Container style = {{margin: "2em"}}>
        <Header size='large'>{this.props.name}</Header>
        <div className = "ui cards">
          <Set 
            type = "Warm up"
            description = "Go easy and get the blood flowing"
            set_number = "1"
            weight = {45}
            reps = {12}
            target_rpe = {5}
          ></Set>
          <Set 
            type = "Volume"
            description = "Felt good"
            set_number = "2"
            weight = {45}
            reps = {5}
            target_rpe = {7}
          ></Set>
          <Set 
            type = "Volume"
            description = "Felt good"
            set_number = "2"
            weight = {45}
            reps = {5}
            target_rpe = {7}
          ></Set>
          <Set 
            type = "Volume"
            description = "Felt good"
            set_number = "2"
            weight = {45}
            reps = {5}
            target_rpe = {7}
          ></Set>
          <Set 
            type = "One rep max"
            set_number = "3"
            weight = {90}
            reps = {1}
            target_rpe = {10}
          ></Set>
          
          
        </div>
      </Container>
    );
  }
}
export default Exercise;