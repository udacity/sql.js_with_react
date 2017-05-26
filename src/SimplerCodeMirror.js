import React, { Component } from 'react';
import '../node_modules/codemirror/mode/javascript/javascript';

class SimplerCodeMirror extends Component {

  constructor(props) {
    super(props);
    this.CodeMirror = require('../node_modules/codemirror');
    this.ReactDOM = require('react-dom');
    this.findDOMNode = this.ReactDOM.findDOMNode;
    this.history = [];
    this.lastPlayMarker = 0;
    this.justStoppedRecording = false; // here because of a lag between when main button changes state, and when CM.blur() sends a cursorActivity event (ahead of state change)
    this.exampleJs = '// loading... '
    this.scrubPoint = 0;
    this.postScrubAction = undefined;
  }

  getXtermHost() {
    const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
    const xtermHost = 'localhost';
    const xtermPort = 3001;
    return {
      protocol,
      httpHost:   `${location.protocol}//${xtermHost}:${xtermPort}`,
      socketUrl : `${protocol}${xtermHost}:${xtermPort}/terminals/`,
    }
  }

  componentDidMount() {
    fetch(`/ListBooks.js`)
      .then(response => response.text() )
      .then(data => {
        var textAreaNode = this.findDOMNode(this.refs.textarea);
        this.cm = this.CodeMirror.fromTextArea(textAreaNode, this.props.options);
        this.cm.setValue(data);

        // Remove first setValue() from history so that can never be undone
        var history = this.cm.getHistory();
        history.done.shift();
        history.done.shift();
        this.cm.setHistory(history);

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
        case 'scrub':
          this.scrub(nextProps.scrubPoint);
          this.resetOnNextPlay = false;
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
    } else if ((this.props.mode === 'scrub') && (nextProps.scrubPoint !== this.scrubPoint)) {
      this.scrub(nextProps.scrubPoint);
    }
  }

  startRecording() {
    console.log('CM recording started');
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
    this.history = [];
    this.firstChangeMarker = undefined;
    this.initialCmContents = initialCmContents;
    this.initialCursorPos = initialCursorPos;
    this.recordingStartTime = now;
    this.furthestPointReached = 0;
  }

  stopRecording() {
    //var history = this.cm.getHistory();
    console.log('Stopped Cm recording, history:', this.history);
    this.props.storeRecordedPart('editorHistory', { editorHistory: this.history });
    // Remove the first load up steps from the history so we can't undo too far
    this.lastPlayMarker = this.history.length - 1;
    this.justStoppedRecording = true;
    this.rewindToBeginning();
  }
  

  stopPlayback = () => {
    console.log('STOPPING PLAYBACK');
    clearInterval(this.replayInterval);
    this.cm.setOption("readOnly", false );
    this.furthestPointReached = new Date().getTime() - this.replayStartTime;
  }
  
  rewindContentsToBeginning() {
    this.cm.setValue(this.initialCmContents);
    this.cm.scrollTo(0,0);
  }
  
  rewindToBeginning() {
    console.log('Rewinding to beginning.');
    this.rewindContentsToBeginning();
    this.furthestPointReached = 0;
    this.lastPlayMarker = 0;
  }
  
  runChange(historyItem) {
    var record = historyItem.record;
    console.log('runChange: Playing back change');
    //this.cm.doc.replaceRange(record.text, record.from,record.to, 'playback');
    //var currentScroll = this.cm.getScrollInfo();
    //var cursorInfo = this.cm.getCursor();
    this.cm.setValue(record.contents);
    this.cm.scrollTo(record.scrollInfo.left, record.scrollInfo.top);
    this.cm.setCursor(record.cursorInfo);
  }

  playHistory = () => {
    console.log('playHistory: lastPlayMarker=', this.lastPlayMarker);
    var nextAction = this.history[this.lastPlayMarker];
    var now = new Date().getTime();
    var timeDiff = (now - this.replayStartTime) + this.furthestPointReached;
    if (timeDiff > nextAction.timeOffset) {
      window.cm.focus();
      var historyItem = this.history[this.lastPlayMarker];
      this.lastPlayMarker++;
      switch(historyItem.type) {
        case 'change':
          console.log('change history during playback:',historyItem);
          this.runChange(historyItem);
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
      if (this.lastPlayMarker === this.history.length) {
        console.log('Ending CM playback.');
        this.lastPlayMarker = this.history.length - 1; // back off from the very end so we can scrub successfully if user chooses to
        this.resetOnNextPlay = true;
        this.stopPlayback();
      }
    }
  }
  
  scrub(scrubPoint) {
    console.log('SimplerCodeMirror scrubbing to:', scrubPoint);
    this.scrubPoint = scrubPoint;
    var lastChangeMarker = 0;
    if (this.history.length > 0) {
      var scan = 0;
      while ((this.history[scan].timeOffset < scrubPoint) && (scan < this.history.length - 1)) {
        ++scan;
        if (this.history[scan].type === 'change') {
          lastChangeMarker = scan;
        }
      }
      if (this.history[scan].timeOffset > scrubPoint) {
        scan = Math.max(0, scan - 1);
        if (this.history[scan].type === 'change') {
          lastChangeMarker = scan;
        }
      }
      this.lastPlayMarker = scan;
      this.furthestPointReached = scrubPoint; // scrubPoint is a time value in ms
      if (lastChangeMarker === 0) {
        this.rewindContentsToBeginning();
      } else {
        this.runChange(this.history[lastChangeMarker]);
      }
    }
  }
  
  playbackRecording() {
    if (this.history.length > 0) {
      console.log('Before playback, we have history:', this.history);
      this.cm.setOption("readOnly",  true );

      console.log('Replaying changes at normal speed.');
      this.cm.setCursor(this.initialCursorPos);
      this.replayStartTime = new Date().getTime();
      if (this.resetOnNextPlay) {
        this.rewindToBeginning();
        this.postScrubAction = () => { this.replayInterval = setInterval(this.playHistory.bind(this),1) };
        this.resetOnNextPlay = false;
      }
      this.replayInterval = setInterval(this.playHistory.bind(this), 1);
    }
  }

  recordAction = (cm, action) => {
    console.log('recordAction, this.props.mode:',  this.props.mode, 'this.justStoppedRecording:', this.justStoppedRecording);
    if ((this.props.mode === 'recording') && !this.justStoppedRecording) {
      var timeOffset = new Date().getTime() - this.recordingStartTime;
      var historyItem = {
        type: action.type,
        record: action.record,
        timeOffset: timeOffset
      }
      this.history.push(historyItem);
      console.log('Recorded action:', action, 'codemirror history:', historyItem);
    }
    this.justStoppedRecording = false;
  }
  
  handleChange = (cm,action) => {
    console.log('Change:',action);
    var host = this.getXtermHost();
    var url = `${host.httpHost}/terminal/persist`;
    var contents = this.cm.getValue();
    var persister = JSON.stringify({
      fileName: 'ListBooks.js',
      fileData: contents, 
      destination:'/Users/will/Documents/Development/nd-react/two/myreads/src'
    });

    fetch(url, {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:persister
    });
    if (action.origin === 'playback') {
      console.log('Ignoring this change since it came from a recorded playback.');
    } else if (action.origin === 'setValue') {
      console.log('Ignoring this change since it came from a recorded playback (setValue).');
    } else {
      var scrollInfo = this.cm.getScrollInfo();
      var cleanedScrollInfo = { top: scrollInfo.top, left: scrollInfo.left };
      var cursorInfo = this.cm.getCursor();
      var cleanedCursorInfo = { line: cursorInfo.line, ch: cursorInfo.ch };
      var cmAction = {
        type: 'change',
        record: {
          contents: this.cm.getValue(),
          origin: 'playback',
          scrollInfo: cleanedScrollInfo,
          cursorInfo: cleanedCursorInfo
        }
      }
      this.recordAction(cm,cmAction);
      if (this.firstChangeMarker === undefined) {
        this.firstChangeMarker = this.history.length - 1; // remember when first change happened;
      }
    }
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
      //console.log('selectionLength:', selectionLength);
      if (selectionLength === 0) {
        var cursorInfo = this.cm.getCursor();
        var cleanedCursorInfo = { line: cursorInfo.line, ch: cursorInfo.ch };
        this.recordAction(cm, { type: 'cursorActivity', record: { position: cleanedCursorInfo }});;
      } else {
        this.recordAction(cm, { type: 'selection', record: { line: minMaxLine, ch: minMaxCh }});;
        //console.log('Selected:', minMaxLine[0], ':', minMaxCh[0], 'to', minMaxLine[1], ':', minMaxCh[1]);
      }
    }
  }
  
  handleScroll = (cm,action) => {
    console.log('scrolled',action);
    var scrollInfo = cm.getScrollInfo();
    var cleanedScrollInfo = { top: scrollInfo.top, left: scrollInfo.left };
    this.recordAction(cm, { type: 'scroll', record: cleanedScrollInfo });;
  }

  render() {
    return  (
      <div className='editorDiv'>
        <textarea ref='textarea' name='codemirror_textarea' defaultValue={this.exampleJs} autoComplete='off' />
      </div>
    );
  } 
}

export default SimplerCodeMirror;
