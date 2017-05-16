import React, { Component } from 'react';
import '../node_modules/codemirror/mode/javascript/javascript';

class SimplerCodeMirror extends Component {

  constructor(props) {
    super(props);
    this.CodeMirror = require('../node_modules/codemirror');
    this.ReactDOM = require('react-dom');
    this.findDOMNode = this.ReactDOM.findDOMNode;
    this.cm = 1;
    this.state = {
      cmHistory: [],
      lastPlayMarker: 0,
      changeCount: 0,
      exampleJs: '// loading... '
    }
  }


  click = (e) =>  {
    //console.log('We think sql is:', studentSql);
    console.log('we think cm is ', this.cm);
  }

  componentDidMount() {
    fetch(`/addons/fit/fit.js`)
      .then(response => response.text() )
      .then(data => {
        var textAreaNode = this.findDOMNode(this.refs.textarea);
        this.cm = this.CodeMirror.fromTextArea(textAreaNode, this.props.options);
        //this.cm.setValue(data);
        this.cm.on('change', this.handleChange);
        this.cm.on('cursorActivity', this.handleCursorActivity);
        this.cm.on('scroll', this.handleScroll);
        var cursorInfo = this.cm.getCursor();
        console.log('at startup, cursorInfo:', cursorInfo);
      });
  }  

  componentWillReceiveProps(nextProps) {
    if (this.props.recording !== nextProps.recording) {
      if (nextProps.recording) {
        this.startRecording(); // start recording over
      } else {
        this.stopRecording();
      }
    } else if (this.props.playingBack !== nextProps.playingBack) {
      if (nextProps.playingBack) {
        this.playbackRecording();
      }
    }
  }

  stopRecording() {
    var cmHistory = this.cm.getHistory();
    //cmHistory.done.shift(); // remove first replacement of cm contents before storing history as "undone"
    //cmHistory.done.shift();
    cmHistory.done.reverse();
    cmHistory.undone.reverse();
    var reversedHistory = { done: cmHistory.undone, undone: cmHistory.done }; // save recording but as redo steps so that we can play it back
    this.setState( { playbackHistory: reversedHistory });
  }
  
  startRecording() {
    var initialCmContents = this.cm.getValue(); // save the editor contents right when we start recording so we can play back changes
    this.setState({ cmHistory: [], initialCmContents: initialCmContents });
  }

  playbackRecording() {
    console.log('Before running redos, we have history:', this.cm.getHistory());
    this.cm.setValue(this.state.initialCmContents);
    this.cm.clearHistory();
    console.log('Going to use this playbackHistory:', this.state.playbackHistory);
    this.cm.setHistory(this.state.playbackHistory);
    console.log('changeCount = ', this.state.changeCount);
/*
    for (var i = 0; i < this.state.changeCount; ++i) {
      console.log('doing undo number:', i);
      this.cm.undo();
    }
*/
    for (var j = 0; j < this.state.changeCount; ++j) {
      console.log('doing redo number:', j);
      this.cm.redo();
    }
  }

  recordAction(cm, action) {
    var history = cm.getHistory();
    if (this.props.recording) {
      console.log('recordAction: action:', action, 'history:', history.done.length);
      var now = new Date().getTime();
      var cmHistoryItem = {
        type: action.type,
        record: action.record,
        t: now
      }
      console.log('Recording cm history:', cmHistoryItem);
      this.setState({cmHistory: [...this.state.cmHistory, cmHistoryItem]});
    }
  }
  
  handleChange = (cm,action) => {
    //console.log('Change:');
    //console.log(cm,action);
    //console.log(cm.getCursor(), cm.getValue());
    //cm.setCursor({line:2, ch:2});
    //var history = cm.getHistory();
    //console.log('onchange, history:', history);
    // var bigJs = "// This is a for loop in Javascript\n// Here's somre more comments\n// And even more comments\n// Wowo\nfor (var i = 0; i < 10; ++i) {\n  console.log(i);\n}\n"
    //console.log('recording =', this.props.recording);
    window.cm = cm;
    this.setState({changeCount: this.state.changeCount + 1});
    this.recordAction(cm,{ type: 'change', record: {} });
  }

  handleCursorActivity = (cm) => {
    //var cursorPos = {line: selections[0].anchor.line, ch: selections[0].anchor.ch};
    //console.log('Cursor activity:', cursorPos);
    //var history = cm.getHistory();
    //console.log('cursor activity, history:', history);
    this.recordAction(cm, { type: 'cursorActivity', record: { position: cm.getCursor() }});;
    var orderTwo = function(a,b) { return( a <= b ? [a,b] : [b,a]) };
    var selections = cm.listSelections();
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
        <textarea ref='textarea' name='codemirror_textarea' defaultValue={this.state.exampleJs} autoComplete='off' />
      </div>
    );
  } 
}

export default SimplerCodeMirror;
