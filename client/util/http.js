/*
 用来发送http请求，对axios进行封装
*/
/*
  默认情况下发送请求，请求api接口使用绝对路径就可以
  但是因为我们要使用服务端渲染，服务端渲染发送请求是要发送到本地的一个地址，因为是服务端在启动服务，要指定是127.0.0.1,这个地址是存在于客户端和服务端的区别
*/
import axios from 'axios'

const baseUrl = process.env.API_BASE || ''

let result
const parseUrl = (url, params) => {
  const str = Object.keys(params).reduce((reduce, key) => {
    result += `${key}=${params[key]}&`
    return result // 返回的是？后面拼接的参数
  }, '') // 最后这里如果不传空串，第一个reduce是undefined
  return `${baseUrl}/api/${url}?${str.substr(0, str.length - 1)}`
}

export const get = (url, params) => {
  return new Promise((resolve, reject) => {
    axios.get(parseUrl(url, params))
      .then((resp) => {
        const resData = resp.data
        if (resData && resData.success === true) {
          resolve(resData)
        } else {
          reject(resData)
        }
      })
      .catch(reject)
  })
}

export const post = (url, params, data) => {
  return new Promise((resolve, reject) => {
    axios.post(parseUrl(url, params), data)
      .then((resp) => {
        const resData = resp.data
        if (resData && resData.success === true) {
          resolve(resData)
        } else {
          reject(resData)
        }
      })
      .catch(reject)
  })
}
