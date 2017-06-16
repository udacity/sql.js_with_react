import React, { Component } from 'react';
import Button from './Button';
import SQLOutput from './SQLOutput';
import SQLText from './SqlText';
import logo from './udacity_logo.png';
import axios from 'axios';
const _ = require('lodash');
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';

class App extends Component {

  /* Props: query, viewId, useHeader
  */
  constructor(props) {
    super(props);
    this.state = {
      query: props.query
    }

    this.execQuery = this.execQuery.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.getQuery = this.getQuery.bind(this);
    this.setHistory = _.debounce(this.setHistory.bind(this), 3000, {maxWait:30000});
  }

  componentDidMount() {
    if (this.props.viewId) {
      this.getHistoricQuery(this.props.viewId);
    }
  }

  getHistoricQuery(viewId) {
    axios.get("/sql/api/history?viewId="+viewId)
      .then(response => {
        if (response && response.data && response.data.query !== undefined) {  // allow empty strings which are falsey
          this.setState({query: response.data.query});
          return Promise.resolve();
        } else {
          return Promise.reject({message:'failed to get historic query'});
        }
      });
  }

  setQuery(query) {
    this.setState({query: query});
    this.setHistory();
  }

  setHistory() {
    axios.post("/sql/api/history", {
      query: this.state.query,
      viewId: this.props.viewId
    })
  }

  getQuery() {
    return this.state.query;
  }

  execQuery() {
    axios.post("/sql/api/query", {
      query: this.state.query,
      viewId: this.props.viewId
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
