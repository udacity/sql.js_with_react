import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import '../node_modules/codemirror/mode/sql/sql';

class SQLText extends Component {

  constructor(props) {
    super(props);
    var saveAndExec = function (query) {
      this.props.setQuery(query);
      this.props.execQuery();
    }.bind(this);
    this.cmOptions = {
      lineNumbers: true,
      extraKeys: {
        'Ctrl-Enter': function(cm) { saveAndExec(cm.getValue()); },
        'Alt-Enter' : function(cm) { saveAndExec(cm.getValue()); },
        'Cmd-Enter' : function(cm) { saveAndExec(cm.getValue()); }
      },
      mode: 'sql'
    };
  }

  render() {
    return <CodeMirror value={this.props.getQuery()} onChange={this.props.setQuery} options={this.cmOptions} />
  }
}

export default SQLText;
