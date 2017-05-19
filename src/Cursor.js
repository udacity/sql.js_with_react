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
    this.mustResetOnNextPlay = false;
    this.previousPlayDuration = 0;
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
        case 'scrub':
          this.scrub();
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
    var now = new Date().getTime();
    this.recordingStartTime = now;
    this.recordInterval = setInterval(this.recordCursorMotion, this.recordingSpeed);
  }

  stopRecording() {
    clearInterval(this.recordInterval);
    console.log('Stopped cursor playback, array size:', this.cursorMotion.length, 'contents of the array:', this.cursorMotion);
  }

  recordCursorMotion = (e) => {
    var latestMotion = this.cursorMotion.length - 1;
    var now = new Date().getTime();
    var recordingDuration = now - this.recordingStartTime;
    var cursorPositionClone = { x: this.cursorPosition.x, y:this.cursorPosition.y, t: recordingDuration };
    if (latestMotion === -1) {
      this.cursorMotion.push(cursorPositionClone);
    } else {
      var lastPosition = this.cursorMotion[latestMotion];
      if ((this.cursorPosition.x === lastPosition.x) && (this.cursorPosition.y === lastPosition.y)) {
        this.cursorMotion[latestMotion].t = recordingDuration; // just keep updating this record's time if the cursor hasn't moved
      } else {      
        this.cursorMotion.push(cursorPositionClone);
      }
    }
  }

  getPosition = () => {
    if (this.cursorMotion.length > 0) {
      //console.log('Cursor motion index:', this.cursorMotionIndex);
      var now = new Date().getTime();
      this.playDuration = now - this.state.playbackStartTime + this.previousPlayDuration;
      var scanAhead = this.cursorMotionIndex;
      while ((this.cursorMotion[scanAhead].t < this.playDuration) && (scanAhead < this.cursorMotion.length - 1)) {
        //console.log('scanAhead:', scanAhead, 'playDuration:', playDuration, 'cursorMotionIndex:', this.cursorMotionIndex, 't:', this.cursorMotion[scanAhead].t);
        ++scanAhead;
      }
      //console.log('getPosition: examining position', scanAhead);
      if (scanAhead === this.cursorMotion.length - 1) {
        this.stopPlaybackAndSetupForReset();
      }
      this.cursorMotionIndex = scanAhead;
      return(this.cursorMotion[this.cursorMotionIndex]);
    }

    return( { x:100,y:100 } );
  }

  playbackEvent = () => {
    this.setState({position: this.getPosition()});
  }

  startPlayback() {
    var now = new Date().getTime();
    if (this.mustResetOnNextPlay) {
      this.cursorMotionIndex = 0;
      this.playDuration = 0;
      this.previousPlayDuration = 0;
      this.mustResetOnNextPlay = false;
    }
    this.setState( { playbackStartTime: now, playbackInterval: setInterval(this.playbackEvent, this.recordingSpeed) });
  }
  
  stopPlayback = () => {
    clearInterval(this.state.playbackInterval);
    this.previousPlayDuration = this.playDuration;
  }

  stopPlaybackAndSetupForReset = () => {
    this.stopPlayback();
    this.mustResetOnNextPlay = true;
  }

  scrub = () => {
    this.cursorMotionIndex = 0;
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

