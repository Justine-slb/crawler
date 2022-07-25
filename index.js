// Module import //
const express = require('express')
const hbs = require('hbs');
const path = require('path');
const crawler = require("./modules/puppeteer");
const schedule = require("node-schedule");

// Server Creation //
const app = express()
app.use(express.static('static'));
const port = 8080;
// Template & Component setup //
app.set('views', './static');
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'static/components'));

hbs.registerHelper('toUppercase', function(string) {
  return string.toUpperCase().replace("-"," ")
});

hbs.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

// Database Setup//
crawler.Crawl()

var route = require("./router/route");
app.use("/",route);

/*for load all other page in 404*/
app.all('*', (req, res) => {
  res.status(404).render('404');
});


app.listen(port, () => {
  console.log(`[Server] App listening on port ${port}`)
})

// Scheduled Tasks //

const test = schedule.scheduleJob('0 0 * * *', function(){
  console.log("[Database] Refetching Data.")
  crawler.Crawl();
});




