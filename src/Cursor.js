import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

class Cursor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x : 0, y : 0 },
      cursorMotion: [],
    }
    this.cursorMotionIndex = 1;
    this.cursorPosition = { x: 0, y: 0 };
    this.lastPlayMarker = 0;
    this.recordingSpeed = 10; // ms
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
    if (this.props.recording !== nextProps.recording) {
      if (nextProps.recording) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    } else if (nextProps.playingBack !== this.props.playingBack) {
      if (nextProps.playingBack) {
        this.startPlayback();
      } else {
        this.stopPlayback();
      }
    }
  }


  startRecording() {
    this.setState({cursorMotion:[], recordInterval: setInterval(this.recordCursorMotion, this.recordingSpeed) } );
  }

  stopRecording() {
    clearInterval(this.state.recordInterval);
  }

  recordCursorMotion = (e) => {
    var now = new Date().getTime();
    var newPosition = { x: this.cursorPosition.x, y: this.cursorPosition.y, t: now };
    this.setState({cursorMotion:[...this.state.cursorMotion, newPosition]});
  }

  getPosition = () => {
    if (this.state.playingBack) {
      if ((this.state.cursorMotion.length > 0) && (this.cursorMotionIndex < this.state.cursorMotion.length)) {
        var now = new Date().getTime();
        //console.log('sending position back');
        var lastSpot = this.state.cursorMotion[this.cursorMotionIndex - 1];
        var thisSpot = this.state.cursorMotion[this.cursorMotionIndex];
        if (thisSpot.t - lastSpot.t < now - this.lastPlayMarker) {
          var checkState = this.cursorMotionIndex + 1;
          this.cursorMotionIndex++;
          this.lastPlayMarker = now;
          if (checkState >= this.state.cursorMotion.length) {
            this.cursorMotionIndex = 1; // start cursor play over again
            this.stopPlayback();
            return({x:0, y:0});
          }
        }
        return(this.state.cursorMotion[this.cursorMotionIndex]);
      }
    }
    return({x:100,y:100});
  }

  playbackEvent = () => {
    this.setState({position: this.getPosition()});
  }

  startPlayback() {
    this.lastPlayMarker = new Date().getTime();
    this.setState( {playingBack:true, playbackInterval: setInterval(this.playbackEvent, this.recordingSpeed) });
  }
  
  stopPlayback = () => {
    clearInterval(this.state.playbackInterval);
    this.setState({playingBack:false});
    console.log('Stopped cursor playback');
  }

  render() {
    return (
      <FontAwesome name="cursor" className='fa-mouse-pointer cursor' 
      style={{
        left: this.state.position.x, 
        top: this.state.position.y
      }} />
    );
  }
}

export default Cursor;

