// TODO:
//
// Tab panels https://github.com/reactjs/react-tabs/blob/master/README.md
// Fork the moment you try to make a change: prompt the user, "do you want to fork?"
// Fork the code. Your version is whole separate panel
// Restore the audio from the base64 data
// Persist the recording somewhere
// You can't actually track the cursor over the iframe or into the devtools panel as it no longer gets mousemove. 
//    Maybe instructors have to include some js that communicates that data back to a tracking server?
// Recording is additive, but you can start your recording all over again. 
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
import Tabs from 'react-simpletabs';
import '../node_modules/react-simpletabs/lib/react-simpletabs.css';
import Layout from './Layout';
import './App.css';
import './CM.css';
import '../node_modules/codemirror/lib/codemirror.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mode: 'configuration', // mode is one of : 'configuration', 'recording', 'playback', 'scrub'
      recordingInfo: {},
      playbackInfo: {},
      sliderValue: 0,
      cmOptions: { historyEventDelay: 50, lineNumbers:true },
    };

    this.usage = 'instructor'; // hack
    this.scrub = this.scrub.bind(this);
  }

  componentDidMount() {
    console.log('App mount.');
  }

  componentWillUnmount() {
    console.log('App unmount.');
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
    //console.log('stopPlayback just set state');

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
  
  storeInstructorCmRecord(record) {
    console.log('storeInstructorCmRecord');
    const newState = update(this.state, {
      cmRecord: { $set: record }
    });
    this.setState(newState);
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
  scrub(percentage, sliderValue) {
    this.stopPlayback();
    var percentagePlayed = this.state.recordingInfo.duration * percentage;
    if (this.state.recordingInfo.firstRecordingComplete !== undefined) {
      const newState = update(this.state, {
        mode: { $set: 'scrub' },
        sliderValue: { $set: sliderValue },
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

  setUsage(newUsage) {
    this.usage = newUsage;
  }
  
  getUsage() {
    return(this.usage);
  }

  handleTabsBeforeChange(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('handleTabsBeforeChange, selectedIndex:', selectedIndex);
    if (selectedIndex === 2) {
      this.setUsage('student'); // hack
    } else if (selectedIndex === 1) { // switching back to instructor tab
      this.setUsage('instructor');
      if (this.state.recordingInfo.firstRecordingComplete !== undefined) {
        var percentage = this.state.playbackInfo.furthestPointReached / this.state.recordingInfo.duration;
        this.scrub(percentage);
      }
    }
  }
  
  render() {
    //console.log(this.state.userQuery);
    var layoutPackage = {
      data: {
        mode: this.state.mode,
        scrubPoint: this.state.playbackInfo.furthestPointReached,
        firstRecordingComplete: this.state.recordingInfo.firstRecordingComplete,
        recordedParts: this.state.recordedParts,
        cmOptions: this.state.cmOptions,
        duration: this.state.recordingInfo.duration,
        sliderValue: this.state.sliderValue,
        cmRecord: this.state.cmRecord
      },
      functions: {
        storeRecordedPart: this.storeRecordedPart.bind(this),
        storeInstructorCmRecord: this.storeInstructorCmRecord.bind(this),
        startRecording: this.startRecording.bind(this),
        stopRecording: this.stopRecording.bind(this),
        startStopPlayback: this.startStopPlayback.bind(this),
        scrub: this.scrub.bind(this),
        updateSlider: this.updateSlider.bind(this),
        saveAudioForPlayback: this.saveAudioForPlayback.bind(this),
        getUsage: this.getUsage.bind(this),
      }
    };

    return (
      <div className="App" ref={(node) => {this.node = node;}} >

      <Tabs onBeforeChange={this.handleTabsBeforeChange.bind(this)} >
      <Tabs.Panel title='Instructor'>
      <Layout package={layoutPackage} usage='instruction' />
      </Tabs.Panel>

      <Tabs.Panel title='Your Fork'>
      <Layout package={layoutPackage} usage='student' />
      </Tabs.Panel>

      </Tabs>

      </div>
    );
  }
}

export default App;
