import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import '../node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sqlText: "-- Enter your SQL below, for instance:\n-- Small db: SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;\n-- Big db: SELECT EmployeeEd, FirstName, LastName, Address,City,Region,PostalCode,Country,HomePhone,Extension FROM EMPLOYEES ORDER BY LastName limit 5;\nSELECT FirstName, LastName from EMPLOYEES ORDER BY LastName;",
      handleUserQuery : this.props.handleUserQuery,
      saveUserQueryForEvaluator: props.saveUserQueryForEvaluator,
      smallDb: props.smallDb
    }
    this.runQueryImmediately = false;
    this.updateSqlText = this.updateSqlText.bind(this);
    console.log('SQLText, smallDb:', this.state.smallDb);
  }

  componentWillMount() {
    if (!this.state.smallDb) {
      this.state.saveUserQueryForEvaluator(this.state.sqlText);
    }
  }

  updateSqlText (currentQuery) {
    //console.log('updateSqlText with currentQuery:', currentQuery);
    this.setState( {sqlText: currentQuery} );
    if (this.state.smallDb || this.runQueryImmediately) {
      //console.log('runNow:', currentQuery, this.state.smallDb);
      this.state.handleUserQuery(currentQuery);
      this.runQueryImmediately = false;
    } else {
      this.state.saveUserQueryForEvaluator(currentQuery);
    }
  }

  render() {
    var callUpdate = function(currentQuery) { this.runQueryImmediately = true; this.updateSqlText(currentQuery); };
    callUpdate = callUpdate.bind(this);
    var options = {
      lineNumbers: true,
      extraKeys: {
        'Ctrl-Enter': function(cm) { callUpdate(cm.getValue()); },
        'Alt-Enter' : function(cm) { callUpdate(cm.getValue()); },
        'Cmd-Enter' : function(cm) { callUpdate(cm.getValue()); }
      },
      mode: 'sql'
    };
    return <CodeMirror value={this.state.sqlText} onChange={this.updateSqlText} options={options} />
  }
}

export default SQLText;
