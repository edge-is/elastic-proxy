'use strict'
const restify = require('restify');
const jwtParser = require('./jwt-parser.js')
const routes = require('./routes.js')
const bunyan = require('bunyan');

const upstream = require('./upstream.js');
const cors = require('./cors.js');


function elasticProxy(config){

  var logConfig = config.log || { name: 'elastic-proxy', stream: process.stdout };
  var log = bunyan.createLogger(logConfig);
  var server = restify.createServer();

  server.pre(cors(config));
  server.use(restify.bodyParser());
  server.use(restify.requestLogger());
  server.use(restify.fullResponse());

  server.use(jwtParser(config));

  server.use(upstream(config, log));


  server.use(function (req, res, next){
    res.charSet('utf-8');
    return next();
  });


  server = routes(config, server);

  /*server.on('after', restify.auditLogger({
    log: log
  }));*/



  return server;
}



module.exports = elasticProxy;
