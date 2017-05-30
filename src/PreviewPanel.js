import React, { Component } from 'react';

class PreviewPanel extends Component {

  constructor(props) {
    super(props);
    this.previewSystem = {
      protocol: 'http',
      host: 'localhost',
      port: 4000
    }
  }

  render() {
    return  (
      <div className="previewPanel">
        <div className="hostLabel"><span>Host:</span>{`${this.previewSystem.protocol}://${this.previewSystem.host}`}:</div>
        <div className="port"><input type="text" defaultValue={`${this.previewSystem.port}`} /></div>
        <div className="contents">
{
//        <iframe src={`${this.previewSystem.protocol}://${this.previewSystem.host}:${this.previewSystem.port}`} />
}

        </div>
      </div>
    );
  } 
}

export default PreviewPanel;
