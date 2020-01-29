const request = require("request");
const { chartDurationData } = require("../db-helper/db-helper");
const sendEmail =  require('../send-email')


async function getOnlyBadResponse(id, urls, bot, email) {
  urls.forEach(async web => {
    console.log(web);
    await request(
      {
        url: web.url,
        agentOptions: {
          rejectUnauthorized: false // fix authorization error of CERT_HAS_EXPIRED.
        },
        time: true
      },
      async function(error, response, body) {
        if (response != undefined) {
          //collect data for chart
          await chartDurationData(id, web.url, response.elapsedTime);
          console.log(
            `chat_id: ${id}, url: ${web.url}, status: ${response.statusCode}, duration: ${response.elapsedTime} timeout: ${web.timeout}`
          );

          if (response.statusCode != 200) {
            await bot.sendMessage(
              id,
              `Status code of ${web.url} is ${response.statusCode}, duration: ${response.elapsedTime} ms`,
              {
                disable_web_page_preview: true
              }
            );
              // send email with bad status code info
              await sendEmail(id, email, web.url, response.statusCode)

          }
        } else {
          await bot.sendMessage(
            id,
            `SOMETHING WERE WRONG WITH YOUR WEB SITE: ${web.url} IT RESPONSE: ${response}`,
            {
              disable_web_page_preview: true
            }
          );
        }
      }
    );
  });
}

module.exports = getOnlyBadResponse;
