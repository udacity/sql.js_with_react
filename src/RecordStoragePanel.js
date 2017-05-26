import React, { Component } from 'react';
import Button from './Button';

class RecordStoragePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      storageShown:false
    }
  }

  toggleShowStorage() {
    this.setState({storageShown: !this.state.storageShown });
  }
  
  render() {
    return  (
      <div className="recordStoragePanel">
      <Button click={() => this.toggleShowStorage() } label={this.state.storageShown ? 'Hide Recorded Data' : 'Show Recorded Data'} title="Toggle show recorded data" />
      <textarea style={{display:(this.state.storageShown ? 'block' : 'none')}} value={JSON.stringify(this.props.recordedParts, null, 2)} />
      </div>
    );
  } 
}

export default RecordStoragePanel;
