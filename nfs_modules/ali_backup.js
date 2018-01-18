
var oss  = require('../node_modules/ali-oss');
var co =  require('../node_modules/co');
var nfsconfig = require('../nfsconfig.json');

//需要填写你的 Access Key 和 Secret Key
var client  = oss({
    accessKeyId: nfsconfig.fileBackup.accessKey,
    accessKeySecret: nfsconfig.fileBackup.secretKey,
    bucket: 'nfs-file-back'
});


var oss = function() {};

oss.prototype.uploadFile = function (filePth,callback) {
    co(function* () {
        var result = yield client.put('test', filePth);
        callback(result)
    }).catch(function (err) {
        callback(err)
    });
}



module.exports = oss;