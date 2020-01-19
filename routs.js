const express = require("express");
const app = express();
const db = require("./db-helper/db-helper");

app.get("/get", function(req, res) {
  db.selectUrls(`chat_id = 549810057`).then(dbResponse => {
    const urls = [];
    dbResponse.rows.map(each => {
      urls.push(each.url);
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Content-Type", "application/json");
    res.header("mode", "cors");
    res.send(
      JSON.stringify({
        data: urls
      })
    );
  });
});

app.listen(process.env.PORT || 3000);
