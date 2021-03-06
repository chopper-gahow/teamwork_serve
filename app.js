var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var router = require('./router')
var bodyParser = require('body-parser')
let app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

// 创建服务器应用程序
//      也就是原来的http.createServer();

// 公开指定目录
// 只要通过这样做了，就可以通过/public/xx的方式来访问public目录中的所有资源

app.all('*', function(req, res, next) {
  if( req.headers.origin == 'http://localhost:8080' || req.headers.origin == 'http://localhost:8081' ){
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'POST, GET');
      res.header("Access-Control-Allow-Credentials", "true"); 
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      //res.header('Access-Control-Allow-Headers', 'Content-Type',token);
      res.header('Access-Control-Allow-Headers', 'request-origin,Content-Type,token, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  }
  next();
});
//模板引擎在Express中开放模板也是一个API的事

app.use(session({
  // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'itcast',
  resave: false,
  saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

// 把路由挂载到 app 中
app.use(router)

// 配置一个处理 404 的中间件
app.use(function (req, res) {
  //res.render('404.html')
})

// 相当于server.listen
app.listen(6767,function(){
    console.log('服务在6767端口已经启动');
})