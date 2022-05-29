import React from 'react';
import { Card, Icon, Image, Container, Header, Button } from 'semantic-ui-react'

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
    <>
      <Button icon labelPosition='left' onClick={handleClick} style={{backgroundColor: "#E92FB5"}} className="fileUploader">
        <Icon name='cloud upload' 
  

        />
        Upload
      </Button>
      <input type="file"
             ref={hiddenFileInput}
             onChange={handleChange}
             style={{display:'none'}} 
      /> 
    </>
  );
};
export default FileUploader;