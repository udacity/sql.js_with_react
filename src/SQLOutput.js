import React, { Component } from 'react';

class SQLOutput extends Component {

  constructor(props) {
    super(props);

    this.state = this.tryQuery(props.userQuery, undefined);

  }
  
  tryQuery(newUserQuery, lastQuery) {
    //console.log('Running sql:', newUserQuery);
    var previousQuery = lastQuery || newUserQuery;
    var newQueryResults;
    var queryResults = {
      query: previousQuery,
      results: this.props.db.exec(previousQuery),
      banner: 'SQL Looks good! See the results below.'
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
    if (nextProps.userQuery !== this.state.query) {
      this.runQueryAndUpdateState(nextProps.userQuery, this.state.query);
    }
  }

//  componentDidMount() {
//    this.runQuery(this.state.lastQuery);
//  }

  render() {
    var results = this.state.results;
    var rows = [];
    var i;
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

