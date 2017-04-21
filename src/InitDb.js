import React, { Component } from 'react';

// For example of how ES6 heredoc works, see http://stackoverflow.com/questions/4376431/javascript-heredoc.

class InitDb extends Component {
  constructor(props) {
    super(props);
    this.loadDbHandler = props.loadDbHandler;
    this.remoteDbFile = props.remoteDbFile;
    this.sqlDump = `
--- Insert your SQL dump here:
CREATE TABLE employees (id integer, name varchar(50), salary float);
INSERT INTO employees (id, name, salary) VALUES (1,'will',111.55), (2,'sam', 222.25), (3,'mary', 333.99);
--- SQL dump ends above this line.
`;
    if (props.inlineDb) {
      this.db = this.props.db;
      this.loadSql(this.db);
    } else {
      this.loadSqlFromServer();
    }
  }

  loadSql() {
    if (this.sqlDump && this.sqlDump.length > 0) {
      for (var sqlLine of this.sqlDump.split("\n")) {
        var cleanLine = sqlLine.trim();
        if (cleanLine.length > 0) {
          //          console.log(cleanLine);
          this.db.run(cleanLine);
        }
      }
    }
  }

  createXhrRequest ( httpMethod, url, processor, callback ) {
    var xhr = new XMLHttpRequest();
    xhr.open( httpMethod, url );
    xhr.responseType = 'arraybuffer';

    xhr.onload = function() {
      xhr.response.processor = processor;
      callback( null, xhr.response );
    };

    xhr.onerror = function() {
      xhr.response.processor = processor;
      callback( xhr.response );
    };

    xhr.send();
  }

  loadSqlFromServer() {
    this.createXhrRequest( "GET", this.remoteDbFile, this.loadDbHandler, function( err, response ) {
      // Do your post processing here. 
      if( err ) { console.log( "Error!" ); }
      var uInt8Array = new Uint8Array(response);
      response.processor(uInt8Array);
    });
  }

  render() {
    return(<div className="SqlLoadStatus">SQL data just got loaded...</div>);
  }
}

export default InitDb;
