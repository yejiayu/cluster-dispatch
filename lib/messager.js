'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cluster = require('cluster');
var assert = require('assert');
// const debug = require('debug')('cluster:messager');

var EventEmitter = require('events');
var is = require('is-type-of');

var ROLE = require('./constant/role');

var _require = require('./util'),
    generateRequestId = _require.generateRequestId;

var IS_SELF = Symbol('is_self');
var BIND = Symbol('bind_handler');
var PROCESS_MESSAGE_HANDLER = Symbol('process_message_handler');
var GENERATE_REQUEST = Symbol('generate_request');

var Messager = function (_EventEmitter) {
  _inherits(Messager, _EventEmitter);

  function Messager() {
    _classCallCheck(this, Messager);

    var _this = _possibleConstructorReturn(this, (Messager.__proto__ || Object.getPrototypeOf(Messager)).call(this));

    _this.SELF_ROLE = cluster.isMaster ? ROLE.MASTER : process.env.ROLE;
    _this.autoIncrement = 0;

    assert(is.string(_this.SELF_ROLE), 'process.env.ROLE required');
    assert(Object.keys(ROLE).findIndex(function (role) {
      return role === _this.SELF_ROLE;
    }) !== -1, 'process.env.ROLE value illegal');

    _this[BIND]();
    return _this;
  }

  _createClass(Messager, [{
    key: BIND,
    value: function value() {
      var _this2 = this;

      process.on('message', function (message) {
        return _this2[PROCESS_MESSAGE_HANDLER](message);
      });
    }
  }, {
    key: 'sendToMaster',
    value: function sendToMaster(data, _ref) {
      var _ref$isSentOnce = _ref.isSentOnce,
          isSentOnce = _ref$isSentOnce === undefined ? true : _ref$isSentOnce,
          _ref$duplex = _ref.duplex,
          duplex = _ref$duplex === undefined ? true : _ref$duplex;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      var message = { form: this.SELF_ROLE, to: ROLE.MASTER, data };
      var request = this[GENERATE_REQUEST](message, { isSentOnce, duplex });

      process.send(request);
    }
  }, {
    key: 'sendToApp',
    value: function sendToApp(data, _ref2) {
      var _ref2$isSentOnce = _ref2.isSentOnce,
          isSentOnce = _ref2$isSentOnce === undefined ? true : _ref2$isSentOnce,
          _ref2$duplex = _ref2.duplex,
          duplex = _ref2$duplex === undefined ? true : _ref2$duplex;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      var message = { form: this.SELF_ROLE, to: ROLE.APP, data };
      var request = this[GENERATE_REQUEST](message, { isSentOnce, duplex });

      process.send(request);
    }
  }, {
    key: 'sendToLibrary',
    value: function sendToLibrary(data, _ref3) {
      var _ref3$isSentOnce = _ref3.isSentOnce,
          isSentOnce = _ref3$isSentOnce === undefined ? true : _ref3$isSentOnce,
          _ref3$duplex = _ref3.duplex,
          duplex = _ref3$duplex === undefined ? true : _ref3$duplex;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      var message = { form: this.SELF_ROLE, to: ROLE.LIBRARY, data };
      var request = this[GENERATE_REQUEST](message, { isSentOnce, duplex });

      process.send(request);
    }
  }, {
    key: 'sendToPid',
    value: function sendToPid(data, _ref4) {
      var _ref4$duplex = _ref4.duplex,
          duplex = _ref4$duplex === undefined ? true : _ref4$duplex,
          pid = _ref4.pid;

      if (process.pid === pid) {
        return;
      }
      var message = { form: this.SELF_ROLE, to: ROLE.PID, data };
      var request = this[GENERATE_REQUEST](message, { duplex, pid });

      process.send(request);
    }
  }, {
    key: 'reply',
    value: function reply(request) {
      // TODO: 处理response请求
    }
  }, {
    key: IS_SELF,
    value: function value(role) {
      return this.SELF_ROLE === role;
    }
  }, {
    key: PROCESS_MESSAGE_HANDLER,
    value: function value(message) {
      var to = message.to;

      assert(is.undefined(to) || is.null(to), 'message.to required');

      if (this.SELF_ROLE === ROLE.MASTER || to === this.SELF_ROLE) {
        this.emit('message', message);
      }
    }
  }, {
    key: GENERATE_REQUEST,
    value: function value(message, condition) {
      this.autoIncrement += 1;
      var id = generateRequestId(this.SELF_ROLE, this.autoIncrement);

      return {
        id,
        message,
        condition,
        isRequest: true
      };
    }
  }]);

  return Messager;
}(EventEmitter);

module.exports = Messager;