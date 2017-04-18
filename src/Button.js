import React, { Component } from 'react';

class Button extends Component {

  constructor(props) {
    super(props);
    this.sqlEvaluator = props.sqlEvaluator;
    this.click = this.click.bind(this);
  }

  click() {
    //console.log('We think sql is:', studentSql);
    if (this.sqlEvaluator) {
      this.sqlEvaluator();
    }
  }

  render() {
    return  (
      <div>
      <button onClick={this.click} >Evaluate</button>  
      </div>
    );
  } 
}

export default Button;
