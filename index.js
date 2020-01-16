process.env.NTBA_FIX_319 = 1; ///fix telegram api error with deprecated callback
const telegramBot = require("node-telegram-bot-api");
const help = require("./helpers");
const fs = require("fs");
const token = "1048847285:AAF-i8fWvbMqpZOTPYld8-7Cuyuy8QOBNaQ";
const db = require("./db-helper/db-helper.js");

const { get } = require("./commands/command-get");
const { getSsl } = require("./commands/command-get-ssl");


const express = require('express')
const app = express()

app.get('/', function(req, res) {
    res.send('Hello Sir')
})
app.listen(process.env.PORT || 3000)



const bot = new telegramBot(token, {
  polling: true,
  filepath: false /// to send or receive file delete this filepath string
});

let today = new Date();
let date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
let time =
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date + " " + time;




// console.log(process.env.NODE_ENV);
// process.env.NODE_ENV = "development";
// console.log(process.env.NODE_ENV);
// process.env.NODE_ENV === "development"
// // добавить возобновление гет функции при рестарте бота если она была запущена ранее
//   ? bot.sendMessage(549810057, `bot restarted ${dateTime}`)
//   : "";

  bot.sendMessage(549810057, `bot restarted ${dateTime}`)

let urls = [];
let interval;




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



bot.onText(/\/get/, msg => {
  let getFuncCalls = 0;
  getFuncCalls++;
  const { id } = msg.chat;
  // сделать ответ только когда рреспонс статус больше 200 или ошибка

  urls = [];

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

  if (getFuncCalls === 1) {
    getFunc();
  } else if (getFuncCalls > 1) {
    clearInterval(interval);
    getFunc();
    bot.sendMessage(id, `command /get is running`.toUpperCase());
  }
});

bot.onText(/\/start/, msg => {
  const { id } = msg.chat;
  bot.sendMessage(
    id,
    `
          HOW IT WORKS 
/addurl - add URL to your list, example: /addurl snn.com
/myurls - get list with all your URLs and timeout info
/timeout - change default requests interval, example "/timeout 1h"  will set timeout 1 hour
/get - start getting status codes
/stop - stop getting status codes
/ssl - get the end date of SSL certificates
/delurl - remove URL from your list, example: /delurl snn.com
`
  );
});

bot.onText(/\/stop/, msg => {
  urls = [];
  const { id } = msg.chat;
  clearInterval(interval);
  console.log(interval._idleTimeout);
  bot.sendMessage(id, `stopped, rerun: /get`);
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
                  " you first url added with default timeout, change default timeout at any time /timeout"
              );
            } else if ((urlRowsLength === 0) & (userUrlsLength <= 10)) {
              db.insertUrl(id, match);
              bot.sendMessage(
                id,
                help.debug(match) +
                  " getting status codes stopped, url added, rerun command: /get"
              );
            } else if (urlRowsLength > 0) {
              bot.sendMessage(id, help.debug(match) + " url already in list");
            } else if (userUrlsLength >= 10) {
              bot.sendMessage(
                id,
                ` your limit has been exceed with max ${userUrlsLength} urls in list, buy a premium super plan!!!`
              );
            }
          });
      });
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

// db.changeTimeout(`chat_id = ${id}`, parseFloat(match));
// db.selectTimeout(`chat_id = ${id}`).then(response => {
//   bot.sendMessage(id, ` timeout updated to ${response}!`);

// response.rows.map(each => {
//   bot.sendMessage(id, changedTimeout);
// });
//   });
// });

// bot.onText(/\/addurl (.+)/, (msg, [source, match]) => {
//   const { id } = msg.chat
//   console.log(match);

//   // let result = match.split(' ', 2)
//   let url = (match.split(' ', 2))[0]
//   let strTimeout = ((match.split(' ', 2))[1])
//   let timeout = (parseFloat((match.split(' ', 2))[1]))
//   console.log('fvvfvf', timeout);

//   if (strTimeout.endsWith('s') && timeout > 60) {
//     timeout = timeout * 1000;
//     console.log('cdcdcdcdc', timeout);
//     db.insertUrl(id, url, timeout);
//     bot.sendMessage(id, `url: ${JSON.stringify(url)} with timeout : ${strTimeout} added`)
//   }
//   else if
//     (strTimeout.endsWith('m') && timeout > 1) {
//     timeout = (parseFloat(strTimeout)) * 60000;
//     db.insertUrl(id, url, timeout);
//     bot.sendMessage(id, `url: ${JSON.stringify(url)} with timeout : ${strTimeout} added`)
//   }
//   else if
//     (strTimeout.endsWith('h') && timeout > 0.000277778 && timeout < 50) {
//     timeout = (parseFloat(strTimeout)) * 3600000;
//     db.insertUrl(id, url, timeout);
//     bot.sendMessage(id, `url: ${JSON.stringify(url)} with timeout : ${strTimeout} added`)
//   }
//   else {bot.sendMessage(id, 'Syntax or timeout ERROR, timeout must be more then 1 minute and less then 50 hours ')}
// })

