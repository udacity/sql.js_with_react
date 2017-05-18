import Terminal from '../public/xterm.js';
import '../public/addons/attach/attach.js';
import '../public/addons/fit/fit.js';
import React, { Component } from 'react';

//require('../public/addons/attach/attach');
//require('../public/addons/fit/fit');

class Xterm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history:[],
      historyIndex: undefined,
      replayInterval: undefined,
      replayStartTime: undefined,
      resetOnNextPlay:false,
      pid: undefined
    }
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
          this.resetRecording();
          break;
        case 'playback':
          this.startPlayback();
          break;
        case 'configuration':
        default:
          if (this.props.mode === 'playback') {
            this.stopPlayback();
          }
          break;
      }
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
      if (!this.state.pid) {
        return;
      }
      var cols = size.cols,
          rows = size.rows,
          url = `${host.httpHost}/terminals/${this.state.pid}/size?cols=${cols}&rows=${rows}`;

      fetch(url, {method: 'POST'});
    });

    this.term.open(terminalContainer, { focus: true } );

    this.term.viewport.viewportElement.addEventListener('scroll', function(e) {
      //console.log('scroll:', e);
      var target = e.target;
      var scrollTop = target.scrollTop;
      console.log('scrollTop:', scrollTop);
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
        this.setState({pid: pid});
        console.log('got pid:', pid);
        var socketUrl = host.socketUrl + pid;
        console.log('opening socket to :', socketUrl);
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = this.runRealTerminal;
      });

    this.resetRecording();

  }
  
  runRealTerminal = () => {
    console.log('attaching...');
    this.term.attach(this.socket);
    this.term._initialized = true;
  }

  resetRecording() {
    this.setState({history:[], historyIndex: 0});
    const host = this.getXtermHost();
    fetch(`${host.httpHost}/terminal/history/reset`);
  }

  stopPlayback() {
    console.log('Stopping xterm playback');
    clearInterval(this.state.replayInterval);
  }
  
  playHistory = () => {
    if (this.state.historyIndex === this.state.history.length) {
      console.log('Xterm playback done.');
      this.setState({resetOnNextPlay: true});
      this.stopPlayback();
    } else {
      console.log('Playing xterm history');
      var nextAction = this.state.history[this.state.historyIndex];
      var timeDiff = new Date().getTime() - this.state.replayStartTime;
      if (timeDiff > nextAction.timeOffset) {
        var historyItem = this.state.history[this.state.historyIndex++];
        if (historyItem.type === 'data') {
          this.term.viewport.viewportElement.click();
          this.term.write(historyItem.data);
          console.log('Data history:',historyItem);
        } else if (historyItem.type === 'scroll') {
          console.log('Scrolling during playback to: ', historyItem.data);
          var scrollTop = historyItem.data;
          this.term.viewport.viewportElement.scrollTop = scrollTop;
        }
      }
    }
  }

  startPlayback() {
    if (this.state.history.length > 0) {
      this.term.viewport.viewportElement.click();
      if (this.state.resetOnNextPlay) {
        this.term.reset();
        this.setState({historyIndex:0});
      }
      this.setState({resetOnNextPlay: false, replayStartTime: new Date().getTime(), replayInterval: setInterval(this.playHistory, 50)});
    } else {
      const host = this.getXtermHost();
      fetch(`${host.httpHost}/terminal/history/all`)
        .then(response => response.json() )
        .then(data => { 
          //console.log('Got history:', data);
          this.term.viewport.viewportElement.click();
          this.term.reset();
          //console.log('Got history:', data);
          this.setState({history: data, historyIndex:0, replayStartTime: new Date().getTime(), replayInterval: setInterval(this.playHistory, 50)});
        });
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
