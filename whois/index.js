const whois = require("whois-json");

async function getWhoIs(id, url, bot) {
  url = url.replace("http://", "");
  url = url.replace("https://", "");
  url = url.replace("www.", "");
  url = url.replace(/ /g, "").toLowerCase();

  const results = await whois(url);
  console.log(results);

  let creationDate = results.creationDate || results.created;
  creationDate === undefined
    ? (creationDate = "no data for creation date ")
    : creationDate;

  let expirationDate =
    results.registrarRegistrationExpirationDate || results.expires;
  expirationDate === undefined
    ? (expirationDate = "no data for expiration date ")
    : expirationDate;

  let updatedDate = results.modified || results.updatedDate;
  updatedDate === undefined
    ? (updatedDate = "no data for Updated/Modified Date ")
    : updatedDate;

  const dnsInfo = `DOMAIN INFO FOR ${url} : \n creation date: ${creationDate} \n expiration date: ${expirationDate} \n modified date: ${updatedDate}`;
  return dnsInfo;
}

module.exports = getWhoIs;
