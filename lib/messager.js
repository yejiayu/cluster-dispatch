'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cluster = require('cluster');
var assert = require('assert');
var debug = require('debug')('cluster:messager');

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
    value: function sendToMaster(data) {
      var isSentOnce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      process.send({
        form: this.SELF_ROLE,
        to: ROLE.MASTER,
        data,
        condition: { isSentOnce }
      });
    }
  }, {
    key: 'sendToApp',
    value: function sendToApp(data) {
      var isSentOnce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      process.send({
        form: this.SELF_ROLE,
        to: ROLE.APP,
        data,
        condition: { isSentOnce }
      });
    }
  }, {
    key: 'sendToLibrary',
    value: function sendToLibrary(data) {
      var isSentOnce = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this[IS_SELF](ROLE.MASTER)) {
        return;
      }

      process.send({
        form: this.SELF_ROLE,
        to: ROLE.LIBRARY,
        data,
        condition: { isSentOnce }
      });
    }
  }, {
    key: 'sendToPid',
    value: function sendToPid(pid, data) {
      if (process.pid === pid) {
        return;
      }

      process.send({
        form: this.SELF_ROLE,
        to: pid,
        data
      });
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