// interval = setInterval(() => {
//   fetch(web.url)
//     .then(response => {
//       console.log(`chat_id: ${id}, url: ${web.url}, status: ${response.status} ${response.statusText}, timeout: ${web.timeout}`);

//       bot.sendMessage(id, `status code of ${web.url} is ${response.status} ${response.statusText} `, {
//         disable_web_page_preview: true
//       });
//     }).catch(error => {
//       console.log(id + ' ' + web + ' ' + error.message)
//       bot.sendMessage(id, help.debug(error.message) + '   !!! CHECK YOUR URL!!!')
//     })
// }, web.timeout, console.log(web.timeout)

// interval = setInterval(() => {
//   urls.forEach(web => {
//     fetch(web)
//       .then(response => {
//         console.log(id + ' ' + web + ' ' + response.status + ' ' + response.statusText);
//         bot.sendMessage(id, `status code of ${web} is ${response.status} ${response.statusText} `, {
//           disable_web_page_preview: true
//         });
//       }).catch(error => {
//         console.log(id + ' ' + web + ' ' + error.message)
//         bot.sendMessage(id, help.debug(error.message) + '   !!! CHECK YOUR URL!!!')
//       })
//   });
// }, console.log('sxsxsxsx', interval)
//  );

//создание и оплата товара

// bot.onText(/\pay/, msg => {
//   const chat_id = msg.chat.id

//   bot.sendInvoice(
//     chat_id,
//     'Прем подписка',
//     'Доп функции для телеграм бота',
//     'payload',
//     '632593626:TEST:i56982357197',
//     'Some_string_key',
//     'UAH',
//     [{
//       label: 'Про версия',
//       amount: 20000
//     }],
//     {
//       photo_url: 'https://www.kino-teatr.ru/acter/album/56287/949964.jpg',
//       need_name: true,
//       need_phone_number: true,
//       need_mail: true,
//       is_flexible: true
//     }
//   )

// })

// //

// // отправить контакт

// bot.onText(/\/con/, msg => {
//   bot.sendContact(msg.chat.id, '12345678', 'DevCoffee', {
//     last_name: 'Фамилия'
//   })
// })

// // гео локация
// bot.onText(/\/loc/, msg => {
//   bot.sendLocation(msg.chat.id, 59.928374, 30.123456)
// })

// //отправка видео
// bot.onText(/\/video/, msg => {
//   const chatID = msg.chat.id

//   bot.sendMessage(chatID, 'Гружу видяшку')
//   bot.sendVideo(chatID, './data/videoplayback.mp4')
// })

// //отправка видео
// bot.onText(/\/video/, msg => {
//   const chatID = msg.chat.id
//   bot.sendMessage(chatID, 'Гружу видяшку')
//   fs.readFile('./data/videoplayback.mp4', (err, video) => {
//     bot.sendVideo(chatID.video)
//   })

// })

// // отправка стикеров
// bot.onText(/\/sticker/, msg => {
//   bot.sendSticker(msg.chat.id, './data/1.webp')
// })

// bot.onText(/\/sticker/, msg => {
//   fs.readFile('./data/1.webp', (err, sticker) => {
//     bot.sendSticker(msg.chat.id, sticker)
//   })
// })

// // отправляем файл

// bot.onText(/\/doc1/, msg => {
//   bot.sendDocument(msg.chat.id, './data/sheets/test.xlsx')
// })

// // отправляем файл со статусами
// bot.onText(/\/doc2/, msg => {
//   bot.sendMessage(msg.chat.id, 'Загрузка начата')

//   fs.readFile('./data/new.zip', (err, file) => {
//     bot.sendDocument(msg.chat.id, file, {
//       caption: 'Some text'
//     }).then(() => {
//       bot.sendMessage(msg.chat.id, 'Загрузили наконец-то')
//     })
//   })
// })

// // отправка картинки
// bot.onText(/\/pic/, msg => {
//   bot.sendPhoto(msg.chat.id, fs.readFileSync(__dirname + '/data/img/img.jpg'))
// })

// // второй вариант отправки картинки с заголовком
// bot.onText(/\/pic2/, msg => {
//   bot.sendPhoto(msg.chat.id, './data/img/img.jpg', {
//     caption: 'Пример заголовка для картинки'
//   })
// })

// // отправка аудио записи
// bot.onText(/\/audio/, msg => {
//   bot.sendAudio(msg.chat.id, './data/audio/example.mp3')
// })

// // отправка аудио записи с подписями о старте и завершении
// bot.onText(/\/audio2/, msg => {
//   bot.sendMessage(msg.chat.id, "Гружу твой файл епт")
//   fs.readFile(__dirname + '/data/audio/example.mp3', (err, data) => {
//     bot.sendAudio(msg.chat.id, data).then(() => {
//       bot.sendMessage(msg.chat.id, "Загрузка завершил")
//     })
//   })
// })

