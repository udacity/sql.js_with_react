import React, { Component } from 'react';

class SimplerCodeMirror extends Component {

  constructor(props) {
    super(props);
    this.CodeMirror = require('../node_modules/codemirror');
    this.ReactDOM = require('react-dom');
    this.findDOMNode = this.ReactDOM.findDOMNode;
    this.cm = 1;
  }

  click = (e) =>  {
    //console.log('We think sql is:', studentSql);
    console.log('we think cm is ', this.cm);
  }

  componentDidMount() {
    var textAreaNode = this.findDOMNode(this.refs.textarea);
    this.cm = this.CodeMirror.fromTextArea(textAreaNode, this.props.options);
    this.cm.on('change', this.handleChange);
    this.cm.on('cursorActivity', this.handleCursorActivity);
    this.cm.on('scroll', this.handleScroll);
  }

  handleChange(cm,action) {
    console.log('Change:');
    console.log(cm,action);
    console.log(cm.getCursor(), cm.getValue());
    //cm.setCursor({line:2, ch:2});
    var history = cm.getHistory();
    console.log('history:', history);
  }

  handleCursorActivity(cm) {
    var selections = cm.listSelections();
    var cursorPos = {line: selections[0].anchor.line, ch: selections[0].anchor.ch};
    console.log('Cursor activity:', cursorPos);
    var orderTwo = function(a,b) { return( a <= b ? [a,b] : [b,a]) };
    for (var selection of selections) {
      var minMaxCh = orderTwo(selection.anchor.ch,selection.head.ch);
      var minMaxLine = orderTwo(selection.anchor.line,selection.head.line);
      var selectionLength = Math.abs(minMaxCh[1] - minMaxCh[0]);
      if (selectionLength > 0) {
        console.log('Selected:', minMaxLine[0], ':', minMaxCh[0], 'to', minMaxLine[1], ':', minMaxCh[1]);
      }
    }
  }
  
  handleScroll(cm,action) {
    console.log('scrolled',action);
  }

  render() {
    return  (
      <div className='editorDiv'>
        <textarea ref='textarea' name='codemirror_textarea' defaultValue={"some text\nmore text\neven more text\n\n\n\n\n\n\n\n\nlast line"} autoComplete='off' />
      </div>
    );
  } 
}

export default SimplerCodeMirror;
