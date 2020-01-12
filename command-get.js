const fetch = require("node-fetch");
const help = require("./helpers");
const sslCertificate = require("get-ssl-certificate");

module.exports = {
  get(id, urls, bot) {
    urls.forEach(web => {
      console.log(web);
      fetch(web.url)
        .then(webResponse => {
          console.log(
            `chat_id: ${id}, url: ${web.url}, status: ${webResponse.status} ${webResponse.statusText}, timeout: ${web.timeout}`
          );
          bot.sendMessage(
            id,
            `status code of ${web.url} is ${webResponse.status} ${webResponse.statusText} `,
            {
              disable_web_page_preview: true
            }
          );
        })
        .then(() => {
          const urlWithout = web.url.replace("http://", "");
          console.log("fvgbghnhmn", urlWithout);

          sslCertificate.get(urlWithout).then(function(certificate) {
            bot.sendMessage(
              id,
              `ssl certificate for ${web.url} valid to ${certificate.valid_to} `,
              {
                disable_web_page_preview: true
              }
            );
          });
        })
        .catch(error => {
          console.log(id + " " + web + " " + error.message);
          bot.sendMessage(
            id,
            help.debug(error.message) + "   !!! CHECK YOUR URL!!!"
          );
        });
    });
  }
};
