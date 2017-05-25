import React, { Component } from 'react';

class RecordStoragePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recordedJson: {
        recordings: [
          {
            cursor: {},
            editor: {},
            xterm:  {},
            audio:  {},
          }
        ]
      }
    }
  }

  render() {
    return  (
      <div className="recordStoragePanel">
        <textarea>{JSON.stringify(this.state.recordedJson, null, 2)}</textarea>
      </div>
    );
  } 
}

export default RecordStoragePanel;
