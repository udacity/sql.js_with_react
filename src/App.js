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

    this.state = {
      userQuery: '',
      newUserQuery: undefined,
      db: undefined,
      smallDb: false     // set this to true if queries can run as soon as the user types something
    }
    this.handleUserQuery = this.handleUserQuery.bind(this);
    this.loadDbHandler = this.loadDbHandler.bind(this);
    this.saveUserQueryForEvaluator = this.saveUserQueryForEvaluator.bind(this);
    this.sqlEvaluator = this.sqlEvaluator.bind(this);

    // Set up simple, inline db (vs read from sqlite northwind dump)
    // this.setupDb();
    
  }
  
  setupDb() {
    this.setState({db: new SQL.Database()});
  }
  
  loadDbHandler(uInt8Array) {
    this.setState({db: new SQL.Database(uInt8Array)});;
    console.log('Loaded big db.');
  }

  handleUserQuery(newUserQuery) {
    //console.log('setting user query to:', newUserQuery);
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
      <div className="App-header">        
      <img src={logo} className="App-logo" alt="logo" />
      <h3>Pure Client SQL Evaluator</h3>
      <InitDb db={this.db} loadDbHandler={this.loadDbHandler} />
      </div>
      <p className="App-intro"></p>
      <SQLText saveUserQueryForEvaluator={this.saveUserQueryForEvaluator} handleUserQuery={this.handleUserQuery} smallDb={this.state.smallDb} />
      <Button sqlEvaluator={this.sqlEvaluator}>Evaluate SQL (Ctrl-Enter)</Button>
      <div className="SqlOutput">
      <SQLOutput db={this.state.db} userQuery={this.state.userQuery} />
      </div>
      </div>
    );
  }
}

export default App;
