import React, { Component } from 'react';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import './App.css';
import 'react-codemirror/node_modules/codemirror/lib/codemirror.css';

class App extends Component {

  constructor(props) {
    super(props);
    //this.SQL = window.SQL; // extremely hacky but not sure how else to get to sqljs object
    this.state = {
      userQuery: 'SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;',
    }
    this.handleUserQuery = this.handleUserQuery.bind(this);
  }
  
  handleUserQuery(newUserQuery) {
    //console.log('setting user query to:', newUserQuery);
    this.setState({userQuery:newUserQuery});
  }


  render() {
    //console.log(this.state.userQuery);
    return (
      <div className="App">
      <div className="App-header">        
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Pure Client SQL Evaluator</h2>
      </div>
      <p className="App-intro"></p>
      <SQLText handleUserQuery={this.handleUserQuery}/>
      <div className="SqlOutput">
      <SQLOutput userQuery={this.state.userQuery} />
      </div>
      </div>
    );
  }
}

export default App;
