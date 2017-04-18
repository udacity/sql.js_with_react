import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'react-codemirror/node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    this.state = {
      code: "-- Enter your SQL below, for instance:\n-- SELECT id,name,salary, round(salary) AS rounded_salary FROM employees ORDER BY salary ASC;\n",
      handleUserQuery : this.props.handleUserQuery
    }
    this.updateCode = this.updateCode.bind(this);
  }

  updateCode (currentQuery) {
    this.setState( {code:currentQuery} );
    this.state.handleUserQuery(currentQuery);
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
