'use strict'
const request = require('request');
const restifyErrors = require('restify-errors');
const async = require('async');

function isIn(item, array){

  if (!Array.isArray(array))  return false;

  if (array.indexOf(item) > -1) return true;

  return false;

}
function isWildcard(array){
  return isIn('*', array);
}

function checkIfAllowedToResource(requested, jwt, resourceType){
  if (isWildcard(jwt[resourceType])) return true;

  if (isIn(requested[resourceType], jwt[resourceType])) return true;

  return false;
}

const json = {
  parse : function (string){
    try {
      return JSON.parse(string);
    } catch (e) {
      return string;
    }
  },
  stringify : function (object){
    try {
      return JSON.stringify(object);
    } catch (e) {
      return string;
    }
  }
}



var proxy = function (req, res, next){
    var path = req.path();
    var errorReason = "BadGatewayError";
    proxyRequest({
      json : req.body,
      method : req.route.method,
      _queryString : req.getQuery()
    }, function (err, upstreamResponse){

      if (err){
        return next(
          new restifyErrors.InternalServerError(err)
        );
      }

      res.send(upstreamResponse.statusCode, json.parse(upstreamResponse.body));
      return next();
    });

    function proxyRequest(params, callback){
      var server = req.route.getUpstream();

      if (!server.server) {
        return next(

          new restifyErrors[errorReason]('No servers available')
        );

      }

      params.timeout = server.timeout || 5000;

      params.uri = `${server.server}${path}?${params._queryString}`;

      request(params, function (err, upstreamResponse){
        if (err){
          switch (err.code) {
            case 'ECONNREFUSED':
              errorReason = "BadGatewayError";
              break;
            case 'ETIMEDOUT':
              errorReason = "GatewayTimeoutError";
              break;
            case 'ESOCKETTIMEDOUT':
              errorReason = "GatewayTimeoutError";
              break;
            default:

          }

          if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT"){
            req.route.setServerDown(server.server);

            return proxyRequest(params, callback);
          }

        }

        callback(err, upstreamResponse)
      })
    }

}

module.exports = proxy;
