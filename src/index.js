import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
///import App from './App';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css'
import TabNav from './Components/TabNav';
import logo from './logo.svg';
import './App.css';
import Exercise from "./Components/Exercise.js";
import Quote from "./Components/Quote.js";
import { Container, Header, Card } from 'semantic-ui-react';


const App = ({children}) => (
  <Container style={{padding: "1em"}}>
    <Header as="h1">Pocket Coach</Header>
    <Quote></Quote>
    {children}
  </Container>
  
);

ReactDOM.render(
  <App>
    <TabNav></TabNav>
  </App>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
