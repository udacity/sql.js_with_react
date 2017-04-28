import React, { Component } from 'react';

class Button extends Component {

  render() {
    return  (
      <div className="text-center">
        <a className="btn btn-default" onClick={this.props.onClick}>Evaluate</a>
      </div>
    );
  }
}

export default Button;
