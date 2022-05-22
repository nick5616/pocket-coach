import React from 'react'
import { Button, Card, Image, Label, Icon } from 'semantic-ui-react';

class Set extends React.Component {
  render() {
    return (
      <Card>
        <Card.Content>
          <Card.Header>
            {this.props.name}
          </Card.Header>
          <Card.Meta> Set {this.props.set_number}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Card.Description>
            <Label.Group>
              <Label color="green">
                Total Weight
                <Label.Detail>
                  {(this.props.added_weight ? this.props.added_weight : 0) + this.props.bodyweight}
                </Label.Detail> 
              </Label> 
              {this.props.added_weight && 
              (<div>
                  <Label color="olive">
                    <Icon name = "weight"></Icon>
                    BW
                    <Label.Detail>
                      {this.props.bodyweight}
                    </Label.Detail> 
                  </Label>
                  <Label color="teal">
                    <Icon name = "add"></Icon>
                    Added
                    <Label.Detail>
                      {this.props.added_weight}
                    </Label.Detail> 
                  </Label>
                </div>)
              }
              <Label color="blue">
                Reps
                <Label.Detail>
                  {this.props.reps}  
                </Label.Detail> 
              </Label> 
              <Label color="orange">
                Target RPE
                <Label.Detail>
                  {this.props.target_rpe}
                </Label.Detail> 
              </Label> 
            </Label.Group>
          </Card.Description>
          <div>
            
            <div className ="ui icon button" data-tooltip="Duplicate this set">
              <i className='add icon' />
            </div>
            <div className ="ui icon button" data-tooltip="Delete this set">
              <i className='remove icon' />
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }
}

export default Set;