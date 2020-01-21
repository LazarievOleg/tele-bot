// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fetch = require("node-fetch");
const request = require("request");
const nodeHtmlToImage = require("node-html-to-image");
const { chartDurationData } = require("../db-helper/db-helper");

function get(id, urls, bot) {
  urls.forEach(web => {
    console.log(web);
    request(
      {
        url: web.url,
        agentOptions: {
          rejectUnauthorized: false // fix authorization error of CERT_HAS_EXPIRED.
        },
        time: true
      },
      function(error, response, body) {
        // console.log("error:", error); // Print the error if one occurred
        // console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        // // console.log("body:", body); // Print the HTML for the Google homepage.
        chartDurationData(id, web.url, response.elapsedTime); //collect data for chart
        console.log(
          `chat_id: ${id}, url: ${web.url}, status: ${response.statusCode}, duration: ${response.elapsedTime} timeout: ${web.timeout}`
        );
        bot.sendMessage(
          id,
          `status code of ${web.url} is ${response.statusCode}, duration: ${response.elapsedTime} ms`,
          {
            disable_web_page_preview: true
          }
        );
      }
    );
  });
}

module.exports = get;

//  html to image
//   nodeHtmlToImage({
//     output: `./images/${web.url.replace("http://", "")}.png`,
//     html: body
//   }).then(() => console.log("The image was created successfully!"));
// }).on("error", function(err) {
//   console.log(err);
// });

// fetch

// get(id, urls, bot) {
//   urls.forEach(web => {
//     fetch(web.url)
//       .then(webResponse => {
//         console.log("cdcdcdcdcd", webResponse);

//         // console.log(
//         //   `chat_id: ${id}, url: ${web.url}, status: ${webResponse.status} ${webResponse.statusText}, timeout: ${web.timeout}`
//         // );
//         console.log(webResponse.status );
//         console.log(webResponse.statusText);
//         console.log(webResponse.redirected);
//         console.log(webResponse.ok);
//         console.log(webResponse.url);
//               //=> 200
//            //=> 'OK'
//            //=> false
//                    //=> true

//         bot.sendMessage(
//           id,
//           `status code of ${web.url} is ${webResponse.status} ${webResponse.statusText} `,
//           {
//             disable_web_page_preview: true
//           }
//         );
//       })
//       .catch(error => {
//         console.log(id + " " + web + " " + error.message);
//         bot.sendMessage(
//           id,
//           help.debug(error.message) + "   !!! CHECK YOUR URL!!!"
//         );
//       });
//   });
// }
