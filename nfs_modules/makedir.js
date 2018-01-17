//循环创建文件夹，http://blog.csdn.net/a6383277/article/details/11927175
var fs = require('fs');
var path = require('path');

var dir = {
    mkdir:function (dirpath,dirname) {
        //判断是否是第一次调用
        if(typeof dirname === "undefined"){
            if(fs.existsSync(dirpath)){
                return;
            }else{
                dir.mkdir(dirpath,path.dirname(dirpath));
            }
        }else{
            //判断第二个参数是否正常，避免调用时传入错误参数
            if(dirname !== path.dirname(dirpath)){
                dir.mkdir(dirpath);
                return;
            }
            if(fs.existsSync(dirname)){
                fs.mkdirSync(dirpath)
            }else{
                dir.mkdir(dirname,path.dirname(dirname));
                fs.mkdirSync(dirpath);
            }
        }
    }
}

module.exports = dir;