process.env.NTBA_FIX_319 = 1; ///fix telegram api error with deprecated callback
const telegramBot = require("node-telegram-bot-api");
const help = require("./helpers");
const token = "token here";
const db = require("./db-helper/db-helper.js");
const getChartImg = require("./charts/average-duration-chart");
const {
  get,
  getSsl,
  getOnlyBadResponse,
  quickGet,
  myDns
} = require("./commands");

const express = require("express");
const app = express();

app.get("/", function(req, res) {
  res.send("Hello Sir");
});
app.listen(process.env.PORT || 3000);

const bot = new telegramBot(token, {
  polling: true
});

// // |||||||||||||||||||||||||||||||||||добавить возобновление гет функции при рестарте бота если она была запущена ранее

bot.sendMessage(
  549810057,
  `bot restarted ${new Date().toLocaleString("uk-UA")}`
);

let urls = [];
let interval;
let getFunctionsCallsNumber = 0;

bot.onText(/\/average/, async msg => {
  const { id } = msg.chat;
  const image = await getChartImg(id);
  bot.sendPhoto(
    id,
    image,
    {
      caption: "Average Requests Duration Chart"
    },
    { filename: "DurationChart.png", contentType: "image/png" }
  );
});

bot.onText(/\/ssl/, msg => {
  const { id } = msg.chat;
  const sslUrls = [];

  db.selectUrls(`chat_id = ${id}`)
    .then(DBResponse => {
      DBResponse.rows.map(each => sslUrls.push(each.url));
      console.log(sslUrls);
    })
    .then(() => {
      getSsl(id, sslUrls, bot);
    });
});

bot.onText(/\/onlybad (.+)/, async (msg, [source, email]) => {
  let parsedEmail = email.match(/\S+@\S+\.\S+/);
  parsedEmail != null ? parsedEmail = parsedEmail.toString() : parsedEmail;
  
    urls = [];
    clearInterval(interval);
    getFunctionsCallsNumber++;

    const { id } = msg.chat;
    const getFunc = async () => {
      const dbData = await (await db.selectUrls(`chat_id = ${id}`)).rows;
      dbData.map(each => urls.push({ url: each.url, timeout: each.timeout }));
      const timeout = await dbData[0].timeout;
      await getOnlyBadResponse(id, urls, bot, parsedEmail);

      interval = setInterval(async () => {
        await getOnlyBadResponse(id, urls, bot, parsedEmail);
      }, timeout);
    };

    if (getFunctionsCallsNumber === 1) {
      await getFunc();
      await bot.sendMessage(id, ` /onlybad STARTED ... `);
    } else if (getFunctionsCallsNumber > 1) {
      await clearInterval(interval);
      await getFunc();
      await bot.sendMessage(id, `OTHER COMMANDS STOPPED, /onlybad IS RUNNING`);
    }
});

bot.onText(/\/quickget (.+)/, async (msg, [source, url]) => {
  const { id } = msg.chat;
  await quickGet(id, url, bot);
});

bot.onText(/\/domaineexpiration/, async (msg, [source, url]) => {
  const { id } = msg.chat;
  myDns(id, bot);
});

bot.onText(/\/get/, msg => {
  urls = [];
  clearInterval(interval);
  getFunctionsCallsNumber++;
  const { id } = msg.chat;
  const getFunc = () => {
    db.selectUrls(`chat_id = ${id}`)
      .then(DBResponse => {
        DBResponse.rows.map(each =>
          urls.push({ url: each.url, timeout: each.timeout })
        );
        return DBResponse.rows[0].timeout;
      })
      .then(timeout => {
        get(id, urls, bot);

        interval = setInterval(() => {
          console.log(interval);
          get(id, urls, bot);
        }, timeout);
      });
  };

  if (getFunctionsCallsNumber === 1) {
    getFunc();
  } else if (getFunctionsCallsNumber > 1) {
    clearInterval(interval);
    getFunc();
    bot.sendMessage(id, `OTHER COMMANDS STOPPED, /get IS RUNNING`);
  }
});

bot.onText(/\/start/, msg => {
  const { id } = msg.chat;
  const markdownText = `
  *HOW IT WORKS*

  */addurl* - add URL to your list, example: /addurl google.com

  */myurls* - get list with all your URLs and timeout info

  */timeout* - change default requests interval, example: "/timeout 1h" will set timeout to 1 hour

  */get* - start getting status codes

  */onlybad your_email* - start getting status codes, but receive notification only when status code not equal 200;
   /onlybad your@email.com - receive notification in bot and email;
   /onlybad no email - receive notification only in bot;

  */stop* - stop getting status codes

  */quickget* - get info about SSL, DNS and status code of specified URL, example: /quickget google.com

  */ssl* -  return SSL expiries data for all your URLS

  */delurl* - remove URL from your list, example: /delurl google.com

  */domaineexpiration* - *experimental feature* -  return domain expiration date info for all your URLS 

  */average* - return png with average requests duration bar chart
  `;
  bot.sendMessage(id, markdownText, {
    parse_mode: "Markdown"
  });
});

