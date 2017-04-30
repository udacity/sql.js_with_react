import React, { Component } from 'react';

class RecordAudio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentlyRecording: false,
    }
    this.saveAudioForPlayback = props.saveAudioForPlayback;
  }

  componentDidMount() {
    this.setupRecorder = this.setupRecorder.bind(this);
    this.setupRecorder();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.audioRecording !== this.state.currentlyRecording) {
      if (nextProps.audioRecording) {
        this.startAudioRecording();
      } else {
        this.stopAudioRecording();
      }
    }
    if (nextProps.audioUrl !== this.state.audioUrl) {
      this.setState({audioUrl: nextProps.audioUrl});
    }
  }

  startAudioRecording() {
    this.state.mediaRecorder.start();
    this.setState({currentlyRecording:true});
    console.log(this.state.mediaRecorder.state);
    console.log("Audio recording started");
  }

  stopAudioRecording() {
    this.state.mediaRecorder.stop();
    this.setState({currentlyRecording:false});
    console.log(this.state.mediaRecorder.state);
    console.log("Audio recording stopped");
  }

  saveRecordedAudio(e) {
    console.log("data available");

    var audioUrl = window.URL.createObjectURL(e.data);

    //    var audioCtx = new AudioContext();
    //    var source = audioCtx.createMediaElementSource(audio);
    //    source.connect(audioCtx.destination);
    this.saveAudioForPlayback(audioUrl);
  }

  
  setupRecorder() {
    // fork getUserMedia for multiple browser versions, for the future
    // when more browsers support MediaRecorder
    navigator.getUserMedia = ( navigator.getUserMedia ||
                               navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia ||
                               navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.getUserMedia (
        { // constraints - only audio needed for this app
          audio: true
        },

        // Success callback
        function(stream) {
          var mediaRecorder = new MediaRecorder(stream);
      	  mediaRecorder.ondataavailable = this.saveRecordedAudio.bind(this);
          this.setState({mediaRecorder: mediaRecorder});
        }.bind(this),

        // Error callback
        function(err) {
          console.log('The following gUM error occured: ' + err);
        }
      )
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  }

  render() {
    return  (
      <span>
      <audio src={this.state.audioUrl} controls />
      </span>
    );
  } 
}

export default RecordAudio;

