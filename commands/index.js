const get = require("./command-get");
const getSsl = require("./command-get-ssl");
const getOnlyBadResponse = require("./command-get-only-bad");
const quickGet = require("./command-quickGet");
const myDns = require('./command-mydns')
module.exports = {
  get,
  getSsl,
  getOnlyBadResponse,
  quickGet,
  myDns
};
