// TODO:
// Switch to MS sampling in Cursor.js
// mode=neutral
// rewind: calculate steps
// Rewindable time scrubber
// Recording is additive, but you can reset the whole thing
// Make sure the CM replay always works right. sometimes it seems to miss selection if you go too fast
// Tab panels
// Fork
// https://github.com/reactjs/react-tabs/blob/master/README.md
// React preview window
// Some way to record DevTools and possibly interactions with the student React App


import React, { Component } from 'react';
import Button from './Button';
import Cursor from './Cursor';
import RecordAudio from './RecordAudio';
import HistoryControl from './HistoryControl';
import SimplerCodeMirror from './SimplerCodeMirror';
import Xterm from './Xterm';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      recording: false,
      playingBack: false,
      firstRecordingComplete: false,
      sliderValue: 0,
      cmOptions: { historyEventDelay: 50 }
    };

  }

  endPlayback = () => {
    console.log('endPlayback');
    this.setState({playingBack: false});
    this.state.audioObj.pause();
    clearInterval(this.state.playbackTimer);
  }
  
  saveAudioForPlayback(audioObj) {
    this.setState({audioObj:audioObj});
  }

  startRecording() {
    var now = new Date().getTime();
    this.setState({recording:true, firstRecordingComplete: true, recordingStartTime: now});
    console.log('Recording started.');
  }

  stopRecording() {
    var now = new Date().getTime();
    var duration = now - this.state.recordingStartTime;
    this.setState({recording:false, recordingDuration: duration});
    console.log('Recording stopped, duration:', duration);
  }

  startStopPlayback() {
    if (!this.state.firstRecordingComplete) {
      return;
    }

    if (this.state.playingBack) {
      this.endPlayback();
      return;
    }

    console.log('Playing recording.');
    var now = new Date().getTime();
    this.setState({recording:false, playingBack: true, playbackStartTime: now, playbackTimer: setInterval(this.updatePlaybackTimer, 10) });
    this.state.audioObj.play();
  }

  updatePlaybackTimer = () => {
    var now = new Date().getTime();
    var currentPosition = now - this.state.playbackStartTime;
    var newSliderValue = (( currentPosition / this.state.recordingDuration) * 1000) + 1;
    this.updateSlider(newSliderValue);
    if (currentPosition >= this.state.recordingDuration + 1000) {
      console.log('ending playback from updatePlaybackTimer');
      this.endPlayback();
    }
  }

  updateSlider = (newSliderValue) => {
    this.setState({sliderValue: newSliderValue});
    //console.log('app.js: set sliderValue=', newSliderValue);
  }

  render() {
    //console.log(this.state.userQuery);
    return (
      <div className="App" ref={(node) => {this.node = node;}} >
      {this.props.useHeader !== "0" ?
       <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h3>Session Recording Demo</h3>
        </div>
                                               : null
      }
      <Cursor id="cursor" recording={this.state.recording} playingBack={this.state.playingBack} endAllPlayback={this.endAllPlayback} />

      <Button disabled={this.state.playingBack} click={() => {(this.state.recording ? this.stopRecording() : this.startRecording() ) }} 
      label={(this.state.recording ? <i className="fa fa-pause" ></i> : <i className="fa fa-square record-button" ></i>) } title={`Make Recording`}/>
      <Button disabled={this.state.recording || !this.state.firstRecordingComplete} click={() => this.startStopPlayback()  } label={(this.state.playingBack ? <i className="fa fa-pause" ></i> : <i className="fa fa-play" ></i>) } title={`Play recording`}/>

      <SimplerCodeMirror recording={this.state.recording} playingBack={this.state.playingBack} endAllPlayback={this.endAllPlayback} options={this.state.cmOptions}/>
      <Xterm recording={this.state.recording} playingBack={this.state.playingBack} endAllPlayback={this.endAllPlayback} />
      <HistoryControl recordingDuration={this.state.recordingDuration} updateSlider={this.updateSlider} sliderValue={this.state.sliderValue} />
      <RecordAudio recording={this.state.recording} saveAudioForPlayback={(audioUrl) => this.saveAudioForPlayback(audioUrl) } />
      {
        //      <div className="SqlOutput"><SQLOutput userQuery={this.state.userQuery} db={this.state.db}/></div>
      }
      </div>
    );
  }
}

export default App;
