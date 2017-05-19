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

  timeZeroPad(num) {
    const strNum = num.toString();
    return(strNum.length < 2 ? '0' + strNum : strNum);
  }

  computeCurrentTime = () => {
    if (this.props.duration === undefined) {
      return('--:--:--');
    }
    const currentTimeSeconds = (this.props.duration * (this.state.currentSliderValue / this.state.maxRange)) / 1000.0;
    const computedHour = Math.floor(currentTimeSeconds / 3600);
    const computedMinutes = Math.floor((currentTimeSeconds - (computedHour * 3600)) / 60);
    const computedSeconds = Math.floor(currentTimeSeconds - (computedMinutes * 60 + computedHour * 3600));
    let displayHour = this.timeZeroPad(computedHour);
    let displayMinutes = this.timeZeroPad(computedMinutes);
    let displaySeconds = this.timeZeroPad(computedSeconds);
    const currentTimeFormatted = `${displayHour}:${displayMinutes}:${displaySeconds}`;
    return(currentTimeFormatted);    
  }
  
  render() {
    return (    
      <div> 
      <Range className="scrubber"
      onChange={this.handleOnChange}
      value={this.state.currentSliderValue}
      min={0}
      max={this.state.maxRange} />
      <div className="historyTime">Time:{this.computeCurrentTime()}</div>
      </div>
    )
  } 
}

export default HistoryControl;

