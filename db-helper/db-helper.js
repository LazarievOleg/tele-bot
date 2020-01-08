const { Client } = require('pg');

const client = new Client({
  user: 'rw.tests.db.qa',
  host: process.env.AP_PSQL_PORT_5432_TCP_ADDR || 'localhost',
  database: 'c3',
  password: 'rds_for_the_win',
  port: process.env.AP_PSQL_PORT_5432_TCP_PORT || 6583,
});

module.exports = {
  connectDB() {
    client.connect();
  },

  disconnectDB() {
    client.end();
  },

  select(condition, column = '*', table = 'conversion_pixel') {
    return client.query(`SELECT ${column} FROM  ${table} WHERE  ${condition}`);
  },

  insertEmptyAdvertiser() {
    return client.query(`INSERT INTO advertiser (name) VALUES ('empty test advertiser${Date.now()}') RETURNING *`);
  },

  deleteByPixelID(pixelID) {
    return client.query(`DELETE FROM conversion_pixel WHERE id = ${pixelID}`);
  },

  createPixelWithAppnexusIDs(pixelName, url, appnexusSegmentId, appnexusConversionId) {
    return client.query(`INSERT INTO conversion_pixel
    (pixel_name, appnexus_name, url, is_revenue, is_order_id, is_pixel_hub, advertiser, version, is_new, is_deleted, category_id, appnexus_advertiser_id, appnexus_segment_id, appnexus_conversion_id)
    VALUES
    ('${pixelName}', 'appnexus name', '${url}', 'true', 'true', 'false', 1 , 1, false, false, 1, 12345, ${appnexusSegmentId}, ${appnexusConversionId}) RETURNING *`);
  },
};