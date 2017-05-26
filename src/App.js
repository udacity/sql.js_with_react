// TODO:
//
// Restore the audio from the base64 data
// Persist the recording somewhere
// You can't actually track the cursor over the iframe or into the devtools panel as it no longer gets mousemove. 
//    Maybe instructors have to include some js that communicates that data back to a tracking server?
// Fork the code. Your version is whole separate panel
// Recording is additive, but you can start your recording all over again. 
// Tab panels https://github.com/reactjs/react-tabs/blob/master/README.md
// Some way to record DevTools and possibly interactions with the student React App: maybe we can do this with bookmarklet

// X Store recording as JSON into textarea
// X Save CM contents to file so we can actually preview the react project
// X React preview window with REACT-ND's sample project, with host:port shown. Use node proxy ? or maybe just my xterm server to transfer file saves over
// X If playing and you scrub, stop playing instantly
// X Display recorded time so far
// X Make CM rewind smarter by jumping right to the right spot rather than rewinding everything.
// X Cursor scrubbing
// X Make sure the CM replay always works right. sometimes it seems to miss selection if you go too fast. Or accelerate it to catch up if needed.
// X Scrub: calculate steps/ rewindable time scrubber
// X Cursor: make it adjust for lag/timeshift and don't repeat same positions
// X Switch to MS sampling in Cursor.js
// X mode=neutral
// X Current time display

