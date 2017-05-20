import Terminal from '../public/xterm.js';
import '../public/addons/attach/attach.js';
import '../public/addons/fit/fit.js';
import React, { Component } from 'react';

//require('../public/addons/attach/attach');
//require('../public/addons/fit/fit');

class Xterm extends Component {
  constructor(props) {
    super(props);
    this.pid = undefined;
    this.replayStartTime = undefined;
    this.resetOnNextPlay = false;
    this.furthestPointReached = 0;
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
    this.constructTerminal();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.mode !== nextProps.mode) {
      switch (nextProps.mode) {
        case 'recording':
          if (this.props.mode === 'playback') {
            this.stopPlayback();
          }
          this.startRecording();
          break;
        case 'playback':
          if (this.props.mode === 'recording') {
            this.stopRecording();
          }
          this.startPlayback();
          break;
        case 'scrub':
          this.scrub(nextProps.scrubPoint);
          break;
        case 'configuration':
        default:
          if (this.props.mode === 'playback') {
            console.log('stopped xterm playback since went into config mode');
            this.stopPlayback();
          } else if (this.props.mode === 'recording') {
            console.log('stopped xterm recording since went into config mode');
            this.stopRecording();
          }
          break;
      }
    } else if ((this.props.mode === 'scrub') && (nextProps.scrubPoint !== this.props.scrubPoint)) {
      this.scrub(nextProps.scrubPoint);
    }
  }
  
  constructTerminal() {
    var terminalContainer = document.getElementById('terminal-container');
    const host = this.getXtermHost();

    // Clean terminal
    while (terminalContainer.children.length) {
      terminalContainer.removeChild(terminalContainer.children[0]);
    }
    this.term = new Terminal({
      cursorBlink: false,
      scrollback: 10000,
      tabStopWidth: 10
    });

    this.term.on('resize', (size) => {
      console.log('resizing');
      if (!this.pid) {
        return;
      }
      var cols = size.cols,
          rows = size.rows,
          url = `${host.httpHost}/terminals/${this.pid}/size?cols=${cols}&rows=${rows}`;

      fetch(url, {method: 'POST'});
    });

    this.term.open(terminalContainer, { focus: true } );

    this.term.viewport.viewportElement.addEventListener('scroll', function(e) {
      //console.log('scroll:', e);
      var target = e.target;
      var scrollTop = target.scrollTop;
      //console.log('scrollTop:', scrollTop);
      fetch(`${host.httpHost}/terminal/history/record/scroll`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({scrollTop:scrollTop})
      });
    });

    var initialGeometry = this.term.proposeGeometry();
    var cols = initialGeometry.cols
    var rows = initialGeometry.rows;

    fetch(`${host.httpHost}/terminals?cols=${cols}&rows=${rows}`, {method: 'POST'})
      .then(res => res.text()).then((pid) => { 
        this.term.fit();
        this.pid = pid;
        console.log('got pid:', pid);
        var socketUrl = host.socketUrl + pid;
        console.log('opening socket to :', socketUrl);
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = this.runRealTerminal.bind(this);
        this.socket.onmessage = this.interceptData.bind(this);
      });

  }
  
  interceptData(message) {
    if (this.firstMessageReceived === undefined) {
      this.firstMessageReceived = message.data;
    }
    if (this.props.mode === 'recording') {
      var now = new Date().getTime();
      var dataRecord = {
        type: 'data',
        data: message.data,
        timeOffset: now - this.recordingStartTime
      }
      this.history.push(dataRecord);
    }
  }
  
  runRealTerminal() {
    console.log('attaching...');
    this.term.attach(this.socket);
    this.term._initialized = true;
  }

  startRecording() {
    console.log('xterm started recording');
    this.history = [];
    this.lastPlayMarker = 0;
    this.recordingStartTime = new Date().getTime();
    this.furthestPointReached = 0;
  }

  stopRecording() {
    console.log('xterm stopped recording');
    this.resetOnNextPlay = true;
    this.historyIndex = 0;
  }

  writeHistoryRecordToXterm(historyItem, ignoreScrolling) {
    if (historyItem.type === 'data') {
      this.term.viewport.viewportElement.click();
      this.term.write(historyItem.data);
      //console.log('Data history:',historyItem);
    } else if (!ignoreScrolling && historyItem.type === 'scroll') {
      //console.log('Scrolling during playback to: ', historyItem.data);
      var scrollTop = historyItem.data;
      this.term.viewport.viewportElement.scrollTop = scrollTop;
    }
  }

  playHistory() {
    if (this.historyIndex === this.history.length) {
      console.log('Xterm playback done.');
      this.resetOnNextPlay = true;
      this.stopPlayback();
    } else {
      console.log('Playing xterm history');
      var nextAction = this.history[this.historyIndex];
      var timeDiff = new Date().getTime() - this.replayStartTime + this.furthestPointReached;
      if (timeDiff > nextAction.timeOffset) {
        var historyItem = this.history[this.historyIndex++];
        this.writeHistoryRecordToXterm(historyItem, false);
      }
    }
  }

  startPlayback() {
    var now = new Date().getTime();
    if (this.history.length > 0) {
      console.log('xterm history:', this.history);
      this.term.viewport.viewportElement.click();
      if (this.resetOnNextPlay) {
        this.term.reset();
        this.historyIndex = 0;
        this.term.viewport.viewportElement.click();
        this.term.write(this.firstMessageReceived);
      }
      this.resetOnNextPlay = false;
      this.replayStartTime = now;
      this.replayInterval = setInterval(this.playHistory.bind(this), 50);
    }
  }

  stopPlayback() {
    console.log('Stopping xterm playback');
    clearInterval(this.replayInterval);
  }
  
  jumpToScrubPoint() {
    if (this.historyIndex > this.stopHistory) {
      clearInterval(this.scrubInterval);
    } else {
      this.writeHistoryRecordToXterm(this.history[this.historyIndex++],true);
    }
  }

  scrub(scrubPoint) {
    console.log('xterm scrubbing to:', scrubPoint);
    if (this.history.length > 0) {
      var scan = 0;
      while ((this.history[scan].timeOffset < scrubPoint) && (scan < this.history.length - 1)) {
        ++scan;
      }
      if (this.history[scan].timeOffset > scrubPoint) {
        scan = Math.max(0, scan - 1);
      }
      this.historyIndex = 0;
      this.stopHistory = scan;
      this.resetOnNextPlay = false;
      this.term.reset();
      this.term.write(this.firstMessageReceived);
      this.furthestPointReached = scrubPoint;
      this.scrubInterval = setInterval(this.jumpToScrubPoint.bind(this), 1);
    }
  }
  
  render() {
    return  (
      <div>
        <div id="terminal-container"></div>
      </div>
    );
  } 
}

export default Xterm;
