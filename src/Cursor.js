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
    this.lastPlayMarker = 0;
  }

  componentDidMount() {
    this.registerCursorMotion(this.props.node);
  }

  registerCursorMotion() {
    window.onmousemove = (e) => this.recordCursorMotion(e);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.recording !== nextProps.recording) {
      if (nextProps.recording) {
        this.setState({cursorMotion:[]}); // reset cursor recording
      }
    } else if (nextProps.playingBack !== this.props.playingBack) {
      if (nextProps.playingBack) {
        this.startPlayback();
      } else {
        this.stopPlayback();
      }
    }
  }

  recordCursorMotion(e) {
    if (this.props.recording) {
      var now = new Date().getTime();
      var cursorPos = { x: e.pageX, y: e.pageY, t: now };
      this.setState({cursorMotion:[...this.state.cursorMotion, cursorPos]});
    }
  }

  stopPlayback = () => {
    clearInterval(this.state.playbackInterval);
    this.setState({playingBack:false});
    console.log('Stopped cursor playback');
  }

  getPosition = () => {
    if (this.state.playingBack) {
      //console.log('getPosition');
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
    //console.log('playback event fired.');
    this.setState({position: this.getPosition()});
  }

  startPlayback() {
    this.lastPlayMarker = new Date().getTime();
    this.setState( {playingBack:true, playbackInterval: setInterval(this.playbackEvent, 10) });
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

