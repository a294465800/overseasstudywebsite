/**
 * Created by SHINING on 2017/3/19.
 */

//加载express模块
var express = require('express'),

//加载模版处理模块
    swig = require('swig'),

//加载数据库模块
    mongoose = require('mongoose'),

//加载body-parser，用来处理post提交过来的数据
    bodyParser = require('body-parser'),

//加载cookies模块
    Cookies = require('cookies'),

//创建app应用 => NodeJs Http.createServer();
    app = express();

/*
* 定义当前应用所使用的模版引擎
* 第一个参数：模版引擎的名称，同时也是模版文件的后缀；第二个参数表示用于解释处理模版内容的解释方法
* */
app.engine('html',swig.renderFile);

//设置模版文件存放的目录，第一个参数必须是views，第二个参数是目录
app.set('views','./views');

//注册所使用的模版引擎，第一个参数必须是 view engine,第二个参数和app.engine这个方法中定义的模版引擎的名称（第一个参数）是一致的
app.set('view engine','html');

/*
* 设置静态文件托管
* 当访问的url以/public开始，那么直接返回对应__dirname + '/public'下的文件
* */
app.use('/public',express.static(__dirname + '/public'));

//body-parser设置，用于接收post提交过来的数据
app.use( bodyParser.urlencoded({extended: true}));

//在开发过程当中，需要取消模版缓存，但在上线后这个缓存还是有必要的，可以让用户快速加载
swig.setDefaults({cache:false});





/*
 * 根据不同的功能划分模块，对应访问router下的不同js文件
 * */
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

//连接数据库
mongoose.connect('mongodb://localhost:27019/overseasstudywebsite',function (err) {
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        //监听http请求
        app.listen(8082);
    }
});
