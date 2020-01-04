const telegramBot = require('node-telegram-bot-api')
const help = require('./helpers')
const token = '912579752:AAGR6udQQ7rWOKgXmo9ru7hykrlpvYsXwfw'

const bot = new telegramBot(token, { polling: true })

bot.on('message', (msg) => {
        const { id } = msg.chat
    const md = `
    *hello ${msg.from.first_name}*
    _italy_
    `;
    
     bot.sendMessage(id, md, {
         parse_mode: 'Markdown'
     })



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
    //     const {id} = msg.chat;
    //     bot.sendMessage(id, help.debug(msg))
    // })

    
    // bot.onText(/\/test (.+)/, (msg, [source, match]) => {
    //     const {id} = msg.chat;
    //     bot.sendMessage(id, help.debug(match))
    // })
})







