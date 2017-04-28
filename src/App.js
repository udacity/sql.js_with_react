import React, { Component } from 'react';
import Button from './Button';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import axios from 'axios';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      query: props.query || "-- Enter your SQL below, for instance:\nSELECT id, name,website from accounts ORDER BY name ASC;"
    }

    this.execQuery = this.execQuery.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.getQuery = this.getQuery.bind(this);
  }

  setQuery(query) {
    this.setState({query: query});
  }

  getQuery() {
    return this.state.query;
  }

  execQuery() {
    axios.post("http://localhost:3000/sql/api/query", {
      query: this.state.query
    }).then(response => {
      if (response.data) {
        this.setState({queryResult: response.data, queryError: undefined});
      } else {
        this.setState({queryResult: undefined, queryError: "no data in response"})
      }
    }).catch(err => {
      if (err.response && err.response.data && err.response.data.message) {
        console.log(err.response.data.message);
        this.setState({queryResult: err.response.data, queryError: err.response.data.message});
      } else {
        console.log(err.message)
        this.setState({queryResult: undefined, queryError: err.message});
      }
    });
  }

  render() {
    return (
      <div className="App">
        {this.props.useHeader !== "0" ?
          <div className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h3>Pure Client SQL Evaluator</h3>
          </div>
          : null
        }

        <SQLText query={this.state.query} setQuery={this.setQuery} execQuery={this.execQuery} getQuery={this.getQuery} />
        <Button onClick={this.execQuery}>Evaluate SQL (Ctrl-Enter)</Button>
        <div className="SqlOutput">
          <SQLOutput queryResult={this.state.queryResult} queryError={this.state.queryError}/>
        </div>
      </div>
    );
  }
}

export default App;
