# cluster-dispatch
多进程管理
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

$ npm run example // 请在node7以下版本运行
````
