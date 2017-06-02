'use strict'
var restifyErrors = require('restify-errors');
var async = require('async');

function isIn(item, array){

  if (!Array.isArray(array))  return false;

  if (array.indexOf(item) > -1) return true;

  return false;

}
function isWildcard(array){
  return isIn('*', array);
}

function checkIfAllowedToResource(requested, jwt, resourceType){
  if (requested[resourceType] === null) return true;

  if (isWildcard(jwt[resourceType])) return true;

  if (isIn(requested[resourceType], jwt[resourceType])) return true;

  return false;
}
function getHostname(hostHeader){
  if (hostHeader.indexOf(':') > -1){
    return hostHeader.split(':')[0];
  }
  return hostHeader;
}


function authenticate(req, res, next){

  var path = req.path();
  var requested = {};


  //req.log.debug(req)
  requested.index  = req.params.index;
  requested.type   = req.params.type;
  requested.action = req.params.action;
  requested.method = req.route.method;
  requested.server = getHostname(req.headers.host);

  // hack to allow get a document
  // requested.action is set to null, if null then will just ignore it 

  if (requested.method === "GET" && requested.action){
    if (requested.action.charAt(0) !== '_'){
      requested.action = null;
    }
  }


  var jwt = req.route.JWT_TOKEN.payloadObj;

  var toCheck = Object.keys(requested);
  async.forEach(toCheck, function (item, next){
    var j = JSON.stringify(jwt);
    var err = (checkIfAllowedToResource(requested, jwt, item)) ? null : `Action ${item}::${j}`;

    next(err);

  }, function (err){

    if (err){
      req.log.debug('JWT:', JSON.stringify(jwt, null, 2))
      req.log.error(`Auth error, accessing forbidden resource: "${err}"`)
      return next(
        new restifyErrors.ForbiddenError({
          message : `You are not allowed to access resource at ${path}`
        })
      );
    }

    return next();
  });
}

module.exports = authenticate;
