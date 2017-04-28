import React, { Component } from 'react';

class SQLOutput extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.queryResult !== this.props.queryResult
      || nextProps.queryError !== this.props.queryError;
  }

  render() {
    if (this.props.queryError) {
      return <div className="alert alert-danger">{this.props.queryError}</div>;
    } else if (this.props.queryResult) {
      var columns = this.props.queryResult.fields.map(field => field.name);
      var heads = columns.map(name => <th key={name}>{name}</th>);
      var i=0;
      var rows = this.props.queryResult.rows.map(row => {
        var id = "row-" + ++i;
        var cols = [];
        columns.forEach(name => {
          cols.push(<td key={id+"-"+name}>{row[name]}</td>);
        })
        return <tr key={id}>{cols}</tr>;
      });
      return (
        <div>
          <div className="alert alert-success">Success</div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr key="columnHeads">{heads}</tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return <div className="alert alert-info">No Results yet</div>;
    }
  }
}

export default SQLOutput;
