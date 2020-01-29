const nodemailer = require("nodemailer");
const db = require("../db-helper/db-helper.js");

async function userEmailByID(chatID, email) {
    let emailResult;
    const dbResult = await db.selectEmail(chatID);
    if (dbResult.rowCount === 0) {
      emailResult = (await db.insertEmail(chatID, email)).rows[0].email;
    } else {
      emailResult = (await db.updateEmail(chatID, email)).rows[0].email;
    }
    return emailResult;
}

async function sendEmail(id, email = null, url, statusCode) {
if (email != null){
    const userEmail = await userEmailByID(id, email);
  
    let transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "delfina50@ethereal.email",
        pass: "F4kjQXSNz7EQYSMRew"
      },
      pool: true, // use pooled connection
      rateLimit: true, // enable to make sure we are limiting
      maxConnections: 1, // set limit to 1 connection only
      maxMessages: 1 // send 3 emails per second
    });
  
    const message = {
      from: "alert-from@status.bot", // Sender address
      to: userEmail, // List of recipients
      subject: "Bad Status Code =/", // Subject line
      text: `URL: ${url} now has status code ${statusCode}` // Plain text body
    };
    await transport.sendMail(message, function(err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('info');
      }
    });
}

}

module.exports = sendEmail;
