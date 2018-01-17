//对标数据库表
var db = require('../datapool');
var uuid = require('../node_modules/node-uuid');
var fastXmlParser = require('../node_modules/fast-xml-parser');
var fs = require('fs');
var nfsconfig = require('../nfsconfig.json');
var xml2js = require('../node_modules/xml2js');
var result = require('./result');
var dir = require('./makedir');
var nfsFile = require("./n_file_info");

var nfsTempFile = function() {};

nfsTempFile.prototype.SetTempFileInfo = function(fileInfo,callback) {
    var result;
    if(nfsconfig.openDatabase){
        var fileid = uuid.v1();
        var sql ="INSERT INTO n_temp_file_info (id,name,expand_name,chunk,chunks,file_size,md5,file_md5,path,create_time,status) VALUES ('"+fileid+"','"+fileInfo.filename+"','"+fileInfo.ext+"','"+fileInfo.chunk+"','"+fileInfo.chunks+"','"+fileInfo.filesize+"','"+fileInfo.md5+"','"+fileInfo.md5+"','"+fileInfo.path+"',"+Date.now()+",0)";
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql, function(err, results) {
                if (err) {
                    result.set("error","插入数据库失败。")
                    callback(result);
                    return;
                }
                fileInfo.fileid = fileid;
                result.set("success","插入分片成功",fileInfo)
                callback(result);
            });
        });
    }else {
        fs.readFile(nfsconfig.xmlPath, 'utf-8', function (err, result) {
            var jsonObj = fastXmlParser.parse(result);
            console.log('xml解析成json:' + JSON.stringify(jsonObj));
            var file = {
                id: uuid.v1(),
                expand_name: fileInfo.ext,
                file_size: fileInfo.filesize,
                name: fileInfo.filename,
                path: fileInfo.path,
                md5: fileInfo.md5,
                create_time: Date.now(),
                edit_time: null,
                description: "cs",
                key: null,
                is_period: "",
                period_server: null,
                source_type: null,
                status: 0,
                type: null
            };
            jsonObj.n_file_info.file.push(file);
            var builder = new xml2js.Builder();  // JSON->xml
            var xml = builder.buildObject(jsonObj);
            fs.writeFile(nfsconfig.xmlPath, xml, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
            console.log(xml);
        });
    }
};

nfsTempFile.prototype.ChunkExist = function (fileMd5,chunk,callback) {
    if(nfsconfig.openDatabase){
        var sql = "SELECT * FROM n_temp_file_info WHERE status=0 and md5='"+fileMd5+"' and chunk="+parseInt(chunk);
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql, function(err, results) {
                if (err) {
                    result.set("error","系统错误，可能是sql语句出错。",false);
                    // result.state = "error";
                    // result.message ="系统错误，可能是sql语句出错。";
                    // result.data = false;
                    callback(result);
                    return;
                }
                if(results[0].Count==1){
                    //数据库中存在该条记录，然后根据文件地址在此验证
                    if(fs.existsSync(results[0].path)){
                        //根据文件目录找到文件是存在的。
                        result.set("success","成功",true);
                    }else{
                        result.set("success","成功",false);
                    }
                    // result.state = "success";
                    // result.message ="成功";
                    // result.data = true;
                    callback(result);
                }else {
                    result.set("success","成功",false);
                    callback(result);
                }
            });
        });
    }else {

    }
}

nfsTempFile.prototype.MergeFile = function (fileMd5,callback){
    if(nfsconfig.openDatabase){
        var sql = "select * from n_temp_file_info where status = 0 and file_md5='"+fileMd5+"'";
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql, function(err, results) {
                if (err) {
                    result.set("error","获取文件分片信息失败。")
                    callback(result);
                    return;
                }
                if(results.length>0){
                    //以数据库为准，获取文件路径
                    var path = results[0].path.replace(results[0].chunk+"-"+results[0].chunks,"");
                    var files =fs.readdirSync(path);
                    if(files.length == results[0].chunks){
                        //如果文件数等于分片数，请求合并
                        filePath = nfsconfig.filePath+"upload/file/";
                        //确保路径存在
                        dir.mkdir(filePath);
                        filePath +=uuid.v1();
                        var size =0;
                        for (var i = 0, len = files.length; i < len; i++) {
                            fs.appendFileSync(filePath, fs.readFileSync(nfsconfig.filePath+"upload/tempfile/"+results[i].file_md5+"/"+results[i].chunk+"-"+results[i].chunks));
                            size += results[i].file_size;
                        }
                        //result.set("success","合并成功。");
                        //合并成功后入库
                        var nFile = new nfsFile();
                        var fileInfo={
                            filename:results[0].name,
                            filesize:size,
                            md5:results[0].file_md5,
                            path:filePath,
                            uploadSourcetype:"",
                            filetype:"",
                            ext:results[0].expand_name
                        };
                        nFile.SetFileInfo(fileInfo,function (result) {
                            result.message ="分片合并成功，"+result.message;
                            callback(result);
                            return;
                        })
                    }else{
                            data ={
                                successChunks:new Array(),
                                chunks:results[0].chunks,
                            };
                            for(var i=0;i<files.length;i++){
                                data.successChunks.push(files[i].Name.split('-')[0]);
                            }
                            result.set("error","分片数与分片总数不符",data);
                            callback(result);
                            return;
                    }
                }else {
                    //数据层面没有，要求用户重新上传以便写入数据库
                    result.set("error","获取文件分片数量为零。");
                    callback(result);
                    return;
                }
                //result.set("success","插入分片成功",fileInfo)
                //callback(result);
            });
        });
    }else {


    }
};

module.exports = nfsTempFile;