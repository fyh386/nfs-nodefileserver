var mysql  = require('mysql');
var nfsconfig = require('./nfsconfig.json');
var pool = mysql.createPool(nfsconfig.poolContent);
exports.pool = pool;