import React, { Component } from 'react';
import update from 'react-addons-update';
import Button from './Button';
import PreviewPanel from './PreviewPanel';
import RecordStoragePanel from './RecordStoragePanel';
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
      mode: 'configuration', // mode is one of : 'configuration', 'recording', 'playback', 'scrub'
      recordingInfo: {},
      playbackInfo: {},
      sliderValue: 0,
      cmOptions: { historyEventDelay: 50 },
    };

    this.scrub = this.scrub.bind(this);
  }

  stopPlayback = () => {
    var now = new Date().getTime();
    var playedBackThisTime = now - this.state.playbackInfo.startTime;
    var newFurthestPointReached = this.state.playbackInfo.furthestPointReached + playedBackThisTime;
    const newState = update(this.state, {
      mode: { $set: 'configuration' },
      playbackInfo: { 
        $merge: {
          furthestPointReached: newFurthestPointReached
        }
      }
    });
    this.setState(newState);
    console.log('stopPlayback just set state');

    if (this.audioObj) {
      this.audioObj.pause();
    }
    clearInterval(this.state.playbackInfo.timer);
  }

  stopAndResetPlayback = () => {
    this.stopPlayback();
    const newState = update(this.state, {
      playbackInfo: { 
        $merge: {
          furthestPointReached: 0
        }
      }
    });
    this.setState(newState);
  }
  
  saveAudioForPlayback(audioObj) {
    this.audioObj = audioObj;
  }

  updateRecordingTimer() {
    var now = new Date().getTime();
    var duration = now - this.state.recordingInfo.recordingStartTime;
    const newState = update(this.state, {
      recordingInfo: { $merge: {
        duration: duration
      }}
    });
    this.setState(newState);
  }

  startRecording() {
    var now = new Date().getTime();
    const newState = update(this.state, {
      mode: { $set: 'recording' },
      recordedParts: { 
        $set: {
          cursorHistory: {},
          editorHistory: {},
          audioHistory:  {},
          xtermHistory:  {}
        }
      },
      recordingInfo: { $merge: {
        firstRecordingComplete: true,
        recordingStartTime: now,
        timer: setInterval(this.updateRecordingTimer.bind(this), 10)
      }}
    });
    this.setState(newState);

    console.log('Recording started.');
  }

  stopRecording() {
    var now = new Date().getTime();
    var duration = now - this.state.recordingInfo.recordingStartTime;

    const newState = update(this.state, {
      mode: { $set: 'configuration' },
      recordingInfo: { $merge: {
        duration: duration
      }},
      playbackInfo: { $merge: {
        furthestPointReached: 0
      }}                       
    });
    this.setState(newState);
    clearInterval(this.state.recordingInfo.timer);
    console.log('Recording stopped, duration:', duration);
  }

  startStopPlayback() {
    if (!this.state.recordingInfo.firstRecordingComplete) {
      return;
    }

    if (this.state.mode === 'playback') { // currently playing back, so stop it
      this.stopPlayback();
      return;
    }

    console.log('Playing recording.');
    var now = new Date().getTime();
    const newState = update(this.state, {
      mode: { $set: 'playback'},
      playbackInfo: {
        $merge: {
          startTime: now,
          timer: setInterval(this.updatePlaybackTimer.bind(this), 10)
        }
      }
    });
    this.setState(newState);
    this.audioObj.play();
  }

  storeRecordedPart(whichPart, data) {
    console.log('storeRecordedPart:', whichPart);
    console.log('now this.state.recordedParts:', this.state.recordedParts);

    this.setState((prevState) => ({
      recordedParts: Object.assign({}, prevState.recordedParts, {
        [whichPart]: data[whichPart]
      })
    }));
  }
  
  updatePlaybackTimer = () => {
    var now = new Date().getTime();
    var playedBackThisTime = now - this.state.playbackInfo.startTime;
    var totalPlayedBack = this.state.playbackInfo.furthestPointReached + playedBackThisTime;
    var newSliderValue = (( totalPlayedBack / this.state.recordingInfo.duration) * 1000);
    this.updateSlider(newSliderValue);
/*
    console.log('now:', now, 'startTime:', this.state.playbackInfo.startTime,
                'furthestPointReached:', this.state.playbackInfo.furthestPointReached,
                'playedBackThisTime:', playedBackThisTime, 
                'totalPlayedBack:', totalPlayedBack, 
                'newSliderValue:', newSliderValue,
                'duration:', this.state.recordingInfo.duration);
*/
    if (totalPlayedBack >= this.state.recordingInfo.duration) {
      console.log('Ending playback from updatePlaybackTimer');
      this.stopAndResetPlayback();
    }
  }

  // Scrub to a particular location
  scrub(value, sliderMaxRange) {
    this.stopPlayback();
    var percentagePlayed = this.state.recordingInfo.duration * (value / sliderMaxRange);
    if (this.state.recordingInfo.firstRecordingComplete !== undefined) {
      const newState = update(this.state, {
        mode: { $set: 'scrub' },
        sliderValue: { $set: value },
        playbackInfo: {
          $merge: {
            furthestPointReached: percentagePlayed
          }
        }
      });
      this.setState(newState);
      this.audioObj.currentTime = percentagePlayed / 1000;
      console.log('Scrubbed to time:',percentagePlayed, 'newState:', newState);
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
      {
       this.props.useHeader !== "0" ? <div className="App-header"><img src={logo} className="App-logo" alt="logo" /><h3>Session Recording Demo</h3></div> : null
      }

      <Cursor id="cursor" 
         mode={this.state.mode} 
         scrubPoint={this.state.playbackInfo.furthestPointReached} 
         storeRecordedPart={this.storeRecordedPart.bind(this)}
      />

      <SimplerCodeMirror 
        mode={this.state.mode} 
        scrubPoint={this.state.playbackInfo.furthestPointReached}
        options={this.state.cmOptions}
        storeRecordedPart={this.storeRecordedPart.bind(this)}      
      />

      <Xterm 
        mode={this.state.mode} 
        scrubPoint={this.state.playbackInfo.furthestPointReached}
      storeRecordedPart={this.storeRecordedPart.bind(this)}      
      />

      <div className="recordPlayControls">
      <div className="controlBtns">
      <Button 
      disabled={this.state.mode === 'playback' } 
      click={() => {(this.state.mode === 'recording' ? this.stopRecording() : this.startRecording() ) }}
      label={(this.state.mode === 'recording' ? <i className="fa fa-pause" ></i> : <i className="fa fa-square record-button" ></i>) } 
      title={`Make Recording`}
      />
      
      <Button 
      disabled={ this.state.mode === 'recording' || !this.state.recordingInfo.firstRecordingComplete } 
      click={() => this.startStopPlayback()  } 
      label={(this.state.mode === 'playback' ? <i className="fa fa-pause" ></i> : <i className="fa fa-play" ></i>) } 
      title={`Play/Stop`}
      />
      </div>
      <HistoryControl 
      mode={this.state.mode} 
      scrub={this.scrub}
      disabled={ this.state.mode === 'recording' || !this.state.recordingInfo.firstRecordingComplete } 
      duration={this.state.recordingInfo.duration} 
      updateSlider={this.updateSlider} 
      newSliderValue={this.state.sliderValue} 
      />
      </div>

      <RecordAudio 
      mode={this.state.mode} 
      saveAudioForPlayback={(audioUrl) => this.saveAudioForPlayback(audioUrl) } 
      storeRecordedPart={this.storeRecordedPart.bind(this)}      
      />

      <div className="lowerPanels">
      <PreviewPanel
      mode={this.state.mode} 
        scrubPoint={this.state.playbackInfo.furthestPointReached}
      />
      <RecordStoragePanel
        mode={this.state.mode} 
        recordedParts={this.state.recordedParts}
      />
      </div>

      </div>
    );
  }
}

export default App;
