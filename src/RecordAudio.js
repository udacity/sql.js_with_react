import React, { Component } from 'react';

class RecordAudio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isRecording: false,
    }
    this.saveAudioForPlayback = props.saveAudioForPlayback;
  }

  componentDidMount() {
    this.setupRecorder = this.setupRecorder.bind(this);
    this.setupRecorder();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.mode !== nextProps.mode) {
      if (nextProps.mode === 'recording') {
        this.startAudioRecording();
      } else if (this.props.mode === 'recording') {
        this.stopAudioRecording();
      }
    }
  }

  startAudioRecording() {
    this.state.mediaRecorder.start();
    this.setState({isRecording:true});
    console.log(this.state.mediaRecorder.state);
    //console.log("Audio recording started");
  }

  stopAudioRecording() {
    this.state.mediaRecorder.stop();
    this.setState({isRecording:false});
    console.log(this.state.mediaRecorder.state);
    //console.log("Audio recording stopped");
  }

  saveRecordedAudio(e) {
    //console.log("Audio data available");

    console.log('audio data:', e.data);
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
      // reader.result contains the contents of blob as a typed array
      var bufferArray = reader.result;
      // From: https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
      // For going backwards, use https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript and note comment about ie10
      let base64String = btoa([].reduce.call(new Uint8Array(bufferArray),function(p,c){return p+String.fromCharCode(c)},''));
      console.log(base64String);
      this.props.storeRecordedPart('audioHistory', { audioHistory: { thing: base64String } });
    }.bind(this));
    reader.readAsArrayBuffer(e.data);

    var audioUrl = window.URL.createObjectURL(e.data);
    // This works so nice and simple. From: http://stackoverflow.com/questions/33755524/how-to-load-audio-completely-before-playing (first answer)
    var audioObj = new Audio (audioUrl);
    audioObj.load();
    //audioObj.play();
    //window.audioObj = audioObj;
    // Set time of clip for scrubbing: 
    // http://stackoverflow.com/questions/9563887/setting-html5-audio-position

    this.saveAudioForPlayback(audioObj);
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
      &nbsp;
      </span>
    );
  } 
}

export default RecordAudio;

