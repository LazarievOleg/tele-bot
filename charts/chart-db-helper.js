const db = require("../db-helper/db-helper");

async function getDurationChartData(chat_id) {
  const urls = [];
  const durations = [];
  const data = await db.selectDuration(`chat_id = ${chat_id}`);
  data.forEach(async userUrls => {
    await urls.push(userUrls.url);
    await durations.push(userUrls.sum / userUrls.count);
  });
  return { urls, durations };
}

module.exports = getDurationChartData;
