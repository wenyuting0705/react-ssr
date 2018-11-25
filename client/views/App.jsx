import React, { Component } from 'react'
import Routes from '../config/router'
import AppBar from './components/app-bar'

export default class App extends Component {
  componentDidMount() {
    // do something here
  }

  render() {
    return [
      <AppBar key="appbar" />,
      <Routes key="routes" />,
    ]
  }
}
