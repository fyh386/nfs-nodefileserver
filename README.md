# nfs-nodefileserver

## 一个基于node.js的文件服务，可作为中小型项目的文件服务，目前完成了，文件上传，文件分片上传，文件合并等功能，数据库方面用的是mysql，前端的上传插件调用的是百度的webuploader当然你也可以使用其他的三方插件或是直接表单提交文件都是OK的，具体的API文件将在一周内开放，目前只是测试版本还有大概40%的方法尚未完成，不影响基础的使用流程。

## 本项目是本人用作学习node.js的项目肯定有很多不足之处，所以希望尽早开放出来多听一些意见来改进学习，此外不接受任何负面的评论，项目将采用mpl开源协议，只求使用者声明该部分是使用该项目的即可，使用用户多的话会开一个单独的站点来说明。QQ:290341190欢迎加好友一起讨论

## 开始使用

### 1、首先你要确保你的服务器已经包含了Node.js的运行环境
### 2、在项目路径下public/database/nfs_nodefileserver.sql,是Mysql的创建数据库的SQL语句，执行完成后在根目录下的nfsconfig.json中进行数据库配置，如下：
```json
"openDatabase": true,
 "poolContent":{
    "host"     : "localhost",
    "user"     : "root",
    "password" : "root",
    "port": "3306",
    "database": "nfs_nodefileserver"
  },
```

### 3、之后就可以启动项目并访问端口号3000来进行整个文件服务的测试

### 4、进入页面后，只点击上传按钮选择文件后即完成上传功能，此时会在nfsconfig.json配置文件中设置的filePath的位置将上传的文件保存至此处。在返回内容中拷贝fileid(文件id)至需下载的FileID的input框中点击下载按钮即完成了整个上传下载的流程。
![](http://97.64.36.122:886/wp-content/uploads/2018/01/QQ截图20180117131536.png)

## API使用文档

### nfs提供了一个基础的文件上传的方法：uploadsimplefile。使用者将文件以post请求的方式进行提交，允许使用三方插件，本项目就是以webuploader作为基础的测试插件来进行使用的。必要的参数是md5,选择参数为uploadSourceType（INT型，上传来源，如果项目用到的地方多的话可以传该参数），fileType(INT型，文件类型，或者说是用途，标签之类的：娱乐、游戏、视频等)。返回结果如上图所示。

### nfs提供了一个文件分片上传的方法：uploadchunkfile。该方法是基于前端已经进行了分片处理，据我所知webuploader,uploadfy等都是包含分片方法的。在测试页面中点击开启分片后，文件就以分片的形式进行上传，分片大小为2M每个。由于大文件的md5值计算较慢，在短时间内会提供本人之前用的一种方式。

### nfs提供了一个文件下载的方法：downLoadFiles。

# 以下是将要解决或已经结局的部分

##可能存在的问题：module的安装在当前项目中无法安装，所有后续安装的module都是从另一个项目中拷过来的。所以暂时package.json的是没有包括的，等后续手动加进去不知道会不会有问题
##文件下载，比如下载请求数大于5时拒绝后续请求，日志系统，文件放满，跨域，分布式
##整个错误的回调机制
##在文件分片上传过程中若发现该文件存在于数据库表中，而该目录地址下不存在该文件，暂时验证时为文件不存在，即可以上传。整个逻辑肯定会出现bug，不过当不存在人为对文件或
数据库进行操作时不会出现问题。
##暂时前端页面不支持多个文件一起分片上传，因为我还做不到根据文件传md5值，现在的md5是一样传上来的。
##基于安全考虑一开始上传的文件就是不带后缀的，这次连文件名中也不再包含任何文件信息以"chunk-chunks"的格式来存放。
