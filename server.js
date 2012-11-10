var app = require('./lib/app');

app.server.listen(app.app.get('port'), function(){
  console.log("Express server listening on port " + app.app.get('port'));
});