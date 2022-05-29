import React from 'react'
import { Container, Tab, Header, Button, Icon } from 'semantic-ui-react'
import Exercise from "./Exercise"
import Program from "./Program"
import ProgramEditor from "./ProgramEditor"
const panes = [
  {
    menuItem: 'Today\'s Workout',
    render: () => 
    <Tab.Pane attached={false}>
      <Container>
        <Header size='huge'>Pull</Header>
        <Exercise name = "Weighted pull-ups"></Exercise>
        <Exercise name = "T-bar rows"></Exercise>
        <Exercise name = "Cable pull-downs"></Exercise>
        <Exercise name = "Bicep curls"></Exercise>
        <Button icon labelPosition='left'>
          <Icon name='cloud download' />
          Export to CSV
        </Button>
      </Container>
    </Tab.Pane>,
  },
  {
    menuItem: 'Program',
    render: () => <Program></Program>,
  },
  {
    menuItem: 'Program Editor',
    render: () => <ProgramEditor></ProgramEditor>,
  },
]

const TabNav = () => (
  <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
)

export default TabNav;

