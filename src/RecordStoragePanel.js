import React, { Component } from 'react';

class RecordStoragePanel extends Component {

  render() {
    return  (
      <div className="recordStoragePanel">
        <textarea value={JSON.stringify(this.props.recordedParts, null, 2)} />
      </div>
    );
  } 
}

export default RecordStoragePanel;
