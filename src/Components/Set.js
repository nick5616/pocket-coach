import React from 'react'
import { Button, Card, Image, Label, Icon } from 'semantic-ui-react';

class Set extends React.Component {
 
  render() {
    return (
      <div className="card">
        <div className="content">
          <div className="header">            
            
              {this.props.type}
              
            
          </div>
          <div className="meta">
            Set {this.props.set_number} | RPE {this.props.target_rpe}
                
          </div>
          <div className="description">
            {this.props.description}
            <Label.Group>
              <Label color="green">
                Weight
                <Label.Detail>
                  {this.props.weight} pounds
                </Label.Detail> 
              </Label>
              
              <Label color="blue">
                Reps
                <Label.Detail>
                  {this.props.reps}  
                </Label.Detail> 
              </Label> 
              
            </Label.Group>
            
            
            
          </div>
          
        </div>
        <div className = "extra content">
            <div className="ui left icon input" style={{marginBottom: "1em"}}>
              <input type="text" placeholder="Note..." spellCheck="false" data-ms-editor="true" data-tooltip="How did you feel about this set?"/>
              <i className="edit icon"></i>
            </div>
              
            
            
            {/* <div className ="ui icon button" data-tooltip="Duplicate this set">
              <i className='add icon' /> Add
            </div>
            <div className ="ui icon button" data-tooltip="Delete this set">
              <i className='remove icon' /> Remove
            </div> */}
            
          </div>
      </div>
    );
  }
}

export default Set;