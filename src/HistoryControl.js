import React, { Component } from 'react';
import Range from './Range';

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

  handleOnChange(e) {
    var value = Number(e.target.value);
    this.setState({currentSliderValue:value});
  }

  handleOnChangeComplete(e) {
    var value = Number(e.target.value);
    console.log('change complete, scrubbing to :', value);
    this.props.scrub(value, this.state.maxRange);
  }
  
  timeZeroPad(num) {
    const strNum = num.toString();
    return(strNum.length < 2 ? '0' + strNum : strNum);
  }

  computeCurrentTime = () => {
    if (this.props.duration === undefined) {
      return('--:--:--');
    }
    const currentTimeMilliseconds = this.props.duration * (this.state.currentSliderValue / this.state.maxRange);
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
  
  render() {
    return (    
      <div> 
      <Range className="scrubber"
      disabled={this.props.disabled}
      onChange={this.handleOnChange.bind(this)}
      onChangeComplete={this.handleOnChangeComplete.bind(this)}
      value={this.state.currentSliderValue}
      min={0}
      max={this.state.maxRange} />
      <div className="historyTime">&nbsp;Time:&nbsp;{this.computeCurrentTime()}</div>
      </div>
    )
  } 
}

export default HistoryControl;

