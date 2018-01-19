var fs = require('fs');
var nfsFile = require("./n_file_info");

var archiver = require("../node_modules/archiver");

var nfsTempFile = require("./n_temp_file_info");

var qiNiuBack = require("./qiniu_backup");

var oss = require("./ali_backup");

var nfsconfig = require('../nfsconfig.json');

var nfs = {
    //简单的上传方法,该方法不支持文件秒传和文件续传file:文件信息,由中间件生成 md5：MD5 uploadSourceType：文件来源类型，即用于判别文件从何处来 fileType：文件类型，不是文件后缀，用于分类如-娱乐，学习等
    uploadSimpleFile :function(file,md5,uploadSourceType,fileType,callback){
        //如果开启了数据库就在数据库中进行数据存储，否则就在xml中进行存储
        var nFile = new nfsFile();
        var fileInfo={
                filename:file.originalname.substring(0,file.originalname.lastIndexOf(".")),
                filesize:file.size,
                md5:md5,
                path:file.path.replace(/\\/g,'\/'),
                uploadSourcetype:uploadSourceType,
                filetype:fileType,
                ext:file.originalname.substring(file.originalname.lastIndexOf(".") + 1)
            };
         nFile.SetFileInfo(fileInfo,function (result) {
             callback(result)
         });
    },
    //文件分片上传
    uploadChunkFile:function(file,md5,chunk,chunks,uploadSourceType,fileType,callback){
        var nFile = new nfsTempFile();
        var fileInfo={
            chunk:chunk,
            chunks:chunks,
            filename:file.originalname.substring(0,file.originalname.lastIndexOf(".")),
            filesize:file.size,
            md5:md5,
            path:file.path.replace(/\\/g,'\/'),
            uploadsourcetype:uploadSourceType,
            filetype:fileType,
            ext:file.originalname.substring(file.originalname.lastIndexOf(".") + 1)
        };
        nFile.SetTempFileInfo(fileInfo,function (result) {
            callback(result);
        });
    },
    //根据文件id获取文件信息，多个文件id以逗号隔开
    getFilesInfo:function (fileIds,callback) {
        var nFile = new nfsFile();
        nFile.GetFileInfo(fileIds.split(','),function (result) {
            callback(result);
        });
    },
    //根据分片id获取分片信息，多个分片id以逗号隔开
    getChunkInfo:function (fileIds,callback) {
        var nFile = new nfsTempFile();
        nFile.GetChunkInfo(fileIds,function (result) {
            callback(result);
        });
    },
    //根据关键词模糊获取文件信息
    getFilesInfoByKeyword:function (keyword) {
        var nFile = new nfsFile();
        nFile.getFilesInfoByKeyword(keyword,function (result) {
            callback(result);
        });
    },
    //根据文件id获取文件的byte流，不支持多个文件，大文件也可能会导致崩溃没有试过
    getFileByte:function (fileid) {

    },
    //合并文件
    mergeFile:function(md5,callback){
        var nFile = new nfsTempFile();
        nFile.MergeFile(md5,function (result) {
            callback(result);
            return;
        })
    },
    //根据文件id删除文件，这里用到了nfsconfig中的是否物理删的参数
    deleteFiles:function (fileIds,callback) {
        var nFile = new nfsFile();
        nFile.DeleteFile(fileIds,function (result) {
            callback(result);
        });
    },
    deleteChunks:function (chunkIds,callback) {
        var nFile = new nfsTempFile();
        nFile.deleteChunks(chunkIds,function (result) {
            callback(result);
        });
    },
    //根据文件id下载文件， fileIds:文件id,多个文件以逗号隔开 isZip：是否压缩包形式下载，多个文件自动多个文件下载
    downLoadFiles:function (fileIds,isZip) {

    },
    //XML文件入库，适用于之前没有开启数据库后来才开启数据库的导入工作，或者是其它库文件的导入
    convertXMLToDatabase:function(){

    },
    //同上，用于数据库导出成xml
    convertDatabaseToXml:function(){

    },
    //判断文件是否存在，用于文件秒传之类的
    fileExist:function (md5,callback) {
        var nFile = new nfsFile();
        nFile.FileExist(md5,function (result) {
            callback(result);
        })
    },
    chunkExist:function (md5,chunk,callback) {
        var nFile = new nfsTempFile();
        nFile.ChunkExist(md5,chunk,function (result) {
            callback(result);
        })
    },
    fileBackUpByQiNiu:function (callback) {
        var backObj = new qiNiuBack();
        //要上传的空间
        bucket = nfsconfig.fileBackup.storageName;
        //上传到七牛后保存的文件名
        key = '19e16a00-fb2e-11e7-87a5-2d8e545e26ee';
        //要上传文件的本地路径
        filePath = nfsconfig.filePath+"upload/file/19e16a00-fb2e-11e7-87a5-2d8e545e26ee";
        backObj.uptoken(bucket,key,function (results) {
            backObj.uploadFile(results,key,filePath,function (results) {
                callback(results);
            })
        })
    },
    fileBackUpByAli:function (callback) {
        var backObj = new oss();
        //要上传文件的本地路径
        filePath = nfsconfig.filePath+"upload/file/19e16a00-fb2e-11e7-87a5-2d8e545e26ee";
        backObj.uploadFile(filePath,function (results) {
            callback(results);
        })
    },
    //压缩文件用于下载时的文件压缩
    compressFiles:function (fileIds,callback) {
        var nFile = new nfsFile();
        var files = new Array();
        nFile.GetFileInfo(fileIds,function (results) {
            var zipPath =nfsconfig.zipFilePath+ 'test.zip';
            //创建一最终打包文件的输出流
            var output = fs.createWriteStream(zipPath);
            output.on('close', function() {
                callback(zipPath);
            });
            //生成archiver对象，打包类型为zip
            var zipArchiver = archiver('zip');
            //将打包对象与输出流关联
            zipArchiver.pipe(output);
            for(var i=0; i < results.data.length; i++) {
                console.log(files[i]);
                //将被打包文件的流添加进archiver对象中
                zipArchiver.append(fs.createReadStream(results.data[i].path), {'name': results.data[i].name+"."+results.data[i].expand_name});
            }
            //打包
            zipArchiver.finalize();
        });
    }
}

module.exports = nfs;