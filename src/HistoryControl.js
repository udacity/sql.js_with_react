import React, { Component } from 'react';
// import 'react-rangeslider/lib/index.css';
// https://www.npmjs.com/package/range-input-react
// https://github.com/Mapker/react-range-input
// NOT to be confused with react-input-range!!
import Range from 'range-input-react';

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

  handleOnChange = (e) => {
    var value = Number(e.target.value);
    this.setState({currentSliderValue:value});
    this.props.scrub(value);
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

