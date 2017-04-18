import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'react-codemirror/node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sqlText: "-- Enter your SQL below, for instance:\n-- SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;\nSELECT FirstName, LastName from EMPLOYEES ORDER BY LastName;",
      handleUserQuery : this.props.handleUserQuery,
      saveUserQueryForEvaluator: props.saveUserQueryForEvaluator,
      smallDb: props.smallDb
    }
    this.updateSqlText = this.updateSqlText.bind(this);
    console.log('SQLText, smallDb:', this.state.smallDb);
  }

  componentWillMount() {
    if (!this.state.smallDb) {
      this.state.saveUserQueryForEvaluator(this.state.sqlText);
    }
  }

  updateSqlText (currentQuery, runNow ) {
    console.log('updateSqlText with currentQuery:', currentQuery);
    this.setState( {sqlText: currentQuery} );
    if (this.state.smallDb || runNow) {
      this.state.handleUserQuery(currentQuery);
    } else {
      this.state.saveUserQueryForEvaluator(currentQuery);
    }
  }

  render() {
    var callUpdate = function(currentQuery) { this.updateSqlText(currentQuery, true); };
    callUpdate = callUpdate.bind(this);
    var options = {
      lineNumbers: true,
      extraKeys: {
        'Ctrl-Enter': function(cm) { callUpdate(cm.getValue()); },
        'Alt-Enter' : this.updateSqlText,
        'Cmd-Enter' : this.updateSqlText
      },
      mode: 'sql'
    };
    return <CodeMirror value={this.state.sqlText} onChange={this.updateSqlText} options={options} />
  }
}

export default SQLText;
