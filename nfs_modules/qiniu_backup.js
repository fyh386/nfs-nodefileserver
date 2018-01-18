
var qiniu = require('../node_modules/qiniu');
var nfsconfig = require('../nfsconfig.json');

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = nfsconfig.fileBackup.accessKey;
qiniu.conf.SECRET_KEY = nfsconfig.fileBackup.secretKey;

var fileBack = function() {};

fileBack.prototype.uptoken = function(bucket,key,callback) {
    var options = {
        scope: bucket + ":" + key
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    callback(putPolicy.uploadToken());
    return;
};

fileBack.prototype.uploadFile = function(uptoken,key,localFile,callback) {
    var extra = new qiniu.form_up.PutExtra();
    var FormUploader = new qiniu.form_up.FormUploader();
    FormUploader.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
            // 上传成功， 处理返回值
            callback(ret.hash+ret.key+ ret.persistentId);
        } else {
            // 上传失败， 处理返回代码
            callback(err);
        }
    });
};



module.exports = fileBack;