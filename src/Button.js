import React, { Component } from 'react';

class Button extends Component {

  render() {
    return  (
      <span>
      <button onClick={this.props.click} >{this.props.label}</button>  
      </span>
    );
  } 
}

export default Button;
