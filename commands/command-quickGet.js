const request = require("request");
const sslCertificate = require("get-ssl-certificate");
const getWhoIs = require("../whois");

async function quickGet(id, url, bot) {
  url = url.replace("http://", "http://");
  url = url.replace("https://", "http://");
  url = url.replace("www.", "http://");
  url = url.replace(/ /g, "").toLowerCase();

  request(
    {
      url: `http://${url}`,
      agentOptions: {
        rejectUnauthorized: false // fix authorization error of CERT_HAS_EXPIRED.
      },
      time: true
    },
    function(error, response, body) {
      if (response != undefined) {
        console.log(
          `chat_id: ${id}, url: ${url}, status: ${response.statusCode}, duration: ${response.elapsedTime}`
        );
        bot.sendMessage(
          id,
          `status code of ${url} is ${response.statusCode}, duration: ${response.elapsedTime} ms`,
          {
            disable_web_page_preview: true
          }
        );
      } else {
        bot.sendMessage(
          id,
          `SOMETHING WERE WRONG WITH YOUR WEB SITE: ${url} IT RESPONSE: ${response}`,
          {
            disable_web_page_preview: true
          }
        );
      }
    }
  );

  sslCertificate.get(url).then(certificate => {
    bot.sendMessage(
      id,
      `ssl certificate for ${url} expires ${certificate.valid_to} `,
      {
        disable_web_page_preview: true
      }
    );
  });

  const dnsInfo = await getWhoIs(id, url, bot);
  await bot.sendMessage(id, dnsInfo);
}

module.exports = quickGet;
