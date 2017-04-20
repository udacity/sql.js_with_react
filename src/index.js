import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

ReactDOM.render(
  <App query={getParameterByName("q")} useHeader={getParameterByName("h")}/>,
  document.getElementById('root')
);
