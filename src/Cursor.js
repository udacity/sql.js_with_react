import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

class Cursor extends Component {
  constructor(props) {
    super(props);
    this.getPosition = props.getPosition;
    this.state = {
      position: { x : 0, y : 0 }
    }
    this.setupPlaybackEvents();
  }

  setupPlaybackEvents() {
    var playbackEventFn = function() {
      //console.log('playback event fired.');
      this.setState({position: this.getPosition()});
    };
    this.playbackEventFn = playbackEventFn.bind(this);
    setInterval(this.playbackEventFn, 10);
  }
  
  render() {
    return (
      <FontAwesome name="cursor" className='fa-mouse-pointer cursor' 
      style={{
        left: this.state.position.x, 
        top: this.state.position.y, 
        textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'
      }} />
    );
  }
}

export default Cursor;

