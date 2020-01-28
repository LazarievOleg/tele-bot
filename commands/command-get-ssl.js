const sslCertificate = require("get-ssl-certificate");

async function getSsl(id, sslUrls, bot) {
  sslUrls.forEach(async url => {
    const urlSsl = url.replace("http://", "");
    await sslCertificate
      .get(urlSsl)
      .then(certificate => {
        bot.sendMessage(
          id,
          `SSL certificate for ${url} expires ${certificate.valid_to} `,
          {
            disable_web_page_preview: true
          }
        );
      })
      .catch(error => {
        console.log(id + " " + url + " " + error.message);
        bot.sendMessage(
          id,
          `ERROR: ${error.message}` +
            `   !!! we can not found any SSL for ${url} ¯\_(ツ)_/¯ !!!`
        );
      });
  });
}

module.exports = getSsl;
