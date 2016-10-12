# dispatch
多进程管理, app进程和library进程分开管理

# Installation
````js
$ tnpm i @ali/ams-cluster --save
````
# Example

## 初始化

````js
const Dispatch = require('cluster-dispatch').Dispach

// 指定根路径, app默认启动文件为根路径的index.js library默认启动 根路径+/library/index.js
const dispatch = new Dispach({
  baseDir: __dirname, // default process.cwd()
})
````

## 进程间通信
````js
const messager = require('cluster-dispatch').messager

// library发送消息给app

// library/index.js
messager.sendToApp({
  message: 'library message',
})

// index.js
messager.on('library', data => {
  logger.info(data) // { message : 'library message' }
})


// app发送消息给library

// index.js
messager.sendToLibrary({
  message: 'app message',
})

// library/index.js
messager.on('app', data => {
  logger.info(data) // { message : 'app message' }
})
````
