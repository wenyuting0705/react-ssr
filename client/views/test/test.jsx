import React from 'react'
import Axios from 'axios';

export default class Test extends React.Component {
  constructor(props) {
    super(props)
    this.getAll = this.getAll.bind(this)
  }

  componentDidMount() {
    // do something here

  }
  getAll() {
      axios.post('/api/message/mark_all', {
          accesstoken: '768c02e8-3f24-4075-9c9d-37eb404c1468'
      })
      .then((resp) => {
          console.log(resp, 'success')
      })
  }

  render() {
    return (
      <button onClick="getAll">click</button>
    )
  }
}
