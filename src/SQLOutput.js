//import * as SQL from 'sqljs';
//import SQL from 'sqljs';
import React, { Component } from 'react';

class SQLOutput extends Component {

  constructor(props) {
    super(props);
    this.db = new this.props.SQL.Database();

    // Set up a simple database
    this.db.run("CREATE TABLE employees (id integer, name varchar(50), salary float);");
    // Insert three rows
    this.db.run("INSERT INTO employees VALUES (?,?,?), (?,?,?), (?,?,?)", [1,'will',111.55, 2,'sam', 222.25, 3,'mary', 333.99]);

    this.lastSql = props.userSql;

  }
  
  render() {
    console.log('Running sql:', this.props.userSql);
    var results;
    var goodSql = true;
    try {
      results = this.db.exec(this.props.userSql);
    }
    catch(err) {
      console.log('invalid sql, using last good cmd');
      goodSql = false;
      results = this.db.exec(this.lastSql);
    }
    console.log(results);
    if (results.length === 0) {
      goodSql = false;
      results = this.db.exec(this.lastSql);
    }
    var rows = [];
    var i;
    if (goodSql) {
      this.lastSql = this.props.userSql;
    }
    var numCols = results[0].columns.length;
    var columnHeads = [];
    for (i = 0; i < numCols; ++i) {
      columnHeads.push(<th key={results[0].columns[i]}>{results[0].columns[i]}</th>);
    }
    for (var result of results[0].values) {
      //console.log(result);
      var cols = [];
      for (i = 0; i < numCols; ++i) {
        cols.push(<td key={results[0].columns[i] + result[i]}>{result[i]}</td>);
      }
      //console.log(cols);
      rows.push(<tr key={result[0]}>{cols}</tr>);
    }
    return ( 
      <table>
        <thead>
          <tr key="columnHeads">{columnHeads}</tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

export default SQLOutput;

