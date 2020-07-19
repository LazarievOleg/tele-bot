# telegram bot, can check web sites availability, store info in Mongodb and PSQL, send emails notifications and create a beautiful graph

HOW IT WORKS

  /addurl - add URL to your list, example: /addurl google.com

  /myurls - get list with all your URLs and timeout info

  /timeout - change default requests interval, example: "/timeout 1h" will set timeout to 1 hour

  /get - start getting status codes

  /onlybad your_email - start getting status codes, but receive notification only when status code not equal 200;
   /onlybad your@email.com - receive notification in bot and email;
   /onlybad no email - receive notification only in bot;

  /stop - stop getting status codes

  /quickget - get info about SSL, DNS and status code of specified URL, example: /quickget google.com

  /ssl -  return SSL expiries data for all your URLS

  /delurl - remove URL from your list, example: /delurl google.com

  /domaineexpiration - experimental feature -  return domain expiration date info for all your URLS 

  /average - return png with average requests duration bar chart
