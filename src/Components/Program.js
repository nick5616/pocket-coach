import React from 'react'
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import Workout from "./Workout";
class Program extends React.Component {
  render() {
    return (
      <Container>
        <Header size='huge'>Workout 1: 'Pull'</Header>
        <Workout name = "Weighted pull-ups" ></Workout>
        <Button icon labelPosition='left'>
          <Icon name='cloud download' />
          Export to CSV
        </Button>
      </Container>
    );
  }
}
export default Program;