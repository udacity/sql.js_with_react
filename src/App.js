import React, { Component } from 'react';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import './App.css';
import 'react-codemirror/node_modules/codemirror/lib/codemirror.css';
import * as SQL from 'sql.js';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      userQuery: 'SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;',
    }
    this.setupDb();
    this.handleUserQuery = this.handleUserQuery.bind(this);

  }
  
  setupDb() {
    this.db = new SQL.Database();

/*
    var filename = './first_db.sql';
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      console.log('OK: ' + filename);
      console.log(data)
    });
*/

    // Set up a simple database
    this.db.run("CREATE TABLE employees (id integer, name varchar(50), salary float);");
    // Insert three rows
    this.db.run("INSERT INTO employees VALUES (?,?,?), (?,?,?), (?,?,?)", [1,'will',111.55, 2,'sam', 222.25, 3,'mary', 333.99]);
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
      <SQLOutput db={this.db} userQuery={this.state.userQuery} />
      </div>
      </div>
    );
  }
}

export default App;
