import React, { Component } from 'react';

class Button extends Component {

  render() {
    return  (
      <span>
      <button disabled={this.props.disabled} onClick={this.props.click} >{this.props.label}</button>  
      </span>
    );
  } 
}

export default Button;
