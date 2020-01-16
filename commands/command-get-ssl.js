const sslCertificate = require("get-ssl-certificate");

module.exports = {
  getSsl(id, sslUrls, bot) {
    sslUrls.forEach(url => {
      const urlSsl = url.replace("http://", "");

      sslCertificate
        .get(urlSsl)
        .then(certificate => {
          bot.sendMessage(
            id,
            `ssl certificate for ${url} expires ${certificate.valid_to} `,
            {
              disable_web_page_preview: true
            }
          );
        })
        .catch(error => {
          console.log(id + " " + url + " " + error.message);
          bot.sendMessage(
            id,
            `ERROR: ${error.message}` + `   !!! we can not found any SSL for ${url} ¯\_(ツ)_/¯ !!!`
          );
        });
    });
  }
};