// // inline клава
// const inline_keyboard = [
//   [{
//       text: 'forward',
//       callback_data: 'forward'
//     },
//     {
//       text: 'reply',
//       callback_data: 'reply'
//     }
//   ],
//   [{
//       text: 'edit',
//       callback_data: 'edit'
//     },
//     {
//       text: 'delete',
//       callback_data: 'delete'
//     },
//     {
//       text: 'get img',
//       callback_data: 'get img'
//     }
//   ]
// ]

// bot.on('callback_query', query => {

//   const {
//     chat,
//     message_id,
//     text
//   } = query.message

//   switch (query.data) {
//     case 'forward':
//       bot.forwardMessage(chat.id, chat.id, message_id)
//       break
//     case 'reply':
//       bot.sendMessage(chat.id, 'Отправим сообщение', {
//         reply_to_message_id: message_id
//       })
//       break

//     case 'edit':
//       bot.editMessageText(`${text} (edited)`, {
//         chat_id: chat.id,
//         message_id: message_id,
//         reply_markup: {
//           inline_keyboard
//         }
//       })
//       break

//       // удаляем месаг
//     case 'delete':
//       bot.deleteMessage(chat.id, message_id)
//       break
//     case 'get img':
//       bot.sendPhoto(chat.id, fs.readFileSync(__dirname + '/img.jpg'))
//       break

//   }

//   bot.answerCallbackQuery({
//     callback_query_id: query.id
//   })
// })

// bot.onText(/\/start/, (msg, [source, match]) => {
//   const chatID = msg.chat.id
//   bot.sendMessage(chatID, 'keyboard', {
//     reply_markup: {
//       inline_keyboard
//     }
//   })
// })

// bot.on('inline_query', query => {

// const results = []

// for (let i = 0; i < 5; i++ ) {
//   results.push({
//     type: 'article',
//     id: i.toString(),
//     title: 'title' + i,
//     input_message_content: {
//       message_text: `article ${i+1}`
//     }
//   })
// }
//   bot.answerInlineQuery(query.id, results, {
//     cache_time: 0
//   })
// })

// bot.on('message', (msg) => {
//   const chatID = msg.chat.id;
//   bot.sendMessage(chatID, 'inline keyboard', {
//     reply_markup: {
//       inline_keyboard: [
//         [{
//           text: 'google',
//           url: 'https://google.com'
//         }],
//         [{
//           text: 'reply',
//           callback_data: 'reply'
//         },
//         {
//           text: 'forward',
//           callback_data: 'forward'
//         }]
//       ]
//     }
//   })
// });

// bot.on('callback_query', query => {
// //  bot.sendMessage(query.message.chat.id, help.debug(query))
// bot.answerCallbackQuery(query.id, `${query.data}`)
// })

// bot.on('message', (msg) => {

//   const chatID = msg.chat.id;

//   if (msg.text === 'close') {
//     bot.sendMessage(chatID, 'closing keyboard', {
//       reply_markup: {
//         remove_keyboard: true
//       }
//     })
//   } else if (msg.text === 'respond') {
//     bot.sendMessage(chatID, 'responding', {
//       reply_markup: {
//         force_reply: true
//       }
//     })
//   } else {

//     bot.sendMessage(msg.chat.id, 'klava', {
//       reply_markup: {
//         keyboard: [
//           [{
//             text: 'send coordinates',
//             request_location: true
//           }],
//           ['respond', 'close'],
//           [{
//             text: 'send contact',
//             request_contact: true
//           }]
//         ],
//         one_time_keyboard: true
//       }
//     })
//   }
// });
// bot.on('message', (msg) => {
//     setInterval(() => {
//         bot.sendMessage(msg.chat.id, 'https://vk.com', {
//             disable_web_page_preview: true,
//             disable_notification: true
//         })
//     }, 4000)
// });

// const sites = ['https://google.com','http://getstatuscode.com/500','http://getstatuscode.com/300','http://getstatuscode.com/404']
// sites.forEach(web => {
//     bot.on('message', (msg) => {
//         fetch(web)
//         .then(response => {

//             console.log('dcdcdc', response);
//             const { id } = msg.chat
//             bot.sendMessage(id, `status code of ${web} is ${response.status} ${response.statusText} `);
//         })
// });
// });

// bot.on('message', (msg) => {
//     const { id } = msg.chat
// const html = `
// <strong>hello, ${msg.from.first_name}</strong>
// <i>rfrgtyhyju</i>
// <pre> ${help.debug(msg)} </pre>
// `

//  bot.sendMessage(id, html, {
//      parse_mode: 'HTML'
//  })
// if (msg.text.toLowerCase() === 'hello'){
//     bot.sendMessage(id, `hello , ${msg.from.first_name}`)
// } else {
//     bot.sendMessage(id, help.debug(msg))
// }

// bot.sendMessage(id, help.debug(msg)).then(() => {
//     console.log('message has been send');
// }).catch((error) => {
//     console.error(error);
// })

// bot.onText(/\/start/, msg => {
//   const { id } = msg.chat;
//   bot.sendMessage(id, help.debug(msg))
// })

// bot.onText(/\/test (.+)/, (msg, [source, match]) => {
//   const { id } = msg.chat;
//   bot.sendMessage(id, help.debug(match))
// })
