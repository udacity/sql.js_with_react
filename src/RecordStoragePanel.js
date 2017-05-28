import React, { Component } from 'react';
import Button from './Button';
import JSONTree from 'react-json-tree';

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
      <div style={{display:(this.state.storageShown ? 'block' : 'none')}}>
        <JSONTree data={this.props.recordedParts || {} } />
      </div>
      {
        //      <textarea style={{display:(this.state.storageShown ? 'block' : 'none')}} value={JSON.stringify(this.props.recordedParts, null, 2)} />
      }
      </div>
    );
  } 
}

export default RecordStoragePanel;
