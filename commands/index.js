const get = require("./command-get");
const getSsl = require("./command-get-ssl");
const getOnlyBadResponse = require('./command-get-only-bad')

module.exports = {
  get,
  getSsl,
  getOnlyBadResponse
};
