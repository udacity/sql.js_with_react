import Terminal from '../public/xterm.js';
import React, { Component } from 'react';


class Xterm extends Component {
  constructor(props) {
    super(props);
    this.state = { }
  }
  componentDidMount() {
    var theProtocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
    
    this.setState ({       
      protocol : theProtocol,
      socketURL : theProtocol + location.hostname + ((location.port) ? (':' + location.port) : '') + '/terminals/'
    });
    
    this.constructTerminal();
  }

  constructTerminal() {
    var terminalContainer = document.getElementById('terminal-container');
    var optionElements = {
      cursorBlink: document.querySelector('#option-cursor-blink'),
      cursorStyle: document.querySelector('#option-cursor-style'),
      scrollback: document.querySelector('#option-scrollback'),
      tabstopwidth: document.querySelector('#option-tabstopwidth')
    };

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

    this.term.open(terminalContainer);
    this.term.fit();

    fetch('terminal/history/reset');

    var history;
    var replayInterval;
    var replayStartTime;
    var playHistory = function() {
      if (history.length > 0) {
        var nextAction = history[0];
        var timeDiff = new Date().getTime() - replayStartTime;
        if (timeDiff > nextAction.timeOffset) {
          var historyItem = history.shift();
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
        clearInterval(replayInterval);
      }
    }

    setTimeout(function() {  
      fetch('/terminal/history/all').then(function(response) { return response.json(); })
                                    .then(function(data) { 
                                      this.term.viewport.viewportElement.click();
                                      this.term.reset();
                                      history = data;
                                      console.log('Got history:', history);
                                      replayStartTime = new Date().getTime();
                                      replayInterval = setInterval(playHistory, 50);
                                    });
    }, 15000);

    this.term.viewport.viewportElement.addEventListener('scroll', function(e) {
      //console.log('scroll:', e);
      var target = e.target;
      var scrollTop = target.scrollTop;
      console.log('scrollTop:', scrollTop);
      fetch('/terminal/history/record/scroll', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({scrollTop:scrollTop})
      });
    });

    var initialGeometry = this.term.proposeGeometry(),
        cols = initialGeometry.cols,
        rows = initialGeometry.rows;

    fetch('/terminals?cols=' + cols + '&rows=' + rows, {method: 'POST'}).then(function (res) {


      res.text().then(function (pid) {
        window.pid = pid;
        var socketUrl = this.state.socketUrl + pid;
        this.socket = new WebSocket(socketUrl);
        this.socket.onopen = this.runRealTerminal;
      });
    });
  }

  runRealTerminal() {
    this.term.attach(this.socket);
    this.term._initialized = true;
  }


  render() {
    return  (
      <div id="terminal-container">
      xtermjs
      </div>
    );
  } 
}

export default Xterm;
