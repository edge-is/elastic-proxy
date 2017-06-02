var elasticProxy = require('./lib/server.js');

var config = require('./config.js')


var server = elasticProxy(config);
server.listen(3000, function (){
  console.log('Server started')
});
