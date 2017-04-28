import React, { Component } from 'react';

class SQLOutput extends Component {


  // {banner: , query: , results: [{columns: [""], values:[[], [],..]}]}

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.queryResult !== this.props.queryResult
      || nextProps.queryError !== this.props.queryError;
  }

  render() {
    var banner, heads, rows;
    if (this.props.queryError) {
      banner = this.props.queryError;
    } else if (this.props.queryResult) {
      banner = "Success"
      var columns = this.props.queryResult.fields.map(field => field.name);
      heads = columns.map(name => <th key={name}>{name}</th>);
      var i=0;
      rows = this.props.queryResult.rows.map(row => {
        var id = "row-" + ++i;
        var cols = [];
        columns.forEach(name => {
          cols.push(<td key={id+"-"+name}>{row[name]}</td>);
        })
        return <tr key={id}>{cols}</tr>;
      })
    } else {
      return <div>No Results yet</div>;
    }

    return (
      <div className="SqlOutput">
        <div className="Banner">{banner}</div>
        <table>
          <thead>
            <tr key="columnHeads">{heads}</tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

export default SQLOutput;
