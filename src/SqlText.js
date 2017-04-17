import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'react-codemirror/node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    this.state = {
      code: "-- Enter your SQL below, for instance:\n-- SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;\n",
      handleUserSql : this.props.handleUserSql
    }
    this.updateCode = this.updateCode.bind(this);
  }

  updateCode (currentSql) {
    this.setState( {code:currentSql} );
    this.state.handleUserSql(currentSql);
  }

  render() {
    var options = {
      lineNumbers: true,
      mode: 'sql'
    };
    return <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
  }
}

export default SQLText;
