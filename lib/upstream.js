'use strict'

const async = require('async');
const request = require('request');

const upstream = function (config, log){
  var servers = config.upstreams || [{ server : 'http://localhost:9200/' }];

  servers.forEach(function (server, key){
    checkServer(server, key);
  });

  function checkServer(server, index){

    // No need to check the server if it is marked down in the config
    if (server.down) return;

    // if interval is 0 then exit..
    if (server.interval === 0) return;

    function start(){
      request({
        url : `${server.server}/_status`,
        timeout : 1000,
      }, function (err, res){

        if (err){

          if (!servers[index]._down) log.info(`Marking ${server.server} as down`);
          servers[index]._down = true;
        }else{

          if (servers[index]._down || servers[index]._down === undefined ) log.info(`Marking ${server.server} as up`);

          servers[index]._down = false;
        }
      });
    }
    // Start the check
    start();

    // Set interval on the check
    return setInterval(start, server.interval || 10000 );
  }


  // Find servers that are healty
  function getHealtyServers(){
    var arr = [];

    servers.forEach(function (server){
      if (!server.down && !server._down) arr.push(server);
    });
    return arr;
  }

  // Find server index in array based on server.server string
  function getServerIndex(server){
    var index = false;

    servers.forEach(function (upstream, key){
      if (server === upstream.server) index = key;
    })

    return index;
  }

  // Set server down based on server.server
  function setDown(server){
    var index = getServerIndex(server);
    if (index !== false){
      servers[index]._down = true;
    }
  }

  // Selects one server from available servers
  function getUpstream(){
    var upstreams = getHealtyServers();
    var r = random(0, upstreams.length );
    return upstreams[r] || {};
  }

  // Adds functions to route so it can be used to access server
  return function (req, res, next){
    // select server from ok servers;
    req.route.getUpstream = getUpstream;
    req.route.setServerDown = setDown;
    return next();
  }
}

// Just a helper function...
function random(min, max){
  return Math.floor(Math.random() * max) + min;
}

module.exports = upstream;
