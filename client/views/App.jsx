import React, { Component } from 'react'
import axios from 'axios'
import Routes from '../config/router'
import AppBar from './components/app-bar'

export default class App extends Component {
  componentDidMount() {
    // do something here
    axios.get('/api/topics')
      .then((resp) => {
        console.log(resp, 'success')
      })
      .catch((err) => {
        console.log(err, 'err')
      })

    axios.post('/api/message/mark_all', {
      accesstoken: '768c02e8-3f24-4075-9c9d-37eb404c1468',
    })
      .then((resp) => {
        console.log(resp, 'success')
      })
  }

  render() {
    return [
      <AppBar key="appbar" />,
      <Routes key="routes" />,
    ]
  }
}
