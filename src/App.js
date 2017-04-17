import React, { Component } from 'react';
//import Button from './Button';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import './App.css';
import 'react-codemirror/node_modules/codemirror/lib/codemirror.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.SQL = window.SQL; // extremely hacky but not sure how else to get to sqljs object
    this.state = {
      userSql: 'SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary DESC'
    }
    this.handleUserSql = this.handleUserSql.bind(this);
  }
  
  handleUserSql(newSql) {
    console.log('setting user sql to:', newSql);
    this.setState({userSql:newSql});
  }

  render() {
    console.log(this.userSql);
    return (
      <div className="App">
      <div className="App-header">        
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Pure Client SQL Evaluator</h2>
      </div>
      <p className="App-intro"></p>
      <SQLText handleUserSql={this.handleUserSql}/>
      <div className="SqlOutput">
        <SQLOutput SQL={this.SQL} userSql={this.state.userSql} />
      </div>
      </div>
    );
  }
}

export default App;
