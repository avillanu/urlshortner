// se'use strict';
var express = require('express');
var app = express();
try{
  var mongoose = require('mongoose');
} catch (e) {
  console.log(e);
}

var mongodb = require('mongodb');
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true});
var db = mongoose.connection;
console.log(mongoose.connection.readyState);
var router = express.Router();

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);
var Schema = mongoose.Schema;
var UrlSchema = new Schema({
    website: String
});
UrlSchema.plugin(autoIncrement.plugin, 'Url');
var Url = db.model('Url', UrlSchema);
var cors = require('cors');
// Basic Configuration
var port = process.env.PORT || 3000;
/** this project needs a db !! **/
app.use(cors());
/** this project needs to parse POST bodies **/
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/api/shorturl/new', function(req,res){
  res.sendFile(process.cwd() + '/views/new.html');
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

function createAndSaveUrl(website, done) {
var newUrl = new Url({website:website});
    newUrl.save(function(err, data){

    if(err) {
 //     return done(err);
    }
    else {

    console.log("correct path");
    Url.findOne({website:website},function(err,result){
      if(!err)
      {
      console.log(result);
      }
  //   return done(null, data);

    })};
    })}
app.post('/api/shorturl/new', function(req,res){
    if (validURL(req.body.url)){
      var newUrl = new Url({website:req.body.url});
      newUrl.save(function(err, data){
          if(err) {
       //     return done(err);
          }
          else {

          console.log("correct path");
          Url.findOne({website:req.body.url},function(err,result){
            if(err){}

            else
            {
            res.json(result);
            }
        //   return done(null, data);

        })}
      })}
     else
     { res.json({"error":"invalid URL"}) };
});

app.get("/api/shorturl/:number", function (req,res){
  Url.findOne({"_id":req.params.number}, function(err, result)
  {
    if (result.website.startsWith('http'))
      {res.redirect(result.website)}
    else
      {res.redirect('http://'+result.website)}
  }

)});
app.get("/api/getinfo/:number", function (req,res){
  Url.findOne({"_id":req.params.number}, function(err, result)
  {
    res.send(result)
  }

)});
app.listen(port, function () {
  console.log('Node.js listening ...');
});
