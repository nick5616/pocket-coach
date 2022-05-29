import React from 'react';
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'
import '../../styles.css';

const FileUploader = props => {
  const hiddenFileInput = React.useRef(null);
  
  const handleClick = event => {
    console.log("button clicked!");
    hiddenFileInput.current.click();
  };
  const handleChange = event => {
    console.log("changed")
    const fileUploaded = event.target.files[0];
    props.handleFile(fileUploaded);
  };
  return (
    
      <div onClick={handleClick}>
      <div style={{
        paddingTop: "10em",
        height: "40vh",
        
        width: "100vw",
        alignContent: "center",
      

      }} className="fileUploader">
        <Header as='h2' textAlign='center' icon>
          <Icon name='angle double up' />
            Upload a program file
          <Header.Subheader>
            Click to browse or drag and drop a file
          </Header.Subheader>
          </Header>
        <br></br>
      </div>
    
      <input type="file"
             ref={hiddenFileInput}
             onChange={handleChange}
             style={{display:'none'}} 
      /> 
    </div>
  );
};
export default FileUploader;