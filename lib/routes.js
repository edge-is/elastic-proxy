
const restify = require('restify');
var proxy = require('./proxy.js')
var auth = require('./authenticate.js')


var fs = require('fs');

function serveStatic(req, res, next){
  var file = fs.readFile('./static/index.html', function (err, content){
    if (err) return next(err);
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(content);
    next();
  })
}


var routes = function (config, server){

  config = config || {};
  var prefix = config.prefix || "";

  // FIXME: Temp shit for static test page
  //server.get({ jwtRequired : false, path : prefix + '/' }, serveStatic);

  // jwtRequired : Is jwt required?
  // path : the path to resource
  // auth : authenticaiton handler
  // proxy : proxy Handler
  server.post({ jwtRequired : true, path : prefix + '/:index' }, auth, proxy);
  server.post({ jwtRequired : true, path : prefix + '/:index/:type' }, auth, proxy);
  server.post({ jwtRequired : true, path : prefix + '/:index/:type/:action' }, auth, proxy);
  server.get({  jwtRequired : true, path : prefix + '/:index' }, auth, proxy);
  server.get({  jwtRequired : true, path : prefix + '/:index/:type' }, auth, proxy);
  server.get({  jwtRequired : true, path : prefix + '/:index/:type/:action' }, auth, proxy);
  server.put({  jwtRequired : true, path : prefix + '/:index' }, auth, proxy);
  server.put({  jwtRequired : true, path : prefix + '/:index/:type' }, auth, proxy);
  server.put({  jwtRequired : true, path : prefix + '/:index/:type/:action' }, auth, proxy);
  server.del({  jwtRequired : true, path : prefix + '/:index' }, auth, proxy);
  server.del({  jwtRequired : true, path : prefix + '/:index/:type' }, auth, proxy);
  server.del({  jwtRequired : true, path : prefix + '/:index/:type/:action' }, auth, proxy);
  server.head({  jwtRequired : true, path : prefix + '/:index' }, auth, proxy);
  server.head({  jwtRequired : true, path : prefix + '/:index/:type' }, auth, proxy);
  server.head({  jwtRequired : true, path : prefix + '/:index/:type/:action' }, auth, proxy);

  return server;
}

module.exports = routes;
