const { Client } = require('pg');

const client = new Client({
  user: 'docker',
  host: process.env.PSQL_PORT_5432_TCP_ADDR || 'localhost',
  database: 'docker',
  password: 'docker',
  port: process.env.PSQL_PORT_5432_TCP_PORT || 6588,
});

client.connect();

module.exports = {
  connectDB() {
    client.connect();
  },

  disconnectDB() {
    client.end();
  },

   insertTeleBot(){
    return client.query(`INSERT INTO tele_bot (chat_id, web_sites) VALUES (11, 'website')  RETURNING *`);
  },


    selectUrls(condition, column = '*', table = 'tele_bot') {
    return client.query(`SELECT ${column} FROM  ${table} WHERE  ${condition}`);
  },

  selectTimeout(condition) {
    return client.query(`SELECT timeout FROM  tele_bot WHERE  ${condition}`).then( DBResponse => {
      return DBResponse.rows[0].timeout;
   });
  },


   insertUrl(chatId, url) {
    return client.query(`INSERT INTO tele_bot (chat_id, web_sites) VALUES (${chatId}, 'http://${url}') RETURNING *`);
  },

  deleteUrl(url) {
    return client.query(`DELETE FROM tele_bot WHERE web_sites LIKE '%${url}'`);
  },
};