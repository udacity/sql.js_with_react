import React, { Component } from 'react';
import Button from './Button';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';
import * as SQL from 'sql.js';
import InitDb from './InitDb';

class App extends Component {

  constructor(props) {
    super(props);

    var inlineDb = false;
    if (inlineDb) {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: new SQL.Database(),
        remoteDbFile: undefined,
        inlineDb: true     // set this to true if queries can run as soon as the user types something
      };
    } else {
      this.state = {
        newUserQuery: "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;",
        db: undefined,
        remoteDbFile: 'parch_and_posey_4_20_17a.db',
        inlineDb: false     // set this to true if queries can run as soon as the user types something
      };
    }
    this.handleUserQuery = this.handleUserQuery.bind(this);
    this.loadDbHandler = this.loadDbHandler.bind(this);
    this.saveUserQueryForEvaluator = this.saveUserQueryForEvaluator.bind(this);
    this.sqlEvaluator = this.sqlEvaluator.bind(this);

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
      <div className="App">
        {this.props.useHeader !== "0" ?
          <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h3>Pure Client SQL Evaluator</h3>
          </div>
          : null
        }

        <InitDb db={this.state.db} inlineDb={this.state.inlineDb} loadDbHandler={this.loadDbHandler} remoteDbFile={this.state.remoteDbFile} />
        <p className="App-intro"></p>
        <SQLText saveUserQueryForEvaluator={this.saveUserQueryForEvaluator} handleUserQuery={this.handleUserQuery} inlineDb={this.state.inlineDb} query={this.state.newUserQuery}/>
        <Button sqlEvaluator={this.sqlEvaluator}>Evaluate SQL (Ctrl-Enter)</Button>
        <div className="SqlOutput">
          <SQLOutput userQuery={this.state.userQuery} db={this.state.db}/>
        </div>
      </div>
    );
  }
}

export default App;
