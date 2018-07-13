import React, { Component } from 'react';
import { ReactMic } from 'react-mic';

export default class NoteRecorder extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        record: false
      }
    }
  
    startRecording = () => {
      this.setState({
        record: true,
        cancelled: false
      });
    }
  
    stopRecording = () => {
        console.log('stopRecording');
        this.setState({
          record: false,
          cancelled: false
        });
    }

    cancelRecording = () => {
        this.setState({
            record: false,
            cancelled: true
        });
    }
      
    onStop = (recordedBlob) => {
      if (this.state.cancelled) {
          return;
      }

      this.props.onEndRecording(recordedBlob.blob);
    }
  
    render() {
      return (
        <div>
          <ReactMic
            record={this.state.record}
            className="recorder"
            onStop={this.onStop}
            strokeColor="#00FFAA"
            backgroundColor="#000000" />
          <br/>
          <button onClick={this.startRecording} type="button">Record</button>
          <button onClick={this.stopRecording} type="button">Save</button>
          <button onClick={this.cancelRecording} type="button">Cancel</button>
        </div>
      );
    }
  }