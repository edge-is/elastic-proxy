'use strict'


var jws = require('jsrsasign').jws;

var restifyErrors = require('restify-errors');

function verify(token, secret, algorithm){
  var defaultAlg = { alg : ["HS256"]};
  algorithm = algorithm || defaultAlg;
  try {
    const valid = jws.JWS.verifyJWT(token, secret, algorithm);
    return valid;
  } catch (e) {
    return false;
  }
}

function dummiValidate(jwt, callback){
  return callback(null, true);
}

function jwtParser (config){


  var validate = config.jwt.validate || dummiValidate;

  return function (req, res, next){

    if (req.route.jwtRequired === false) return next();


    var authorization = req.headers['authorization'];

    var token = authorization.split(' ').pop();


    if (!authorization) return next(
      new restifyErrors.UnauthorizedError('No Bearer JWT token')
    );

    const valid = verify(token, config.jwt.secret, config.jwt.alg);

    // check if token is valid
    if (!valid) return next(
      new restifyErrors.ForbiddenError('Token not valid')
    );

    // parse the token into a object
    const JWT_TOKEN = jws.JWS.parse(token);

    // time now in ms
    var now = new Date().getTime();

    // is expired ?
    if (now > JWT_TOKEN.payloadObj.exp){
      return next(
        new restifyErrors.ForbiddenError('Token expired')
      );
    }

    if (!JWT_TOKEN.payloadObj.id){
      return next(
        new restifyErrors.ForbiddenError('Cannot get client id')
      );
    }

    // Validate it against something..
    validate(JWT_TOKEN, function tokenValidate(err, res){
      if (err) {
        req.log.error('Token not vaild from callback');

        return next(
          new restifyErrors.ForbiddenError('Token not valid')
        );
      }

      req.route.JWT_TOKEN = JWT_TOKEN;
      return next();
    })
    // inject the JWT payload into route

  }

}


module.exports = jwtParser;
