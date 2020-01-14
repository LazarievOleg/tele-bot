const fetch = require("node-fetch");
const request = require("request");
const nodeHtmlToImage = require("node-html-to-image");
module.exports = {
  get(id, urls, bot) {
    urls.forEach(web => {

      console.log(web);
      request({url: web.url, time: true}, function(error, response, body) {

        // console.log("error:", error); // Print the error if one occurred
        // console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        // // console.log("body:", body); // Print the HTML for the Google homepage.
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
        })
      })
    }}
                                                                                  //  html to image 
      //   nodeHtmlToImage({
      //     output: `./images/${web.url.replace("http://", "")}.png`,
      //     html: body
      //   }).then(() => console.log("The image was created successfully!"));
      // }).on("error", function(err) {
      //   console.log(err);
      // });




                                                                                              // fetch
      // fetch(web.url)
      // .then(webResponse => {
      //   console.log('cdcdcdcdcd',webResponse);

      //   console.log(
      //     `chat_id: ${id}, url: ${web.url}, status: ${webResponse.status} ${webResponse.statusText}, timeout: ${web.timeout}`
      //   );
      //   bot.sendMessage(
      //     id,
      //     `status code of ${web.url} is ${webResponse.status} ${webResponse.statusText} `,
      //     {
      //       disable_web_page_preview: true
      //     }
      //   );
      // })
      // .catch(error => {
      //   console.log(id + " " + web + " " + error.message);
      //   bot.sendMessage(
      //     id,
      //     help.debug(error.message) + "   !!! CHECK YOUR URL!!!"
      //   );
      // });