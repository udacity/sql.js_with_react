import React, { Component } from 'react';

class Button extends Component {
  click() {
    //console.log('We think sql is:', studentSql);
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
