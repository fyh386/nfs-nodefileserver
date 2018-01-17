var express = require('express');
var multer = require('multer/index');
var nfs = require('../nfs_modules/nfs');
var dir = require('../nfs_modules/makedir');
var nfsconfig = require('../nfsconfig.json');
var uuid = require('../node_modules/node-uuid');
var router = express.Router();
var fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var filemd5 =req.body.md5;
        var str ="";
        if(req.originalUrl=="/uploadsimplefile"){
            str = (nfsconfig.filePath+"upload/file/").toString();
            dir.mkdir(str);
            cb(null,str);
        }else{
            str = (nfsconfig.filePath+"upload/tempfile/"+filemd5+"/").toString();
            dir.mkdir(str);
            cb(null,str);
        }
    },
    filename: function (req, file, cb) {
        var filemd5 =req.body.md5;
        var chunk = req.body.chunk;
        var chunks = req.body.chunks;
        if(req.originalUrl=="/uploadsimplefile"){
            cb(null, uuid.v1().toString());
        }else{
            cb(null,chunk+"-"+chunks);
        }
    }
})

function fileFilter (req, file, cb) {
    var filemd5 =req.body.md5;
    var chunk =req.body.chunk;
    //首先判断文件是否存在
    nfs.fileExist(filemd5,function (result) {
        if(result.state=="error"){
            cb(new Error(result.message))
        }
        if(result.data){
            //文件存在，拒绝该文件
            cb(null,false);
        }else{
            nfs.chunkExist(filemd5,chunk)
            cb(null, true)
        }
    });
    //再判断，分片文件是否存在
}

router.post('/uploadsimplefile',multer({storage:storage}).array('file'),function (req,res,next) {
    var filemd5 =req.body.md5;
    if(!filemd5){filemd5=uuid.v4()};
    var filetype ="123";
    var uploadSourceType =req.body.uploadSourceType;
    if(req.files.length!=0){
        nfs.uploadSimpleFile(req.files[0],filemd5,uploadSourceType,filetype,function (result) {
            res.send(result);
        });
    }else {
        res.send("error:上传的文件数为零！");
    }
});

router.post('/uploadchunkfile',multer({storage:storage}).array('file'),function (req,res,next) {
    var filemd5 =req.body.md5;
    var chunk = req.body.chunk;
    var chunks = req.body.chunks;
    var uploadSourceType =req.body.uploadSourceType;
    if(req.files.length!=0){
         nfs.uploadChunkFile(req.files[0],filemd5,chunk,chunks,uploadSourceType,"123",function (result) {
            console.log(result);
            res.send(result);
        });
    }else {
        res.send("error:上传的文件数为零！");
    }
});

router.get('/getFilesInfo',function (req,res,next) {
    var fileIds = req.body.fileIds;
    if(!!fileIds){


    }
});

router.use('/downLoadFiles',function (req,res,next) {
    var fileIds = req.query.fileIds.split(',');
    var isZip = req.query.isZip;
    if(!!fileIds){
        //文件数大于1自动压缩下载
        if(fileIds.length>1){


        }else{
            //参数为空或为false单个文件都不压缩
            if(isZip=="true"){


            }else {
                nfs.getFilesInfo(fileIds,function (fileInfo) {
                    var filePath =fileInfo.path ;
                    var stats = fs.statSync(filePath);
                    if(stats.isFile()){
                        res.set({
                            'Content-Type': 'application/octet-stream',
                            'Content-Disposition': 'attachment; filename='+encodeURI(fileInfo.name+"."+fileInfo.expand_name),
                            'Content-Length': stats.size
                        });
                        fs.createReadStream(filePath).pipe(res);
                    } else {
                        res.end(404);
                    }
                });
            }
        }
    }
})

router.get('/fileExist',function (req,res) {
    var filemd5 = req.query.md5;
    nfs.fileExist(filemd5,function (result) {
        res.send(result);
    });
})

router.get('/chunkExist',function (req,res) {
    var filemd5 = req.query.md5;
    var chunk = req.query.chunk;
    nfs.chunkExist(filemd5,chunk,function (result) {
        res.send(result);
    });
})

router.get('/mergeFile',function (req,res) {
    var filemd5 = req.query.md5;
    nfs.mergeFile(filemd5,function(result){
        res.send(result);
        return;
    })
})

module.exports = router;
