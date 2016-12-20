# cluster-dispatch
多进程管理
> 解决Node.js在Cluster模式下的连接/资源复用问题

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
