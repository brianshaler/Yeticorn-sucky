var ServerApp = require('./lib/app')
  , serverApp = new ServerApp();

serverApp.server.listen(serverApp.app.get('port'), function(){
  console.log("Express server listening on port " + serverApp.app.get('port'));
});