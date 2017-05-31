import React, { Component } from 'react';
import Range from './Range';

// Serious hack to avoid setting up redux for now
let previousSliderValue = undefined;

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
    if (this.state.currentSliderValue !== nextProps.newSliderValue) {
      this.setState({currentSliderValue: nextProps.newSliderValue});
    }
  }

  componentDidMount() {
    if (previousSliderValue) {
      this.setState({currentSliderValue: previousSliderValue});
    }
  }

  componentWillUnmount() {
    previousSliderValue = this.state.currentSliderValue;
  }
  
  handleOnChange(e) {
    var value = Number(e.target.value);
    this.setState({currentSliderValue:value});
    console.log('change complete, scrubbing to :', value);
    var percentage = value / this.state.maxRange;
    this.props.scrub(percentage, value);
  }

  handleOnChangeComplete(e) {
    var value = Number(e.target.value);
    console.log('change complete, scrubbing to :', value);
    // 
  }
  
  timeZeroPad(num) {
    const strNum = num.toString();
    return(strNum.length < 2 ? '0' + strNum : strNum);
  }

  formatPlayRecordTime(duration, proportion) {
    const currentTimeMilliseconds = duration * proportion;
    const currentTimeSeconds = currentTimeMilliseconds / 1000;
    const computedHour = Math.floor(currentTimeSeconds / 3600);
    const computedMinutes = Math.floor((currentTimeSeconds - (computedHour * 3600)) / 60);
    const computedSeconds = Math.floor(currentTimeSeconds - (computedMinutes * 60 + computedHour * 3600));
    const computedMilliseconds = (Math.floor(currentTimeMilliseconds - ((computedSeconds + computedMinutes * 60 + computedHour * 3600) * 1000)) / 10).toFixed(0);
    let displayMilliseconds = this.timeZeroPad(computedMilliseconds);
    let displaySeconds = this.timeZeroPad(computedSeconds);
    let displayMinutes = this.timeZeroPad(computedMinutes);
    let displayHour = this.timeZeroPad(computedHour);
    const currentTimeFormatted = `${displayHour}:${displayMinutes}:${displaySeconds}:${displayMilliseconds}`;
    return(currentTimeFormatted);    
  }

  computeCurrentRecordingTime() {
    return(this.formatPlayRecordTime(this.props.duration, 1.0));    
  }

  computeCurrentPlayTime() {
    return(this.formatPlayRecordTime(this.props.duration, this.state.currentSliderValue / this.state.maxRange));
  }
  
  render() {
    return (    
      <div className="historyControl"> 
      <Range className="scrubber"
      disabled={this.props.disabled}
      onChange={this.handleOnChange.bind(this)}
      onChangeComplete={this.handleOnChangeComplete.bind(this)}
      value={this.state.currentSliderValue}
      min={0}
      max={this.state.maxRange} />
      <div className="timeInfo">{ (this.props.duration === undefined ? "Time: --:--:--" : (this.props.mode === 'recording' ? "Record Time: " + this.computeCurrentRecordingTime() : "Play Time: " + this.computeCurrentPlayTime() ) ) }</div>
      </div>
    )
  } 
}

export default HistoryControl;

