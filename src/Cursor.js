import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

class Cursor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x : 0, y : 0 },
      cursorMotion: [],
      lastPlayMarker: 0
    }
  }

  componentDidMount() {
    this.registerCursorMotion(this.props.node);
  }

  registerCursorMotion() {
    window.onmousemove = (e) => this.recordCursorMotion(e);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.playingBack !== this.props.playingBack) {
      this.startPlayback();
    }
  }

  recordCursorMotion(e) {
    if (this.props.recording) {
      var now = new Date().getTime();
      var cursorPos = { x: e.pageX, y: e.pageY, t: now };
      this.setState({cursorMotion:[...this.state.cursorMotion, cursorPos]});
    }
  }

  getPosition() {
    if (this.props.playingBack) {
      console.log('getPosition');
      if ((this.state.cursorMotion.length > 0) && (this.state.cursorMotionIndex < this.state.cursorMotion.length)) {
        var now = new Date().getTime();
        //console.log('sending position back');
        var lastSpot = this.state.cursorMotion[this.state.cursorMotionIndex - 1];
        var thisSpot = this.state.cursorMotion[this.state.cursorMotionIndex];
        if (thisSpot.t - lastSpot.t < now - this.state.lastPlayMarker) {
          var checkState = this.state.cursorMotionIndex + 1;
          this.setState({cursorMotionIndex: this.state.cursorMotionIndex + 1, lastPlayMarker: now});
          if (checkState >= this.state.cursorMotion.length) {
            this.setState({playingBack:false});
            console.log('stopped playback');
            return({x:0, y:0});
          }
        }
        return(this.state.cursorMotion[this.state.cursorMotionIndex]);
      }
    }
    return({x:100,y:100});
  }

  startPlayback() {
    var now = new Date().getTime();
    this.setState({cursorMotionIndex: 1, lastPlayMarker: now});
    var playbackEventFn = () => {
      //console.log('playback event fired.');
      this.setState({position: this.getPosition()});
    };
    setInterval(playbackEventFn, 10);
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

