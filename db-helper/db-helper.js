const { Client } = require("pg");

const client = new Client({
  // user: "docker",
  // host: process.env.PSQL_PORT_5432_TCP_ADDR || "localhost",
  // database: "docker",
  // password: "docker",
  // port: process.env.PSQL_PORT_5432_TCP_PORT || 6588

  connectionString: // heroku pg database
    "postgres://sardsgvrvqwefo:b04097874f1e1e300ea19608290aee948f8d4f4fefe255041535618d976853e1@ec2-46-137-91-216.eu-west-1.compute.amazonaws.com:5432/d4ubig0sjv12v1",
  ssl: true
});

client.connect();

const changeTimeout = async (condition, timeout) => {
  await client.query(
    `UPDATE tele_bot SET timeout = ${timeout} WHERE ${condition} RETURNING *`
  );
};

module.exports = {
  changeTimeout,

  connectDB() {
    client.connect();
  },

  disconnectDB() {
    client.end();
  },

  insertTeleBot() {
    return client.query(
      `INSERT INTO tele_bot (chat_id, url) VALUES (11, 'website')  RETURNING *`
    );
  },

  selectUrls(condition, column = "*", table = "tele_bot") {
    return client.query(`SELECT ${column} FROM  ${table} WHERE  ${condition}`);
  },

  async selectUrlsAsync(condition, column = "*", table = "tele_bot") {
    return await client.query(
      `SELECT ${column} FROM ${table} WHERE ${condition}`
    );
  },

  selectTimeout(condition) {
    return client
      .query(`SELECT timeout FROM  tele_bot WHERE  ${condition}`)
      .then(DBResponse => {
        return DBResponse.rows[0].timeout;
      });
  },

  insertUrl(chatId, url, timeout = 5000) {
    return client.query(
      `INSERT INTO tele_bot (chat_id, url, timeout) VALUES (${chatId}, 'http://${url}', ${timeout}) RETURNING *`
    );
  },

  deleteUrl(url) {
    return client.query(`DELETE FROM tele_bot WHERE url LIKE '%${url}'`);
  },

  chartDurationData(chatId, url, duration) {
    url = url.replace("http://", "");
    return client.query(
      `INSERT INTO chart_duration (chat_id, url, duration) VALUES (${chatId}, '${url}', ${duration}) RETURNING *`
    );
  },

  selectDuration(condition) {
    return client
      .query(
        ` SELECT url, COUNT(url),  SUM(duration)
      FROM chart_duration 
      where ${condition}
      GROUP BY url;  `
      )
      .then(DBResponse => {
        return DBResponse.rows;
      });
  }
};

// CREATE TABLE tele_bot (
//   id bigserial primary key,
//   chat_id bigserial NOT NULL,
//   url text NOT NULL,
//   date_added  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
// );

// CREATE TABLE chart_duration (
//   id bigserial primary key,
//   chat_id bigserial NOT NULL,
//   url text NOT NULL,
//   duration bigserial NOT NULL,
//   date_added  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
//    );
