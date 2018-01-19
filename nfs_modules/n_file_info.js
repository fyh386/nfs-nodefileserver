//对标数据库表
var db = require('../datapool');
var uuid = require('../node_modules/node-uuid');
var fastXmlParser = require('../node_modules/fast-xml-parser');
var fs = require('fs');
var nfsconfig = require('../nfsconfig.json');
var xml2js = require('../node_modules/xml2js');
var result = require('./result');
var nfsFile = function() {};

//设置文件信息
nfsFile.prototype.SetFileInfo = function(fileInfo,callback) {
    if(nfsconfig.openDatabase){
        var fileid = uuid.v1();
        var sql ="INSERT INTO n_file_info (id,name,expand_name,file_size,md5,path,create_time,status) VALUES ('"+fileid+"','"+fileInfo.filename+"','"+fileInfo.ext+"','"+fileInfo.filesize+"','"+fileInfo.md5+"','"+fileInfo.path+"',"+Date.now()+",0)";
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
                result.set("success","插入文件成功",fileInfo)
                callback(result);
                return;
            });
        });
    }else {
        fs.readFile(nfsconfig.xmlPath,'utf-8',function(err,result){
            var jsonObj = fastXmlParser.parse(result);
            console.log('xml解析成json:'+JSON.stringify(jsonObj));
            var file={
                id:uuid.v1(),
                expand_name:fileInfo.ext,
                file_size:fileInfo.filesize,
                name:fileInfo.filename,
                path:fileInfo.path,
                md5:fileInfo.md5,
                create_time:Date.now(),
                edit_time:null,
                description:"cs",
                key:null,
                is_period:"",
                period_server:null,
                source_type:null,
                status:0,
                type:null
            };
            if(!jsonObj.n_file_info){
                jsonObj.n_file_info = new Array();
            }
            if(!jsonObj.n_file_info.file){
                jsonObj.n_file_info.file = new Array();
            }
            jsonObj.n_file_info.file.push(file);
            var builder = new xml2js.Builder();  // JSON->xml
            var xml =  builder.buildObject(jsonObj);
            fs.writeFile(nfsconfig.xmlPath, xml,  function(err) {
                if (err) {
                    return console.error(err);
                }
            });
            console.log(xml);
        });
    }
};
//删除文件
nfsFile.prototype.DeleteFile = function(fileIds,callback){
    if(nfsconfig.openDatabase){
        var fileIds = fileIds.split(',').join("','");
        var sql ="update n_file_info set status =1 where id in ('"+fileIds+"')";
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql,function(err, results) {
                if (err) {
                    result.set("error","删除文件失败。");
                    callback(result);
                    return;
                }
                result.set("success","删除文件成功。",results);
                //如果允许物理删除
                if(nfsconfig.canPhysicalDelete){
                    var sql1 ="select * from n_file_info where id in ('"+fileIds+"')";
                    connection.query(sql1,function(err, results) {
                        if (err) {
                            result.set("error","删除文件成功，获取删除文件信息时失败。");
                            callback(result);
                            return;
                        }
                        for(var i=0;i<results.length;i++){
                            fs.unlinkSync(results[i].path,function (results) {
                                result.message +="删除文件id:"+results[i].id+"时出错，地址为："+results[i].path;
                            })
                        }
                        //到这里删除文件结束
                        result.message+="--文件物理删完成。"
                    });
                }
                callback(result);
            });
        });
    }else{

    }
};
//获取文件信息
nfsFile.prototype.GetFileInfo = function(fileIds,callback){
    if(nfsconfig.openDatabase){
        var fileIds = fileIds.join("','");
        var sql ="select * from n_file_info where id in ('"+fileIds+"')";
        //var sql = "select * from n_file_info where id in ('6ff8d240-fb2c-11e7-b162-2b923e671e29','f161e6a0-fa8c-11e7-abd6-7f16b36b493c')"
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql,function(err, results) {
                if (err) {
                    result.set("error","获取文件信息失败。")
                    callback(result);
                    return;
                }
                result.set("success","获取文件信息成功。",results)
                callback(result);
            });
        });
    }else{

    }
};
//根据关键字获取文件信息
nfsFile.prototype.getFilesInfoByKeyword = function(fileIds,callback){
    if(nfsconfig.openDatabase){
        var fileIds = fileIds.join("','");
        var sql ="select * from n_file_info where id in ('"+fileIds+"')";
        //var sql = "select * from n_file_info where id in ('6ff8d240-fb2c-11e7-b162-2b923e671e29','f161e6a0-fa8c-11e7-abd6-7f16b36b493c')"
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql,function(err, results) {
                if (err) {
                    result.set("error","获取文件信息失败。")
                    callback(result);
                    return;
                }
                result.set("success","获取文件信息成功。",results)
                callback(result);
            });
        });
    }else{

    }
};
//修改文件信息
nfsFile.prototype.ModifyFileInfo = function(fileInfo){
    if(openDatabase){
        var fileIdList = fileIds.split(",");
        var sql ="INSERT INTO n_file_info (id,name,expand_name,file_size,md5,path,create_time,status) VALUES ('"+uuid.v1()+"','"+fileInfo.filename+"','"+fileInfo.ext+"','"+fileInfo.filesize+"','"+fileInfo.md5+"','"+fileInfo.path+"',"+Date.now()+",0)";
        // get a connection from the pool
        db.pool.getConnection(function(err, connection) {
            // make the query
            connection.query(sql, function(err, results) {
                if (err) {
                    return false;
                }
                return true;
            });
        });
    }else{

    }
};
//根据md5判断文件是否存在
nfsFile.prototype.FileExist = function(fileMd5,callback){
    if(nfsconfig.openDatabase){
        var sql = "SELECT * FROM n_file_info WHERE status=0 and md5='"+fileMd5+"'";
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
                if(results[0].Count>=1){
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
    }else{

    }
};

module.exports = nfsFile;