import React from 'react'
import { Card, Icon, Image, Container, Header } from 'semantic-ui-react'
import Set from "./Set.js";

function fetchQuoteObject(){
  let ret;
  /*
  fetch('https://animechan.vercel.app/api/random')
    .then(response => response.json())
    .then(quote => {
      console.log(quote)
      ret = quote;
    })
  */
  this.componentDidMount();
  return ret;
}

//quote = await fetchQuoteObject();

class Quote extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      anime: "Spiderman",
      character: "Bully Maguire",
      quote: "I'm gonna put some dirt in your eye!"
    };
  }
  /*
  componentDidMount(){
    this.setState({
      anime: quote.anime,
      character: quote.character,
      quote: quote.quote
    });
  }
  */
  render() {
    return (
      <Header as="h2"><i>{this.state.quote}</i> - {this.state.character}</Header>
    );
  }
}
export default Quote;