import React, { Component } from 'react';

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
      <div className="cursor" style={{left:this.state.position.x, top:this.state.position.y}}>Cursor</div>
    );
  }
}

export default Cursor;
