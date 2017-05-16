import React, { Component } from 'react';
import Range from 'range-input-react';
import 'react-rangeslider/lib/index.css';

class HistoryControl extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      currentTime: 0,
      duration: 3600,
      maxRange : 1000
    }
  }

  handleOnChange = (e) => {
    var value = Number(e.target.value);
    if (value === this.state.maxRange) {
      var time = this.state.duration;
    } else if (value === 0) {
      var time = 0;
    } else {
      var time = (value / this.state.maxRange) * this.state.duration;
    }
    console.log('Value:', value, ' Slider time:', time);
    this.setState({
      currentTime: value
    })
  }

  render() {
    return (    
      <Range className="scrubber"
      onChange={this.handleOnChange}
      value={this.state.currentTime}
      min={0}
      max={this.state.maxRange} />
      
    )
  } 
}

export default HistoryControl;

