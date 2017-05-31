import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { storeCursorInfo } from './actions/cursor';

// Serious hack to avoid setting up redux for now
let previousCursorInfo = undefined;

class Cursor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { x : 0, y : -100 },
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
    if (previousCursorInfo !== undefined) {
      this.cursorMotion = previousCursorInfo.cursorMotion.slice();
      this.cursorMotionIndex = previousCursorInfo.cursorMotionIndex;
      this.previousPlayDuration = previousCursorInfo.previousPlayDuration;
      this.setState({position: { x: this.cursorMotion[this.cursorMotionIndex].x, y: this.cursorMotion[this.cursorMotionIndex].x}});
      console.log('Restored cursor history');
    }
  }

  componentWillUnmount() {
    if (this.cursorMotion) {
      previousCursorInfo = { 
        cursorMotion: this.cursorMotion.slice(),
        cursorMotionIndex:  this.cursorMotionIndex,
        previousPlayDuration: this.previousPlayDuration
      }
      console.log('Saved cursor history.');
    }
  }

  saveCursorLocation() {
    window.onmousemove = (e) => { 
      this.cursorPosition = { x: e.pageX, y: e.pageY };
      console.log('saving cursor position');
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
          this.scrub(nextProps.scrubPoint);
          break;
        case 'configuration':
          if (this.props.mode === 'playback') {
            console.log('stopped mouse playback since went into config mode');
            this.stopPlayback();
          } else if (this.props.mode === 'recording') {
            console.log('stopped mouse recording since went into config mode');
            this.stopRecording();
          }
          break;
        default:
          break;
      }
    } else if (nextProps.mode === 'scrub' && nextProps.scrubPoint !== this.props.scrubPoint) {
      this.scrub(nextProps.scrubPoint); // repeated scrubbing by user, while already in "scrub" mode
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
    this.props.storeRecordedPart('cursorHistory', { cursorHistory: this.cursorMotion });
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

  scrub (scrubPoint) {
    console.log('cursor scrub, scrubPoint:', scrubPoint);
    if (this.cursorMotion.length > 0) {
      var scanAhead = 0;
      while ((this.cursorMotion[scanAhead].t < scrubPoint) && (scanAhead < this.cursorMotion.length - 1)) {
        //console.log('scanAhead:', scanAhead, 'playDuration:', playDuration, 'cursorMotionIndex:', this.cursorMotionIndex, 't:', this.cursorMotion[scanAhead].t);
        ++scanAhead;
      }
      if (this.cursorMotion[scanAhead].t > scrubPoint) {
        scanAhead = Math.max(0, scanAhead - 1);
      }
      this.cursorMotionIndex = scanAhead;
      this.previousPlayDuration = scrubPoint;
      this.mustResetOnNextPlay = false;
      var position = this.cursorMotion[this.cursorMotionIndex];
      // console.log('cursor scrub position:', position, 'from position:', this.cursorMotionIndex);
      this.setState({position: position});
    }
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

Cursor.propTypes = {
  storeCursorInfo: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    cursorInfo: state.position
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    storeCursorInfo: (cursorInfo) => dispatch(cursorAction(cursorInfo))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Cursor);

//export default Cursor;

