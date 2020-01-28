const getWhoIs = require("../whois");
const db = require("../db-helper/db-helper.js");

async function myDns(id, bot){
    const urls = [];
    const dbData = await db.selectUrls(`chat_id = ${id}`);
    await dbData.rows.forEach(web => urls.push(web.url));
    await urls.forEach(async url => {
      const dnsInfo = await getWhoIs(id, url, bot);
      dnsInfo === undefined ? await bot.sendMessage(id, 'something went wrong'):
      await bot.sendMessage(id, dnsInfo);
    });
}

module.exports = myDns;