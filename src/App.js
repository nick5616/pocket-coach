import logo from './logo.svg';
import './App.css';
import Exercise from "./Components/Exercise.js";
import { Container, Header, Card } from 'semantic-ui-react';
import TabNav from "./Components/TabNav.js"
import "./styles.css"
const App = ({children}) => (
  <Container>
    <script src="https://unpkg.com/prettyalert/dist/prettyalert.min.js"></script>
    <Header size='huge'>Workout 1: 'Pull'</Header>
    <Exercise name = "Weighted pull-ups"></Exercise>
    <Exercise name = "T-bar rows"></Exercise>
    <Exercise name = "Cable pull-downs"></Exercise>
    <Exercise name = "Bicep curls"></Exercise>
    {children}
  </Container>
);


export default App;
