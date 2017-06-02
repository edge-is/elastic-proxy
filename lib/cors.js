'use strict'

const restify = require('restify')

var cors = function (config){
  return  function (req, res, next){

    restify.CORS.ALLOW_HEADERS.push('authorization');
    var allowedMethods = [
      'POST',
      'GET',
      'DELETE',
      'PUT',
      'HEAD'
    ];
    if(req.method.toUpperCase() === "OPTIONS" ) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header("Access-Control-Allow-Headers", restify.CORS.ALLOW_HEADERS.join( ", " ));
      res.header('Access-Control-Allow-Methods', allowedMethods.join(', '));

      res.send(204);
    }
    return next();

 }
}

module.exports = cors;
