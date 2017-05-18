import React, { Component } from 'react';
import Range from 'range-input-react';
import 'react-rangeslider/lib/index.css';

class HistoryControl extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      currentSliderValue: 0,
      duration: 3600,
      maxRange : 1000
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentSliderValue !== nextProps.sliderValue) {
      this.setState({currentSliderValue: nextProps.sliderValue});
    }
  }

  handleOnChange = (e) => {
    var value = Number(e.target.value);
    var time;
    if (value === this.state.maxRange) {
      time = this.state.duration;
    } else if (value === 0) {
      time = 0;
    } else {
      time = (value / this.state.maxRange) * this.state.duration;
    }
    console.log('Value:', value, ' Slider time:', time);
    this.setState({
      currentSliderValue: value
    });
    this.props.updateSlider(value);
  }

  render() {
    return (    
      <Range className="scrubber"
      onChange={this.handleOnChange}
      value={this.state.currentSliderValue}
      min={0}
      max={this.state.maxRange} />
      
    )
  } 
}

export default HistoryControl;

