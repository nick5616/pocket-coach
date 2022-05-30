import React from 'react'
import { Button, Image, Label, Icon } from 'semantic-ui-react';

class Set extends React.Component {
 
  render() {
    return (
      <div className="pc-card">
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
              <Label style = {{background: "#9AFECC", color: "#042514"}}>
                Weight
                <Label.Detail>
                  {this.props.weight} pounds
                </Label.Detail> 
              </Label>
              
              <Label style = {{background: "#9AFECC", color: "#042514"}}>
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
              <i className="write square icon" ></i>
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