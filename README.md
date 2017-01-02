# cluster-dispatch
> 解决Node.js在Cluster模式下的连接/资源复用问题

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/cluster-dispatch.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cluster-dispatch
[travis-image]: https://img.shields.io/travis/yejiayu/cluster-dispatch.svg?style=flat-square
[travis-url]: https://travis-ci.org/yejiayu/cluster-dispatch
[coveralls-image]: https://img.shields.io/coveralls/yejiayu/cluster-dispatch.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yejiayu/cluster-dispatch?branch=master
[david-image]: https://img.shields.io/david/yejiayu/cluster-dispatch.svg?style=flat-square
[david-url]: https://david-dm.org/yejiayu/cluster-dispatch
[node-image]: https://img.shields.io/badge/node.js-%3E=_4.6.1-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/cluster-dispatch.svg?style=flat-square
[download-url]: https://npmjs.org/package/cluster-dispatch
[license-image]: https://img.shields.io/npm/l/cluster-dispatch.svg

你会不会有这么一种场景, 比如创建一个TCP连接并且监听一个configserver的配置变动, 当变动的时候同时调整配置, 当你的应用运行在cluster模式下这个TCP连接就会是N个, 但是你并不需要N个因为浪费系统和你的服务方资源, 你只需要有一个TCP连接就够了.

这个模块就是解决这个问题诞生的.

他用了这样一个进程模型
```
        Master  -> fork Library
          |           |       
          |         Agent
       Cluster        |
  Wokrer, Wokrer, Woker....
```
你可以把需要复用的资源放在Library进程中, Agent来负责跨进程的调用

# Installation
````js
$ npm i cluster-dispatch --save
````

# Example
````
$ git clone

$ npm i

$ npm run example
````
# API
## Master
master作为守护进程也是应用的入口, 负责启动appWokrer和libraryWorker
````js
const Master = require('cluster-dispatch').Master;

/*
  * @param {Object} options
  *   - {String} baseDir - 工程根路径
  *   - {String} appPath - app进程入口文件, 可以是一个相对路径
  *   - {String} libraryPath - 需要代理的库的入口文件, 可以是一个相对路径
  *   - {Number} appWorkerCount - 需要启动的app进程数
  *   - {Funcion} logging - log
  *   - {Boolean} needLibrary - 是否需要启动library进程
  *   - {Boolean} needAgent - 是否需要自动启动代理
 */
const master = new Master({
  baseDir: __dirname,
  logging: debug,
  appWorkerCount,``
});

(async function initMaster() {
  await master.init(); // 初始化

  master.on('error', error => debug(error));
})().catch(debug)
````

## Agent
agent负责跨进程的调度, 这个agent实例每个appWorker都有, 默认会在appWorker初始化时创建好

在appWorker中通过Agent.getAgent()就可以拿到agent实例

````js
// agent/index.js
'use strict';

const Agent = require('cluster-dispatch').Agent;

module.exports = Agent.getAgent();
````

# 启动流程
1. 启动master进程
2. master fork 出 library worker
3. library worker 根据实例化master传递的libraryPath参数拿到下面对象签名, 然后触发ready事件给master
4. master接到ready事件后开始已cluster模式启动app worker
5. app worker初始化完成后会向library worker请求对象签名, 拿到对象签名后开始初始化agent
6. agent遍历对象签名, 并且把对象的每个key重写, 类似这样的逻辑
````js
agent.invoke = function(objName, methodName, ...rest) {
    return client.setTo('Library').send({
      objName,
      methodName,
      args: rest,
    })
}
````
等于拿到你的调用方法后, 把参数原样返回回去, 实际执行还是在library worker中

7. done
