import React, { Component } from 'react';
import Button from './Button';
import Cursor from './Cursor';
import RecordAudio from './RecordAudio';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import SimplerCodeMirror from './SimplerCodeMirror';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';
import * as SQL from 'sql.js';
import InitDb from './InitDb';
import Axios from 'axios';

class App extends Component {

  constructor(props) {
    super(props);

    var inlineDb = false;
    if (inlineDb) {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: new SQL.Database(),
        remoteDbFile: undefined,
        inlineDb: true,     // set this to true if queries can run as soon as the user types something
        recording: false,
        cursorMotion: [],
        cursorMotionIndex: 1,
        playingBack: false,
        audioRecording: false,
        audioPlayingBack: false,
        audioUrl: '',
        lastPlayMarker: 0
      };
    } else {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: undefined,
        remoteDbFile: 'parch_and_posey_4_20_17a.db',
        inlineDb: false,     // set this to true if queries can run as soon as the user types something
        recording: false,
        cursorMotion: [],
        cursorMotionIndex: 1,
        playingBack: false,
        audioRecording: false,
        audioPlayingBack: false,
        audioUrl: '',
        lastPlayMarker: 0
      };
    }
    this.handleUserQuery = this.handleUserQuery.bind(this);
    this.loadDbHandler = this.loadDbHandler.bind(this);
    this.saveUserQueryForEvaluator = this.saveUserQueryForEvaluator.bind(this);
  }

  componentDidMount() {
    this.registerCursorMotion();
  }

  registerCursorMotion() {
    this.cursorMotion = [];
    this.node.onmousemove = (e) => this.recordCursorMotion(e);
  }

  recordCursorMotion(e) {
    if (this.state.recording) {
      var now = new Date().getTime();
      var cursorPos = { x: e.pageX, y: e.pageY, t: now };
      this.setState({cursorMotion:[...this.state.cursorMotion, cursorPos]});
    }
  }

  startRecording() {
    this.cursorMotionIndex = -1;
    this.setState({cursorMotion: []});
    this.toggleAudioRecording();
    console.log('start mouse recording');
    this.setState({recording:true});
    Axios.get('http://localhost:3001/record/start');
  }

  stopRecording() {
    console.log('stop mouse recording');
    this.setState({recording:false});
    this.toggleAudioRecording();
    Axios.get('http://localhost:3001/record/stop');
  }

  playRecording() {
    console.log('play mouse and audio recording');
    var now = new Date().getTime();
    this.setState({recording:false, playingBack:!this.state.playingBack, cursorMotionIndex: 1, lastPlayMarker: now});
    this.state.audioObj.play();
  }

  toggleAudioRecording() {
    this.setState({audioRecording:!this.state.audioRecording});
  }

  saveAudioForPlayback(audioObj) {
    this.setState({audioObj:audioObj});
  }

  playAudioRecording() {
  }
  
  getPosition() {
    //console.log('app:getPosition');
    if (this.state.playingBack) {
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
    return({x:0,y:0});
  }

  loadDbHandler(uInt8Array) {
    this.setState({db: new SQL.Database(uInt8Array)});;
    console.log('Loaded big db file:', this.state.remoteDbFile);
  }

  handleUserQuery(newUserQuery) {
    //console.log('handleUserQuery: Setting user query to:', newUserQuery);
    this.setState({userQuery:newUserQuery});
  }

  saveUserQueryForEvaluator(newUserQuery) {
    //console.log('Saving query for later:', newUserQuery);
    this.setState({newUserQuery:newUserQuery});
  }

  sqlEvaluator() {
    this.setState({userQuery: this.state.newUserQuery});
  }

  render() {
    //console.log(this.state.userQuery);
    return (
      <div className="App" ref={(node) => {this.node = node;}} >
        {this.props.useHeader !== "0" ?
          <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h3>Pure Client SQL Evaluator</h3>
          </div>
          : null
        }
      <Cursor id="cursor" getPosition={() => this.getPosition() } / >
      <InitDb db={this.state.db} inlineDb={this.state.inlineDb} loadDbHandler={this.loadDbHandler} remoteDbFile={this.state.remoteDbFile} />
      <p className="App-intro"></p>
{
  //      <SQLText saveUserQueryForEvaluator={this.saveUserQueryForEvaluator} handleUserQuery={this.handleUserQuery} inlineDb={this.state.inlineDb} query={this.state.newUserQuery}/>
  // <Button click={() => this.sqlEvaluator()   } label={"Evaluate SQL (Ctrl-Enter)"} />
}
      <SimplerCodeMirror />
      <Button click={() => this.startRecording() } label={"Start recording"} />
      <Button click={() => this.stopRecording()  } label={"Stop recording"} />
      <Button click={() => this.playRecording()  } label={(this.state.playingBack ? 'Stop' : 'Start') + ' playback'} />
      <Button click={() => this.toggleAudioRecording()  } label={(this.state.audioRecording ? 'Stop' : 'Start') + ' audio recording'} />
{
//      <div className="SqlOutput"><SQLOutput userQuery={this.state.userQuery} db={this.state.db}/></div>
}
      <iframe className="shell" src="http://localhost:3001" />
      <asciinema-player src="/recording1.json"></asciinema-player>
      <RecordAudio audioRecording={this.state.audioRecording} saveAudioForPlayback={(audioUrl) => this.saveAudioForPlayback(audioUrl) } />
      </div>
    );
  }
}

export default App;
