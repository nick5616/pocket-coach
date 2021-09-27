import React from 'react'
import { Button, Card, Image, Label, Icon } from 'semantic-ui-react';
import Exercise from './Exercise';

class ExerciseHighLevel extends React.Component {
  render() {
    return (
      <Card style = {{
        margin: "2em"
      }}>
        <Card.Content>
          <Card.Header>
            {this.props.name}
          </Card.Header>
        </Card.Content>
        <Card.Content extra>
          <Card.Description>
            <Label.Group>
              <Label color="red">
                Reps
                <Label.Detail>
                  {this.props.reps}  
                </Label.Detail> 
              </Label> 
              <Label color="orange">
                Sets
                <Label.Detail>
                  {this.props.sets}
                </Label.Detail> 
              </Label> 
              <Label color="yellow">
                Target RPE
                <Label.Detail>
                  {this.props.target_rpe}
                </Label.Detail> 
              </Label> 
            </Label.Group>
          </Card.Description>
          
        </Card.Content>
      </Card>
    );
  }
}

export default ExerciseHighLevel;