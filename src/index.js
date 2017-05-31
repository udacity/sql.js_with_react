import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

const store = configureStore(); // You can also pass in an initialState here

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

ReactDOM.render(
  <Provider store={store} ><App query={getParameterByName("q")} useHeader={getParameterByName("h")}/></Provider>,
  document.getElementById('root')
);
