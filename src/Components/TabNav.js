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
      
        <Header size='huge'>Pull</Header>
        <Exercise name = "Weighted pull-ups"></Exercise>
        <Exercise name = "T-bar rows"></Exercise>
        <Exercise name = "Cable pull-downs"></Exercise>
        <Exercise name = "Bicep curls"></Exercise>
        <Button icon labelPosition='left'>
          <Icon name='cloud download' />
          Export to CSV
        </Button>
      
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

const color = {color: "pink"};

const TabNav = () => (
  
  <Tab menu={{ color: "pink", secondary: true, pointing: true }} panes={panes} />
)

export default TabNav;

