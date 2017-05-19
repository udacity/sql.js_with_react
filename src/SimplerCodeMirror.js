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
      history: [],
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
        this.cm.setValue(data);
        this.cm.on('change', this.handleChange);
        this.cm.on('cursorActivity', this.handleCursorActivity);
        this.cm.on('scroll', this.handleScroll);
        window.cm = this.cm;
        window.cm.focus(); 
        var cursorInfo = this.cm.getCursor();
        console.log('at startup, cursorInfo:', cursorInfo);
      });
  }  

  componentWillReceiveProps(nextProps) {
    if (this.props.mode !== nextProps.mode) {
      switch (nextProps.mode) {
        case 'recording':
          this.startRecording(); // start recording over
          break;
        case 'playback':
          this.playbackRecording();
          break;
        case 'rewinding':
          this.rewind(this.props.scrubTime);
          break;
        case 'configuration':
          if (this.props.mode === 'recording') {
            this.stopRecording();
          } else if (this.props.mode === 'playback') {
            this.stopPlayback();
          }
          break;
        default:
          break;
      }
    }
  }

  stopRecording() {
    var history = this.cm.getHistory();
    //history.done.shift(); // remove first replacement of cm contents before storing history as "undone"
    //history.done.shift();
    history.done.reverse();
    history.undone.reverse();
    var reversedHistory = { done: history.undone, undone: history.done }; // save recording but as redo steps so that we can play it back
    this.setState( { playbackHistory: reversedHistory });
  }
  
  startRecording() {
    var initialCmContents = this.cm.getValue(); // save the editor contents right when we start recording so we can play back changes
    var now = new Date().getTime();
    this.cm.focus();
    var selection = this.cm.getSelection();
    var initialCursorPos;
    if (selection.length > 0) {
      var selections = this.cm.listSelections();
      initialCursorPos = { line: selections[0].anchor.line, ch: selections[0].anchor.ch };
      this.cm.setCursor(initialCursorPos);
    } else {
      initialCursorPos = this.cm.getCursor();
    }
    this.setState({ history: [], initialCmContents: initialCmContents, initialCursorPos: initialCursorPos, recordingStartTime: now });
  }

  stopPlayback = () => {
    clearInterval(this.state.replayInterval);
    this.cm.setOption("readOnly", false );
  }
  
  playHistory = () => {
    if (this.state.lastPlayMarker === this.state.history.length) {
      console.log('End xterm playback.');
      this.stopPlayback();
      this.setState({lastPlayMarker:0});
    } else {
      if (this.correctedChangeCount > 0) {
        console.log('doing undo number:', this.correctedChangeCount);
        this.cm.undo();
        this.correctedChangeCount--;
        if (this.correctedChangeCount === 0) {
          this.cm.redo();
          clearInterval(this.state.replayInterval);
          this.setState({replayStartTime: new Date().getTime(), replayInterval: setInterval(this.playHistory, 50)});
        }
      } else {
        var nextAction = this.state.history[this.state.lastPlayMarker];
        var timeDiff = new Date().getTime() - this.state.replayStartTime;
        if (timeDiff > nextAction.timeOffset) {
          var historyItem = this.state.history[this.state.lastPlayMarker];
          this.setState({lastPlayMarker : this.state.lastPlayMarker + 1});
          window.cm.focus();
          switch(historyItem.type) {
            case 'change':
              //console.log('change history during playback:',historyItem);
              this.cm.redo();
              break;
            case 'cursorActivity':
              //console.log('cm cursor activity during playback: ', historyItem.record);
              if (historyItem.record.position !== undefined) {
                this.cm.setCursor({line: historyItem.record.position.line, ch: historyItem.record.position.ch});
              }
              break;
            case 'scroll':
              //console.log('cm scroll activity during playback:', historyItem.record);
              this.cm.scrollTo(historyItem.record.left,historyItem.record.top);
              break;
            case 'selection':
              //console.log('cm selection activity during playback:', historyItem.record);
              this.cm.setSelection( 
                { ch: historyItem.record.ch[0], line: historyItem.record.line[0] },
                { ch: historyItem.record.ch[1], line: historyItem.record.line[1] }
              );
              break;
            default:
              break;
          }
        }
      }
    }
  }
  
  broken = () => {
    console.log('broken:', this.state);
  }
  
  playbackRecording = () => {
//    this.broken();
//    setTimeout(this.broken, 1000);
    console.log('Before running redos, we have history:', this.cm.getHistory());
    console.log('changeCount = ', this.state.changeCount);

    console.log('undoing all changes.');
    this.correctedChangeCount = this.state.changeCount + 1;
    this.cm.setOption("readOnly",  true );

    console.log('replaying changes at correct speed');
    this.cm.setCursor(this.state.initialCursorPos);
    this.setState({replayInterval: setInterval(this.playHistory.bind(this), 1) });
  }

  recordAction = (cm, action) => {
    var history = cm.getHistory();
    if (this.props.mode === 'recording') {
      console.log('recordAction: action:', action, 'history:', history.done.length);
      var timeOffset = new Date().getTime() - this.state.recordingStartTime;
      var historyItem = {
        type: action.type,
        record: action.record,
        timeOffset: timeOffset
      }
      console.log('Recording codemirror history:', historyItem);
      if ((this.state.lastActionType !== undefined) && (this.state.lastActionType === 'change') && (action.type === 'cursorActivity')) {
        console.log('Not logging cursor activity due to change');
      } else {
        this.setState({history: [...this.state.history, historyItem]});
      }
      this.setState({lastActionType: action.type});
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
    this.setState({changeCount: this.state.changeCount + 1});
    this.recordAction(cm,{ type: 'change', record: {} });
  }

  handleCursorActivity = (cm) => {
    //var cursorPos = {line: selections[0].anchor.line, ch: selections[0].anchor.ch};
    //console.log('Cursor activity:', cursorPos);
    //var history = cm.getHistory();
    //console.log('cursor activity, history:', history);
    var orderTwo = function(a,b) { return( a <= b ? [a,b] : [b,a]) };
    var selections = cm.listSelections();
    for (var selection of selections) {
      var minMaxCh = orderTwo(selection.anchor.ch,selection.head.ch);
      var minMaxLine = orderTwo(selection.anchor.line,selection.head.line);
      var selectionLength = Math.abs(minMaxCh[1] - minMaxCh[0]);
      console.log('selectionLength:', selectionLength);
      if (selectionLength === 0) {
        this.recordAction(cm, { type: 'cursorActivity', record: { position: cm.getCursor() }});;
      } else {
        this.recordAction(cm, { type: 'selection', record: { line: minMaxLine, ch: minMaxCh }});;
        console.log('Selected:', minMaxLine[0], ':', minMaxCh[0], 'to', minMaxLine[1], ':', minMaxCh[1]);
      }
    }
  }
  
  handleScroll = (cm,action) => {
    console.log('scrolled',action);
    var scrollRecord = cm.getScrollInfo();
    this.recordAction(cm, { type: 'scroll', record: scrollRecord });;
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