bot.onText(/\/stop/, msg => {
  urls = [];
  const { id } = msg.chat;
  clearInterval(interval);
  console.log(interval._idleTimeout);
  bot.sendMessage(id, `ALL COMMANDS STOPPED`);
});

bot.onText(/\/delurl (.+)/, (msg, [source, match]) => {
  clearInterval(interval);
  const { id } = msg.chat;
  let rowCounts;

  db.deleteUrl(match)
    .then(response => {
      rowCounts = response.rowCount;
      return rowCounts;
    })
    .then(rowCounts => {
      if (rowCounts === 0) {
        bot.sendMessage(
          id,
          help.debug(match) +
            ` there is no ${match} url in your list, getting status codes stopped, rerun command: /get`
        );
      } else {
        bot.sendMessage(
          id,
          help.debug(match) +
            " getting status codes stopped, url deleted, rerun command /get"
        );
      }
    });
});

bot.onText(/\/myurls/, msg => {
  const { id } = msg.chat;
  db.selectUrls(`chat_id = ${id}`)
    .then(response => {
      response.rows.map(each => {
        bot.sendMessage(id, help.debug(each.url), {
          disable_web_page_preview: true
        });
      });
    })
    .then(() => {
      db.selectTimeout(`chat_id = ${id}`).then(timeout => {
        bot.sendMessage(id, ` your current timeout: ${timeout}`, {
          disable_web_page_preview: true
        });
      });
    });
});

bot.onText(/\/addurl (.+)/, (msg, [source, match]) => {
  urls = [];
  const { id } = msg.chat;
  let urlRowsLength;
  let userUrlsLength;
  clearInterval(interval);
  if (match.match(/\./)) {
    match = match.replace("http://", "");
    match = match.replace("https://", "");
    match = match.replace("www.", "");
    match = match.replace(/ /g, "").toLowerCase();

    db.selectUrls(`chat_id = ${id} and url = 'http://${match}'`, "url")
      .then(DBResponse => {
        urlRowsLength = DBResponse.rows.length;
      })
      .then(() => {
        db.selectUrls(`chat_id = ${id}`)
          .then(DBResponse => {
            userUrlsLength = DBResponse.rows.length;
          })
          .then(() => {
            if (userUrlsLength === 0) {
              db.insertUrl(id, match);
              bot.sendMessage(
                id,
                help.debug(match) +
                  " you first url added with default timeout, change default timeout at any time /timeout",
                {
                  disable_web_page_preview: true
                }
              );
            } else if ((urlRowsLength === 0) & (userUrlsLength <= 10)) {
              db.insertUrl(id, match);
              bot.sendMessage(
                id,
                help.debug(match) +
                  " getting status codes stopped, url added, rerun command: /get",
                {
                  disable_web_page_preview: true
                }
              );
            } else if (urlRowsLength > 0) {
              bot.sendMessage(id, help.debug(match) + " url already in list", {
                disable_web_page_preview: true
              });
            } else if (userUrlsLength >= 10) {
              bot.sendMessage(
                id,
                ` your limit has been exceed with max ${userUrlsLength} urls in list, buy a premium super plan!!!`
              );
            }
          });
      });
  } else {
    bot.sendMessage(id, ` syntax error, check your url`);
  }
});

bot.onText(/\/timeout (.+)/, (msg, [source, match]) => {
  const { id } = msg.chat;

  let strTimeout = match;
  let timeout = parseFloat(match);

  clearInterval(interval);

  if (strTimeout.endsWith("s") && timeout > 60) {
    timeout = timeout * 1000;
    db.changeTimeout(`chat_id = ${id}`, timeout);
    bot.sendMessage(
      id,
      ` getting status codes stopped! timeout updated to ${strTimeout}! , rerun /get`
    );
  } else if (strTimeout.endsWith("m") && timeout > 1) {
    timeout = timeout * 60000;
    db.changeTimeout(`chat_id = ${id}`, timeout);
    bot.sendMessage(
      id,
      ` getting status codes stopped! timeout updated to ${strTimeout}! , rerun /get`
    );
  } else if (
    strTimeout.endsWith("h") &&
    timeout > 0.000277778 &&
    timeout < 50
  ) {
    timeout = timeout * 3600000;
    db.changeTimeout(`chat_id = ${id}`, timeout);
    bot.sendMessage(
      id,
      ` getting status codes stopped! timeout updated to ${strTimeout}! , rerun /get`
    );
  } else {
    bot.sendMessage(
      id,
      "Syntax or timeout ERROR, timeout must be more then 1 minute and less then 50 hours "
    );
  }
});

bot.on("polling_error", error => {
  console.log(error.code); // => 'EFATAL'
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", reason.stack || reason);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});
