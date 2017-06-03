import React, { Component } from 'react';
import Button from './Button';
import PreviewPanel from './PreviewPanel';
import RecordStoragePanel from './RecordStoragePanel';
import Cursor from './Cursor';
import RecordAudio from './RecordAudio';
import HistoryControl from './HistoryControl';
import SimplerCodeMirror from './SimplerCodeMirror';
import Xterm from './Xterm';

class Layout extends Component {

  render() {
    var bottomPanelsContent;
    if (this.props.usage === 'instruction') {
      bottomPanelsContent = (
        <div className="bottomPanels">
        
        <div className="recordPlayControls">
        <div className="controlBtns">
        <Button 
        disabled={this.props.package.data.mode === 'playback' } 
      click={() => {(this.props.package.data.mode === 'recording' ? this.props.package.functions.stopRecording() : this.props.package.functions.startRecording() ) }}
      label={(this.props.package.data.mode === 'recording' ? <i className="fa fa-pause" ></i> : <i className="fa fa-square record-button" ></i>) } 
      title={`Make Recording`}
      />
      
      <Button 
      disabled={ this.props.package.data.mode === 'recording' || !this.props.package.data.firstRecordingComplete } 
      click={() => this.props.package.functions.startStopPlayback()  } 
      label={(this.props.package.data.mode === 'playback' ? <i className="fa fa-pause" ></i> : <i className="fa fa-play" ></i>) } 
      title={`Play/Stop`}
      />
      </div>

      <HistoryControl 
        mode={this.props.package.data.mode} 
        scrub={this.props.package.functions.scrub}
        startStopPlayback={this.props.package.functions.scrub}
        disabled={ this.props.package.data.mode === 'recording' || !this.props.package.data.firstRecordingComplete } 
        duration={this.props.package.data.duration} 
        updateSlider={this.props.package.functions.updateSlider} 
        newSliderValue={this.props.package.data.sliderValue} 
      />

      </div>

      <RecordAudio 
      mode={this.props.package.data.mode} 
      saveAudioForPlayback={(audioUrl) => this.props.package.functions.saveAudioForPlayback(audioUrl) } 
      storeRecordedPart={this.props.package.functions.storeRecordedPart}      
      />

      <RecordStoragePanel
      mode={this.props.package.data.mode} 
      recordedParts={this.props.package.data.recordedParts}
      />

      </div>
      );
    } else {
      bottomPanelsContent = (
        <span>&nbsp;</span>
      )
    }

    var panelId = 'panel-' + this.props.usage;
    var cmPanelId = 'CM-' + panelId;

    return  (
        <div className="layout" key={panelId} >

        <Cursor id="cursor" 
        mode={this.props.package.data.mode} 
      scrubPoint={this.props.package.data.scrubPoint} 
      storeRecordedPart={this.props.package.functions.storeRecordedPart}
      />

      <div className="topPanels">
      <div className="topLeftPanels">
      <SimplerCodeMirror 
      panelId={cmPanelId}
      mode={this.props.package.data.mode} 
      scrubPoint={this.props.package.data.scrubPoint}
      options={this.props.package.data.cmOptions}
      storeRecordedPart={this.props.package.functions.storeRecordedPart}      
      cmRecord={this.props.package.data.cmRecord}
      refork={this.props.package.data.refork}
      storeInstructorCmRecord={this.props.package.functions.storeInstructorCmRecord}
      getUsage={this.props.package.functions.getUsage}
      showDialog={this.props.package.functions.showDialog}
      newFork={this.props.package.functions.newFork}
      existingFork={this.props.package.functions.existingFork}
      />
      
      <Xterm 
      mode={this.props.package.data.mode} 
      scrubPoint={this.props.package.data.scrubPoint}
      storeRecordedPart={this.props.package.functions.storeRecordedPart}      
      getUsage={this.props.package.functions.getUsage}
      />

      </div>
      <div className="topRightPanels">
      <PreviewPanel
      mode={this.props.package.data.mode} 
      scrubPoint={this.props.package.data.scrubPoint}
      />
      </div>
      </div>

      { bottomPanelsContent }

    </div>
    );
  } 
}

export default Layout;
