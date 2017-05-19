import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

class Cursor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x : 0, y : 0 },
    }
    this.recordInterval = undefined;
    this.cursorMotion = undefined;
    this.cursorMotionIndex = 0;
    this.cursorPosition = { x: 100, y: 100 };
    this.recordingSpeed = 50; // ms
  }

  componentDidMount() {
    this.saveCursorLocation();
  }

  saveCursorLocation() {
    window.onmousemove = (e) => { 
      this.cursorPosition = { x: e.pageX, y: e.pageY };
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.mode !== nextProps.mode) {
      switch (nextProps.mode) {
        case 'recording':
          if (this.props.mode === 'playback') {
            this.stopPlayback();
          }
          this.startRecording();
          break;
        case 'playback':
          if (this.props.mode === 'recording') {
            this.stopRecording();
          }
          this.startPlayback();
          break;
        case 'configuration':
          if (this.props.mode === 'playback') {
            this.stopPlayback();
          } else if (this.props.mode === 'recording') {
            this.stopRecording();
          }
          break;
        default:
          break;
      }
    }
  }

  startRecording() {
    this.cursorMotion = [];
    this.recordInterval = setInterval(this.recordCursorMotion, this.recordingSpeed);
  }

  stopRecording() {
    clearInterval(this.recordInterval);
    console.log('Stopped cursor playback, array size:', this.cursorMotion.length, 'contents of the array:', this.cursorMotion);
  }

  recordCursorMotion = (e) => {
    this.cursorMotion.push(this.cursorPosition);
  }

  getPosition = () => {
    if ((this.cursorMotion.length > 0) && (this.cursorMotionIndex < this.cursorMotion.length)) {
      //console.log('Cursor motion index:', this.cursorMotionIndex);
      return(this.cursorMotion[this.cursorMotionIndex++]);
    }

    this.stopPlayback();
    this.cursorMotionIndex = 0; // start cursor play over again
    return( { x:100,y:100 } );
  }

  playbackEvent = () => {
    this.setState({position: this.getPosition()});
  }

  startPlayback() {
    this.setState( { playbackInterval: setInterval(this.playbackEvent, this.recordingSpeed) });
  }
  
  stopPlayback = () => {
    clearInterval(this.state.playbackInterval);
  }

  render() {
    return (
      <div>
        <FontAwesome name="cursor" className='fa-mouse-pointer cursor' 
        style={{
          left: this.state.position.x, 
          top: this.state.position.y
        }}
      />
      <span className="cursor" style={{
        left: this.state.position.x, 
        top: this.state.position.y
      }}>X</span>
     </div>
    );
  }
}

export default Cursor;

