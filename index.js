require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')
const urlparser = require('url');
const mongoose = require('mongoose');
const { url } = require('inspector');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI);
console.log(mongoose.connection.readyState);

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Created schema for new url 

const urlSchema = new mongoose.Schema({
  shortUrl: { type: Number, required: true },
  originalUrl: String,
})

let URL = mongoose.model('Url', urlSchema)

// Your first API endpoint

app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  const bodyurl = req.body.url;
  console.log(req.body.url)
  
  const dnsLookup = dns.lookup(urlparser.parse(bodyurl).host.hostname, async (err, address) => {
    if (!address) {
      console.log('DNS Check: Error')
    } else {
      console.log('DNS Check: Success')
      let genShorturl = Math.floor(Math.random() * 1000000)

      const urlGroup = new URL({
        shortUrl: genShorturl,
        originalUrl: bodyurl
      })
      urlGroup.save((err, urls) => {
        if(err) console.log(err);
        res.json({
          shortUrl: urls.shortUrl, 
          originalUrl: urls.originalUrl
        });
      })
    }
  })
});

app.get('/api/shorturl/:shortUrl', (res, req) => {
  let shortUrl = req.params.shortUrl;

  URL.find({shortUrl: shortUrl}, (err, address) => {
    if(err) res.json('Could not find URL')
    res.redirect(address.originalUrl)
  })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
