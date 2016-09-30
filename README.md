# dispatch
多进程管理, app进程和library进程分开管理

# Installation
````js
$ npm i cluster-dispatch --save
````
# Example
````js
const Dispatch = require('cluster-dispatch')

// 指定根路径, app默认启动文件为根路径的index.js library默认启动 根路径+/library/index.js
const dispatch = new Dispach({
  baseDir: __dirname, // default process.cwd()
})

// 接收app message
dispatch.on('app-mesaage', data => {
  logger.info(data)
});

// 接收library message
// library/redis-client
process.send({
  name: 'redis-client',
  message: '消息',
})

dispatch.on('redis-client', data => {
  logger.info(data) // {  message: '消息'}
});

// 从library发送消息到app
dispatch.sendToApp({
  message: 'xxx',
});

// index.js
process.on('message', data => {
  console.log(data) // { mesaage: 'xxx' }
})

// $ curl locahost:8080/user/name
// user name
````
