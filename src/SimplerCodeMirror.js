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
    this.exampleJs = '// loading... '
    this.scrubPoint = 0;
    this.postScrubAction = undefined;
  }

  componentDidMount() {
    fetch(`/addons/fit/fit.js`)
      .then(response => response.text() )
      .then(data => {
        var textAreaNode = this.findDOMNode(this.refs.textarea);
        this.cm = this.CodeMirror.fromTextArea(textAreaNode, this.props.options);
        var myVal = '';
        for (var i = 0; i < 20; ++i) {
          myVal += i + ' ' + i * 2 + "\n";
        }
        myVal = "abc\ndef\n";
        //this.cm.setValue(myVal);
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
    // Remove the first load up steps from the history so we can't undo too far
    this.lastPlayMarker = this.history.length - 1;
    this.scrub(0);
  }
  

  stopPlayback = () => {
    clearInterval(this.replayInterval);
    this.cm.setOption("readOnly", false );
    this.furthestPointReached = new Date().getTime() - this.replayStartTime;
  }
  
  
  resetToInitialContents() {
    var currentScroll = this.cm.getScrollInfo();
    this.cm.setValue(this.initialCmContents);
    this.cm.scrollTo(currentScroll.left, currentScroll.top);
  }
  
  runChange(historyItem) {
    var record = historyItem.record;
    console.log('playing back new text');
    //this.cm.doc.replaceRange(record.text, record.from,record.to, 'playback');
    var currentScroll = this.cm.getScrollInfo();
    var cursorInfo = this.cm.getCursor();
    this.cm.setValue(record.contents);
    this.cm.scrollTo(currentScroll.left, currentScroll.top);
    this.cm.setCursor(cursorInfo);
  }

  playHistory = () => {
    if (this.lastPlayMarker === this.history.length) {
      console.log('End CM playback.');
      this.lastPlayMarker = this.history.length - 1; // back off from the very end so we can scrub successfully
      this.resetOnNextPlay = true;
      this.stopPlayback();
    } else {
      var nextAction = this.history[this.lastPlayMarker];
      var now = new Date().getTime();
      var timeDiff = (now - this.replayStartTime) + this.furthestPointReached;
      if (timeDiff > nextAction.timeOffset) {
        window.cm.focus();
        var historyItem = this.history[this.lastPlayMarker];
        this.lastPlayMarker++;
        switch(historyItem.type) {
          case 'change':
            //console.log('change history during playback:',historyItem);
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
      }
    }
  }
  
  jumpToScrubPoint() {
    if (this.scrubStepCount > 0) {
      var historyItem = this.history[this.lastPlayMarker];
      if (historyItem.type === 'change') { // make sure you only redo change steps in the history
        this.runChange(historyItem);
      } else if (historyItem.type === 'scroll') {
        this.cm.scrollTo(historyItem.record.left, historyItem.record.top);
      } else if (historyItem.type === 'cursorActivity') {
        if (historyItem.record.position !== undefined) {
          this.cm.focus();
          this.cm.setCursor({line: historyItem.record.position.line, ch: historyItem.record.position.ch});
        }
      }
      (this.scrubDirection === 'forward') ? this.lastPlayMarker++ : this.lastPlayMarker--;
      if (this.scrubDirection === 'backward') {
        if (this.lastPlayMarker < this.firstChangeMarker) {
          this.resetToInitialContents();
        }
      }

      this.scrubStepCount--;
    }
    if (this.scrubStepCount === 0) {
      this.runChange(historyItem);
      clearInterval(this.scrubInterval);
      if (this.postScrubAction !== undefined) {
        console.log('Running postScrubAction');
        this.postScrubAction();
        this.postScrubAction = undefined;
      }
    }
  }

  scrub(scrubPoint) {
    console.log('SimplerCodeMirror scrubbing to:', scrubPoint);
    this.scrubPoint = scrubPoint;
    if (this.history.length > 0) {
      var scan = 0;
      while ((this.history[scan].timeOffset < scrubPoint) && (scan < this.history.length - 1)) {
        ++scan;
      }
      if (this.history[scan].timeOffset > scrubPoint) {
        scan = Math.max(0, scan - 1);
      }
      var scrubStepCountRaw = this.lastPlayMarker - scan;
      this.scrubDirection = (scrubStepCountRaw < 0 ? 'forward' : 'backward');
      this.scrubStepCount = Math.abs(scrubStepCountRaw);
      console.log('Setting up to adjust cm history scrubbed to position:', scan, 'numSteps:', this.scrubStepCount, 'direction:', this.scrubDirection);
      this.furthestPointReached = scrubPoint; // scrubPoint is a time value in ms
      this.scrubInterval = setInterval(this.jumpToScrubPoint.bind(this), 10);
    }
  }
  
  playbackRecording() {
    if (this.history.length > 0) {
      console.log('Before running redos, we have history:', this.cm.getHistory());
      this.cm.setOption("readOnly",  true );

      console.log('replaying changes at correct speed');
      this.cm.setCursor(this.initialCursorPos);
      this.replayStartTime = new Date().getTime();
      if (this.resetOnNextPlay) {
        this.postScrubAction = () => { this.replayInterval = setInterval(this.playHistory.bind(this),1) };
        this.scrub(0);
      } else {
        this.replayInterval = setInterval(this.playHistory.bind(this), 1);
      }
    }
  }

  recordAction = (cm, action) => {
    var history = cm.getHistory();
    if (this.props.mode === 'recording') {
      console.log('recordAction: action:', action, 'history:', history.done.length);
      var timeOffset = new Date().getTime() - this.recordingStartTime;
      var historyItem = {
        type: action.type,
        record: action.record,
        timeOffset: timeOffset
      }
      console.log('Recording codemirror history:', historyItem);
      /*
      if ((this.lastActionType !== undefined) && (this.lastActionType === 'change') && (action.type === 'cursorActivity')) {
        console.log('Not logging cursor activity due to change');
      } else {
        this.history.push(historyItem);
      }
      */
      this.history.push(historyItem);
      this.lastActionType = action.type;
    }
  }
  
  handleChange = (cm,action) => {
    console.log('Change:',action);
    if (action.origin === 'playback') {
      console.log('Ignoring this change since it came from a recorded playback.');
    } else {
      var cmAction = {
        type: 'change',
        record: {
          contents: this.cm.getValue(),
          origin: 'playback'
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
        this.recordAction(cm, { type: 'cursorActivity', record: { position: cm.getCursor() }});;
      } else {
        this.recordAction(cm, { type: 'selection', record: { line: minMaxLine, ch: minMaxCh }});;
        //console.log('Selected:', minMaxLine[0], ':', minMaxCh[0], 'to', minMaxLine[1], ':', minMaxCh[1]);
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
        <textarea ref='textarea' name='codemirror_textarea' defaultValue={this.exampleJs} autoComplete='off' />
      </div>
    );
  } 
}

export default SimplerCodeMirror;
