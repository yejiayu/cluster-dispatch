'use strict';

const INIT = Symbol('init_agents');

class Library {
  constructor({ agents, mailBox }) {
    this.agents = agents;
    this.mailBox = mailBox;

    this[INIT]();
  }

  [INIT]() {
    const { agents } = this;
    const keys = Object.keys(agents);

    for (const key of keys) {
      const obj = agents[key];

      const methodKeys = Object.keys(obj);
      for (const method of methodKeys) {
        obj[method] = this.invoke.bind(this, { objName: key, methodName: method });
      }

      this[key] = obj;
    }
  }

  invoke({ objName, methodName }) {
    const args = Array.from(arguments);
    args.shift();

    const { mailBox } = this;
    const message = {
      action: 'invoke_library',
      data: { objName, methodName, args },
    };

    const mail = mailBox.writeMails();
    return mail.setTo('LIBRARY')
        .setMessage(message)
        .send();
  }
}

module.exports = Library;
