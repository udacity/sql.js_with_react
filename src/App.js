import React, { Component } from 'react';
import Button from './Button';
import Cursor from './Cursor';
import RecordAudio from './RecordAudio';
import HistoryControl from './HistoryControl';
//import SQLOutput from './SQLOutput';
//import SQLText from './SqlText';
import SimplerCodeMirror from './SimplerCodeMirror';
import Xterm from './Xterm';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';
import * as SQL from 'sql.js';
import InitDb from './InitDb';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inlineDb: props.inlineDb, 
      newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
      db: (props.inlineDb ? new SQL.Database() : undefined),
      remoteDbFile: (props.inlineDb ? 'parch_and_posey_4_20_17a.db': undefined),
      recording: false,
      playingBack: false,
      firstRecordingComplete: false,
      cursorMotion: [],
      cursorMotionIndex: 1,
      audioRecording: false,
      audioPlayingBack: false,
      audioUrl: '',
      xtermRecording: false,
      node: this.node
    };

    this.handleUserQuery = this.handleUserQuery.bind(this);
    this.loadDbHandler = this.loadDbHandler.bind(this);
    this.saveUserQueryForEvaluator = this.saveUserQueryForEvaluator.bind(this);
  }

  startRecording() {
    this.setState({recording:true, firstRecordingComplete: true, cursorMotionIndex: -1, cursorMotion: []});
    console.log('Recording started.');
  }

  stopRecording() {
    this.setState({recording:false});
    console.log('Recording stopped.');
  }

  playRecording() {
    if (!this.state.firstRecordingComplete) {
      return;
    }
    console.log('Playing recording.');
    this.setState({recording:false, playingBack: true});
    this.state.audioObj.play();
  }

  saveAudioForPlayback(audioObj) {
    this.setState({audioObj:audioObj});
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
      <Cursor id="cursor" recording={this.state.recording} playingBack={this.state.playingBack} />
      <InitDb db={this.state.db} inlineDb={this.state.inlineDb} loadDbHandler={this.loadDbHandler} remoteDbFile={this.state.remoteDbFile} />
      {
        //        <p className="App-intro"></p>
        //      <SQLText saveUserQueryForEvaluator={this.saveUserQueryForEvaluator} handleUserQuery={this.handleUserQuery} inlineDb={this.state.inlineDb} query={this.state.newUserQuery}/>
        // <Button click={() => this.sqlEvaluator()   } label={"Evaluate SQL (Ctrl-Enter)"} />
      }

      <SimplerCodeMirror />
      <Xterm recording={this.state.recording} playingBack={this.state.playingBack} />
      <HistoryControl />
      <RecordAudio recording={this.state.recording} saveAudioForPlayback={(audioUrl) => this.saveAudioForPlayback(audioUrl) } />
      <Button click={() => {(this.state.recording ? this.stopRecording() : this.startRecording() ) }} 
              label={(this.state.recording ? <i className="fa fa-pause" ></i> : <i className="fa fa-square record-button" ></i>) } title={`Make Recording`}/>
      <Button disabled={this.state.recording} click={() => this.playRecording()  } label={(this.state.playingBack ? <i className="fa fa-pause" ></i> : <i className="fa fa-play" ></i>) } title={`Play back recording`}/>
      {
        //      <div className="SqlOutput"><SQLOutput userQuery={this.state.userQuery} db={this.state.db}/></div>
      }
      </div>
    );
  }
}

export default App;
