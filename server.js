require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const URI = process.env.DB_URI;
var bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const UrlShorted = require("./url.js");

const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// body parser activado
app.use(bodyParser.urlencoded({ extended: false }));

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  let original_url = req.body.url;
  let short_url = 1;
  let resUrl = {};

  function validURL(str) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  }
  if (!validURL(original_url)) return res.json({ error: "invalid url" });

  resUrl.original_url = original_url;
  resUrl.short_url = 1;

  UrlShorted.findOne({})
    .sort({ short_url: -1 })
    .exec((err, result) => {
      if (!err && result !== undefined) {
        resUrl.short_url = result.short_url + 1;
      }
      if (!err) {
        UrlShorted.findOneAndUpdate(
          { original_url: resUrl.original_url },
          { original_url: resUrl.original_url, short_url: resUrl.short_url },
          { new: true, upsert: true },
          (err, savedUrl) => {
            if (!err) {
              console.log(`saved doc ${savedUrl}`)
              res.json(resUrl);
            }
          }
        );
      }
    });
});

app.get('/api/shorturl/:input', (req, res) => {
  let { input } = req.params
  UrlShorted.findOne({ short_url: input }, (err, result) => {

    if (!err && result !== undefined) {
      res.redirect(result.original_url)
    } else { res.json("url not found") }

  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
