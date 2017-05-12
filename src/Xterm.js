import Terminal from '../public/xterm.js';
import '../public/attach/attach.js';
import '../public/fit/fit.js';
import Button from './Button';
import React, { Component } from 'react';


class Xterm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
      recording: true,
      replayInterval: undefined,
      replayStartTime: undefined      
    }
    this.runRealTerminal = this.runRealTerminal.bind(this);
    this.playHistory = this.playHistory.bind(this);
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

  constructTerminal() {
    var terminalContainer = document.getElementById('terminal-container');

    // Clean terminal
    while (terminalContainer.children.length) {
      terminalContainer.removeChild(terminalContainer.children[0]);
    }
    this.term = new Terminal({
      cursorBlink: false,
      scrollback: 10000,
      tabStopWidth: 10
    });

    this.term.on('resize', function (size) {
      if (!this.pid) {
        return;
      }
      var cols = size.cols,
          rows = size.rows,
          url = '/terminals/' + this.pid + '/size?cols=' + cols + '&rows=' + rows;

      fetch(url, {method: 'POST'});
    });

    this.term.open(terminalContainer, { focus: true} );
    //this.term.fit();

    const host = this.getXtermHost();
    fetch(`${host.httpHost}/terminal/history/reset`);


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

    var cols = 200;
    var rows = 24;

    fetch(`${host.httpHost}/terminals?cols=${cols}&rows=${rows}`, {method: 'POST'})
      .then(res => res.text()).then((pid) => { 
        window.pid = pid;
        console.log('got pid:', pid);
        var socketUrl = host.socketUrl + pid;
        console.log('opening socket to :', socketUrl);
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = this.runRealTerminal;
      });
  }
  
  runRealTerminal() {
    console.log('attaching...');
    var results = this.term.attach(this.socket);
    console.log('results:', results);
    this.term._initialized = true;
  }

  playHistory() {
    if (this.state.history.length > 0) {
      console.log('running history');
      var nextAction = this.state.history[0];
      var timeDiff = new Date().getTime() - this.state.replayStartTime;
      if (timeDiff > nextAction.timeOffset) {
        var historyItem = this.state.history[0];
        this.setState({history: this.state.history.splice(1,this.state.history.length - 1)});
        if (historyItem.type === 'data') {
          this.term.viewport.viewportElement.click();
          this.term.write(historyItem.data);
          console.log('data history:',historyItem);
        } else if (historyItem.type === 'scroll') {
          console.log('scrolling during playback to: ', historyItem.data);
          var scrollTop = historyItem.data;
          this.term.viewport.viewportElement.scrollTop = scrollTop;
        }
      }
    } else {
      console.log('history done');
      this.setState({recording:true});
      clearInterval(this.state.replayInterval);
    }
  }

  playRecording() {
    this.setState({recording:false});
    const host = this.getXtermHost();
    fetch(`${host.httpHost}/terminal/history/all`)
      .then(response => response.json() )
      .then(data => { 
        this.term.viewport.viewportElement.click();
        this.term.reset();
        console.log('Got history:', data);
        this.setState({history: data, replayStartTime: new Date().getTime(), replayInterval: setInterval(this.playHistory, 50)});
      });
  }

  render() {
    return  (
      <div>
        <div id="terminal-container"></div>
        <Button click={() => this.playRecording()  } label={'Press play'} />
      </div>
    );
  } 
}

export default Xterm;
