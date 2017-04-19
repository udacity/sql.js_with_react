import React, { Component } from 'react';

class SQLOutput extends Component {

  constructor(props) {
    super(props);

    if (props.db) {
      this.state = this.tryQuery(props.userQuery, undefined);
    } else {
      this.state = { results: [], query:'SELECT 1;' }
    }

  }
  
  tryQuery(newUserQuery, lastQuery) {
    if (!this.state.db) {
      return { results: [], query: 'SELECT 1;' }; // db handle is not available, return empty query results
    }
    console.log('tryQuery', newUserQuery, lastQuery);
    //console.log('Running sql:', newUserQuery);
    var previousQuery = lastQuery || newUserQuery;
    var newQueryResults;
    var queryResults = {
      query: previousQuery,
      results: this.props.db.exec(previousQuery),
      banner: 'SQL looks good! See the results below.'
    }
    var goodSql = true;
    try {
      newQueryResults = this.props.db.exec(newUserQuery);
      if (newQueryResults && newQueryResults.length > 0) {
        queryResults.results = newQueryResults;
        queryResults.query = newUserQuery;
      } else {
        goodSql = false;
      }
    }
    catch(err) {
      //console.log('Invalid sql, ignoring.');
      goodSql = false;
    }
    if (!goodSql) {
      queryResults.banner = 'Unparseable SQL, keep editing it until it works.';
    }
    return(queryResults);
  }

  runQueryAndUpdateState(newUserQuery) {
    var queryOutcome = this.tryQuery(newUserQuery, this.state.query);
    this.setState(queryOutcome);
  }
  
  componentWillReceiveProps(nextProps) {
    if ((nextProps.db !== undefined) && (this.state.db === undefined)) {
      this.setState({db:nextProps.db});
    }
    if (nextProps.userQuery !== this.state.query) {
      this.runQueryAndUpdateState(nextProps.userQuery, this.state.query);
    }
  }

  render() {
    var results = this.state.results;
    if (results.length === 0) {
      return(<div>no results yet</div>);
    }
    var rows = [];
    var i;
    var numCols = results[0].columns.length;
    var columnHeads = [];
    for (i = 0; i < numCols; ++i) {
      columnHeads.push(<th key={results[0].columns[i]}>{results[0].columns[i]}</th>);
    }
    var result;
    for (var i = 0; i < results[0].values.length; ++i) {
      result = results[0].values[i];
      //console.log(result);
      var cols = [];
      //var randomArray = new Uint32Array(numCols);
      //window.crypto.getRandomValues(randomArray);
      for (j = 0; j < numCols; ++j) {
        cols.push(<td key={j}>{result[j]}</td>);
      }
      //console.log(cols);
      rows.push(<tr key={i}>{cols}</tr>);
    }
    return ( 
      <div className="SqlOutput">
        <div className="Banner">{this.state.banner}</div>
        <table>
          <thead>
            <tr key="columnHeads">{columnHeads}</tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

export default SQLOutput;

