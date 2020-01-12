bot.onText(/\/addurl (.+)/, (msg, [source, match]) => {
    const { id } = msg.chat
    console.log(match);
  
    let result = match.split(' ', 2)
    let url = result[0]
    let strTimeout = result[1]
  
    if (strTimeout.endsWith('s')) {
      timeout = (parseFloat(strTimeout)) * 1000;
      console.log(timeout);
      db.insertUrl(id, url, timeout);
  
    } else if (strTimeout.endsWith('m')) {
      timeout = (parseFloat(strTimeout)) * 60000;
    }
    console.log(url, strTimeout);
  
  
    bot.sendMessage(id, `url: ${JSON.stringify(url)} with timeout : ${strTimeout} added`)
  })