const fetch = require('node-fetch')
const telegramBot = require('node-telegram-bot-api')
const help = require('./helpers')
const fs = require('fs')
const token = '912579752:AAGR6udQQ7rWOKgXmo9ru7hykrlpvYsXwfw'

const bot = new telegramBot(token, {
  polling: true
})


//создание и оплата товара 

bot.onText(/\pay/, msg => {
  const chat_id = msg.chat.id

  bot.sendInvoice(
    chat_id,
    'Прем подписка',
    'Доп функции для телеграм бота',
    'payload',
    '632593626:TEST:i56982357197',
    'Some_string_key',
    'UAH',
    [{
      label: 'Про версия',
      amount: 20000
    }],
    {
      photo_url: 'https://www.kino-teatr.ru/acter/album/56287/949964.jpg',
      need_name: true,
      need_phone_number: true,
      need_mail: true,
      is_flexible: true
    }
  )

})



// 




// отправить контакт 

bot.onText(/\/con/, msg => {
  bot.sendContact(msg.chat.id, '12345678', 'DevCoffee', {
    last_name: 'Фамилия'
  })
})


// гео локация 
bot.onText(/\/loc/, msg => {
  bot.sendLocation(msg.chat.id, 59.928374, 30.123456)
})

//отправка видео 
bot.onText(/\/video/, msg => {
  const chatID = msg.chat.id

  bot.sendMessage(chatID, 'Гружу видяшку')
  bot.sendVideo(chatID, './data/videoplayback.mp4')
})

//отправка видео 
bot.onText(/\/video/, msg => {
  const chatID = msg.chat.id
  bot.sendMessage(chatID, 'Гружу видяшку')
  fs.readFile('./data/videoplayback.mp4', (err, video) => {
    bot.sendVideo(chatID.video)
  })

})


// отправка стикеров
bot.onText(/\/sticker/, msg => {
  bot.sendSticker(msg.chat.id, './data/1.webp')
})

bot.onText(/\/sticker/, msg => {
  fs.readFile('./data/1.webp', (err, sticker) => {
    bot.sendSticker(msg.chat.id, sticker)
  })
})



// отправляем файл

bot.onText(/\/doc1/, msg => {
  bot.sendDocument(msg.chat.id, './data/sheets/test.xlsx')
})



// отправляем файл со статусами 
bot.onText(/\/doc2/, msg => {
  bot.sendMessage(msg.chat.id, 'Загрузка начата')

  fs.readFile('./data/new.zip', (err, file) => {
    bot.sendDocument(msg.chat.id, file, {
      caption: 'Some text'
    }).then(() => {
      bot.sendMessage(msg.chat.id, 'Загрузили наконец-то')
    })
  })
})



// отправка картинки
bot.onText(/\/pic/, msg => {
  bot.sendPhoto(msg.chat.id, fs.readFileSync(__dirname + '/data/img/img.jpg'))
})

// второй вариант отправки картинки с заголовком
bot.onText(/\/pic2/, msg => {
  bot.sendPhoto(msg.chat.id, './data/img/img.jpg', {
    caption: 'Пример заголовка для картинки'
  })
})

// отправка аудио записи
bot.onText(/\/audio/, msg => {
  bot.sendAudio(msg.chat.id, './data/audio/example.mp3')
})


// отправка аудио записи с подписями о старте и завершении
bot.onText(/\/audio2/, msg => {
  bot.sendMessage(msg.chat.id, "Гружу твой файл епт")
  fs.readFile(__dirname + '/data/audio/example.mp3', (err, data) => {
    bot.sendAudio(msg.chat.id, data).then(() => {
      bot.sendMessage(msg.chat.id, "Загрузка завершил")
    })
  })
})



// inline клава
const inline_keyboard = [
  [{
      text: 'forward',
      callback_data: 'forward'
    },
    {
      text: 'reply',
      callback_data: 'reply'
    }
  ],
  [{
      text: 'edit',
      callback_data: 'edit'
    },
    {
      text: 'delete',
      callback_data: 'delete'
    },
    {
      text: 'get img',
      callback_data: 'get img'
    }
  ]
]

bot.on('callback_query', query => {

  const {
    chat,
    message_id,
    text
  } = query.message

  switch (query.data) {
    case 'forward':
      bot.forwardMessage(chat.id, chat.id, message_id)
      break
    case 'reply':
      bot.sendMessage(chat.id, 'Отправим сообщение', {
        reply_to_message_id: message_id
      })
      break

    case 'edit':
      bot.editMessageText(`${text} (edited)`, {
        chat_id: chat.id,
        message_id: message_id,
        reply_markup: {
          inline_keyboard
        }
      })
      break

      // удаляем месаг 
    case 'delete':
      bot.deleteMessage(chat.id, message_id)
      break
    case 'get img':
      bot.sendPhoto(chat.id, fs.readFileSync(__dirname + '/img.jpg'))
      break

  }

  bot.answerCallbackQuery({
    callback_query_id: query.id
  })
})

bot.onText(/\/start/, (msg, [source, match]) => {
  const chatID = msg.chat.id
  bot.sendMessage(chatID, 'keyboard', {
    reply_markup: {
      inline_keyboard
    }
  })
})












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