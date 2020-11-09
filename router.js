var express=require('express');
var router= express.Router();
const qiniu = require("qiniu");
var session=[];
const User = require('./models/user');
const Notice = require('./models/notice');
const Jur = require('./models/jur');
const Role = require('./models/role');
const Study = require('./models/study');
const FeedBack = require('./models/feedback')
const Class = require('./models/class')
const { writer } = require('repl');
const { ifError } = require('assert');
const { insertMany } = require('./models/user');
const server = require('server')
const superagent = require("superagent");
const http       = require("http");
const path       = require("path");
const url        = require("url");
const fs         = require("fs");

const { response, request } = require('express');

//登录接口
router.get('/login/userlogin',(req,res)=>{
  var body=req.query
	User.findOne({
		username:body.username,
		password  :body.password
	},(err,user)=>{
		if(err){
			res.send("err!")
		}
		if(!user){
			  res.send("no!")
		}else{
    var isLogin = session.filter(item=>{
      return item.username == user.username
    })
    req.session.user = user;
    if (isLogin.length == 0){
      session[session.length]=req.session.user;
      console.log(body.username+'登陆了');
      res.json({
        "code":200, 
        "msg":"登录成功",
        "data":{
          id:user._id,
          username:body.username,
          password:body.password,
          realname:user.realname,
          headimg:user.headimg,
          role:user.role,
          jurisdiction:user.jur
        }
      })
    }
    else{
      res.json({
        "msg":"登录失败，用户已经登陆",
      })
    }
    
		}
	})
})
//退出登陆
router.get('/login/outlogin',(req,res)=>{
  var body = req.query
  var idx
  issession = session.filter((item,index)=>{
    if(item.username == body.username){ 
      idx = index
    }
    return item.username == body.username
  })
  if(issession.length!==0){
    session.splice(idx,1) 
    console.log(body.username+"退出了");
    res.json({ 
      "code":200,
      "msg":"退出成功",
      "data":"ok"
    })
  }
  else{
    res.json({ 
      "msg":"退出失败",
      "data":"no"
    })
  }
})
router.get('/login/outloginbyid',(req,res)=>{
  console.log(req.query);
  var body = req.query
  var idx
  issession = session.filter((item,index)=>{
    if(item._id == body.id){ 
      idx = index
    }
    return item._id == body.id
  })
  if(issession.length!==0){
    session.splice(idx,1) 
    console.log("退出了");
    res.json({ 
      "code":200,
      "msg":"退出成功",
      "data":"ok"
    })
  }
  else{
    res.json({ 
      "msg":"退出失败",
      "data":"no"
    })
  }
})
//查询用户
router.get('/person/finduserbyid',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length != 0){
    User.find({
      _id: req.session.user._id
    },(err,rut)=>{
      if (err) {
        res.json({
          "data":"error"
        })
      }
      else{
        res.json({
          "code":200, 
          "msg":"查询成功",
          "data":rut,
        })
      }
    })
  }
})
//用户注册接口
router.get('/register/userRegister',(req,res)=>{
	var body=req.query
	var user = new User({
	username: body.username,
  password: body.password,
  realname: body.realname,
  role:'学生',
  jurisdiction:[],
  headimg:'http://hchopper.top/123.jpg',
		});
			User.findOne({
					username:body.username,
					password:body.password,
				},(err,r)=>{
					if (err) {
						res.send("err!")
					}
					if(!r){
							user.save(function(err, ret) {
							if (err) {
								console.log('保存失败',err);
								res.send("注册失败")
							} else {
								console.log('保存成功');
								console.log(ret);
								res.json({
								"code":200,
								"msg":"注册成功"	
							})
							}
						}); 
					}else{
						 res.json({
               "msg":"这个用户名已经被注册过啦！",
               "code":201
						 })
					}
				})
})
//管理员注册
router.get('/register/adminRegister',(req,res)=>{
	var body=req.query
	var user = new User({
	username: body.username,
  password: body.password,
  realname: body.realname,
  role:'管理员',
  jurisdiction:[],
  headimg:'http://hchopper.top/123.jpg',
		});
			User.findOne({
					username:body.username,
					password:body.password,
				},(err,r)=>{
					if (err) {
						res.send("err!")
					}
					if(!r){
							user.save(function(err, ret) {
							if (err) {
								console.log('保存失败',err);
								res.send("注册失败")
							} else {
								console.log('保存成功');
								console.log(ret);
								res.json({
								"code":200,
								"msg":"注册成功"	
							})
							}
						}); 
					}else{
						 res.json({
               "msg":"这个用户名已经被注册过啦！",
               "code":201
						 })
					}
				})
})
//添加权限
router.get('/jurisdiction/addjurisdiction',(req,res)=>{
    var j = new Jur({
    name: req.query.name,
    level: req.query.level,
    describe: req.query.describe,
    usable: req.query.usable,
    });
    Jur.findOne({
            name:req.query.name,
          },(err,r)=>{
            if (err) {
              res.send("err!")
            }
            if(!r){
              j.save(function(err, ret) {
                if (err) {
                  res.send("注册失败")
                } else {
                  console.log(ret);
                  res.json({
                  "code":200,
                  "msg":"权限新建成功"	
                })
                }
              }); 
            }else{
               res.json({
                 "msg":"这个权限已经存在！",
                 "code":201
               })
            }
          })
})
//添加角色
router.post('/role/addrole',(req,res)=>{
  var role = new Role({
    name: req.body.name,
    jur: req.body.jur,
    describe: req.body.describe,
    usable: "不可用",
    });
    Role.findOne({
            name:req.body.name,
          },(err,r)=>{
            if (err) {
              res.send("err!")
            }
            if(!r){
              role.save(function(err, ret) {
                if (err) {
                  res.send("角色新建失败")
                } else {
                  res.json({
                  "code":200,
                  "msg":"角色新建成功"	
                })
                }
              }); 
            }else{console.log(r);
               res.json({
                 "msg":"这个角色已经存在！",
                 "code":201,
                 "data":r
               })
            }
          })
})
//查询权限
router.get('/jurisdiction/findjurisdiction',(req,res)=>{
  Jur.find((err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select jur success"
      })
    }
  })
})
//查询角色
router.get('/role/findrole',(req,res)=>{
  Role.find((err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select jur success"
      })
    }
  })
})
//查询可用权限
router.get('/jurisdiction/findusablejurisdiction',(req,res)=>{
  Jur.find({usable:'可用'},(err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select jur success"
      })
    }
  })
})
//查询不可用权限
router.get('/jurisdiction/findunusablejurisdiction',(req,res)=>{
  Jur.find({usable:'不可用'},(err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select jur success"
      })
    }
  })
})
//启用权限
router.get('/jurisdiction/startajur',(req,res)=>{
  var body = req.query
  Jur.findOne({_id:body.id},(err,ret)=>{
    console.log(ret.usable);
    if(ret.usable=="不可用"){
      Jur.updateOne({_id:ret._id},{usable:"可用"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'启用成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'权限已经被启用'
      })
    }
  })
})
//禁用权限
router.get('/jurisdiction/stopajur',(req,res)=>{
  var body = req.query
  Jur.findOne({_id:body.id},(err,ret)=>{
    if(ret.usable=="可用"){
      Jur.updateOne({_id:ret._id},{usable:"不可用"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'禁用成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'权限已经被禁用'
      })
    }
  })
})
//查询可用角色
router.get('/role/findusablerole',(req,res)=>{
  Role.find({usable:'可用'},(err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select role success"
      })
    }
  })
})
//查询不可用角色
router.get('/role/findunusablerole',(req,res)=>{
  Role.find({usable:'不可用'},(err,ret)=>{
    if(err){
      res.json({
        "msg":"权限查询失败"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"select jur success"
      })
    }
  })
})
//启用角色
router.get('/role/startarole',(req,res)=>{
  var body = req.query
  Role.findOne({_id:body.id},(err,ret)=>{
    if(ret.usable=="不可用"){
      Role.updateOne({_id:ret._id},{usable:"可用"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'启用成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'角色已经被启用'
      })
    }
  })
})
//禁用角色
router.get('/role/stoparole',(req,res)=>{
  var body = req.query
  Role.findOne({_id:body.id},(err,ret)=>{
    if(ret.usable=="可用"){
      Role.updateOne({_id:ret._id},{usable:"不可用"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'禁用成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'角色已经被禁用'
      })
    }
  })
})
//修改角色的权限
router.post('/role/changejur',(req,res)=>{
  Role.updateOne({_id:req.body.id},{jur:req.body.jur},(err,ret)=>{
    if(err){
      res.json({
        "msg":"角色权限修改失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"修改成功"
      })
    }
  })
})
//新增公告
router.post('/notice/creatnewnotice',(req,res)=>{
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth();//得到月份
      var date = now.getDate();//得到日期
      var hour = now.getHours();//得到小时
      var minu = now.getMinutes();//得到分钟
      var sec = now.getSeconds();//得到秒
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      if (hour < 10) hour = "0" + hour;
      if (minu < 10) minu = "0" + minu;
      if (sec < 10) sec = "0" + sec;
      var time = "";
      time = year + "-" + month + "-" + date+ " "

      var n = new Notice({
        title: req.body.title,
        text: req.body.text,
        date: time,
        ispush: '否',
        state:'未推送'
        });
                  n.save(function(err, ret) {
                    if (err) {
                      res.send("注册失败")
                    } else {
                      console.log(ret);
                      res.json({
                      "code":200,
                      "msg":"公告发布成功"	
                    })
                    }
                  }); 
})
//查询公告
router.get('/notice/findall',(req,res)=>[
  Notice.find((err,ret)=>{
    if(err){
      res.json({
        "msg":"查询失败"
      })
    }else{
      res.json({
        "code":200,
        "msg":"查询成功",
        "data":ret
      })
    }
  })
])
//推送公告
router.get('/notice/push',(req,res)=>{
  var body = req.query
  Notice.findOne({_id:body.id},(err,ret)=>{
    if(ret.ispush=="否"){
      Notice.updateOne({_id:ret._id},{ispush:"是",state:"正常"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'推送成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'公告已经被推送'
      })
    }
  })
})
//删除公告
router.get('/notice/delete',(req,res)=>{
  var body = req.query
  Notice.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"删除失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"删除成功"
      })
    }
})
})
//查找推送的公告
router.get('/notice/findpushed',(req,res)=>{
  Notice.find({ispush:"是"},(err,ret)=>{
    if(err){
      res.json({
        "msg":"查找失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"查询成功",
        "data":ret
      })
    }
  })
})
//查找研学
router.get('/study/findall',(req,res)=>{
  Study.find((err,ret)=>{
    if(err){
      res.json({
        "msg":'错误'
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"success",
        "data":ret
      })
    }
  })
})
//查找我的研学
router.get('/study/findbyone',(req,res)=>{
  Study.find({master:req.query.master},(err,ret)=>{
    if(err){
      res.json({
        "msg":'查询错误'
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"成功",
        "data":ret
      })
    }
  })
})
//家长反馈
router.post('/feedback/sendnew',(req,res)=>{
  var feedback = new FeedBack({
    studycase: req.body.studycase,
    classthink: req.body.classthink,
    teacherthink: req.body.teacherthink,
    comment: req.body.comment,
    class: req.body.class,
    sender: req.body.sender,
    });
          
              feedback.save(function(err, ret) {
                if (err) {
                  res.send("反馈失败")
                } else {
                  res.json({
                  "code":200,
                  "msg":"反馈成功"	
                })
                }
              }); 
            

})
//查询全部反馈
router.get('/feedback/findall', (req,res)=>{
  FeedBack.find((err,ret)=>{
    res.json({
      'data':ret
    })
  })
})
//根据id查询
router.get('/feedback/findid', (req,res)=>{
  FeedBack.findOne({_id:req.query.id},(err,ret)=>{
    res.json({
      'data':ret
    })
  })
})
//删除反馈
router.get('/feedback/delete',(req,res)=>{
  var body = req.query
  FeedBack.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"删除失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"删除成功"
      })
    }
})
})
//添加新的学习风采
router.post('/study/uploadnew',(req,res)=>{
  var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth();//得到月份
      var date = now.getDate();//得到日期
      var hour = now.getHours();//得到小时
      var minu = now.getMinutes();//得到分钟
      var sec = now.getSeconds();//得到秒
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      if (hour < 10) hour = "0" + hour;
      if (minu < 10) minu = "0" + minu;
      if (sec < 10) sec = "0" + sec;
      var time = "";
      time = year + "-" + month + "-" + date+ " " + hour + ":" + minu + ":" + sec;
    User.findOne({_id:req.session.user._id},(err,ret)=>{
      if(err){
        res.json({
          "msg":"查询用户错误"
        })
      }
      else{
        var study = new Study({
          title: req.body.title,
          master: req.body.master,
          content: req.body.content,
          school:req.body.school,
          headimg:req.body.headimg,
          date:time,
          coverimg:req.body.coverimg,
          state:'未审核'
        })
        study.save((err,rut)=>{
          if (err) {
            res.json({
              "data":"保存失败"
            })
          }
          else{
            res.json({
              "code":200,
              "data":study,
              "msg":"保存成功"
            })
          }
        })
      }
    })
})
//查找所有课程
router.get('/class/findall',(req,res)=>{
  Class.find((err,ret)=>{
    if(err){
      res.json({
        "msg":'错误'
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"success",
        "data":ret
      })
    }
  })
})
//id查询课程
router.get("/class/findbyid",(req,res)=>{
  var body = req.query
  Class.findOne({_id:body.id},(err,ret)=>{
    res.json({
      "code":200,
      "data":ret,
      "msg":"success"
    })
  })
})
//选课
router.get("/user/addclass",(req,res)=>{
  var body = req.query
  var myclass
  User.findOne({_id:req.session.user._id},(err,ret)=>{
    myclass = ret.myclass
    myclass.push(body.classid)
    User.updateOne({_id:req.session.user._id},{myclass:myclass},(err,rut)=>{
      res.json({
        "msg":"success"
      })
    })
    
  })
  
})
//删除课程
router.get("/class/deletebyid",(req,res)=>{
  var body = req.query
  Class.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"error"
      })
    }
    else{
      User.find((err,rut)=>{
        rut.map(item=>{
          item.myclass.map((itm,idx)=>{
            if(itm == body.id){
              var newmyclass = item.myclass.splice(1,idx)
              User.updateOne({_id:item._id},{myclass:newmyclass},(err,r)=>{
                if(err){
                  res.send(err)
                }
                else{
                  res.json({
                    "code":200,
                    "msg":"success"
                  })
                }
              })
            }
          })
        })
      })
    }
  })
})
//添加新课程
router.post('/class/addnew',(req,res)=>{
  var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth();//得到月份
      var date = now.getDate();//得到日期
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      var time = "";
      time = year + "-" + month + "-" + date
        var classes = new Class({
          name: req.body.name,
          techer: req.body.techer,
          date:time,
          coverimg:req.body.coverimg,
          desc:req.body.desc,
          classtime:req.body.classtime,
        })
        classes.save((err,rut)=>{
          if (err) {
            res.json({
              "data":"保存失败"
            })
          }
          else{
            res.json({
              "code":200,
              "data":classes,
              "msg":"保存成功"
            })
          }
        })
      
})
//修改课程之前
router.get('/class/beforeupdate',(req,res)=>{
  var body = req.query
  Class.findOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"error!! "
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"博客获取成功",
        "data":ret
      })
    }
  })
})
//修改课程
router.post('/class/updateclass',(req,res)=>{
  Class.updateOne({_id:req.body.id},{
    name:req.body.name,
    coverimg:req.body.coverimg,
    techer:req.body.techer,
    desc:req.body.desc,
    classtime:req.body.classtime,
  },(err,ret)=>{
    if(err){
      res.json({
        "msg":"修改失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"修改成功"
      })
    }
  })
})
//查找通过审核的研学
router.get('/study/findpassed',(req,res)=>{
  Study.find({state:'审核成功'},(err,ret)=>{
    if(err){
      res.json({
        "mag":"error"
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"success"
      })
    }
  })
})
//通过审核风采
router.get('/study/pass',(req,res)=>{
  var body = req.query
  Study.findOne({_id:body.id},(err,ret)=>{
    if(ret.state=="未审核"){
      Study.updateOne({_id:ret._id},{state:"审核成功"},(err,rut)=>{
        res.json({
          "code":200,
          "msg":'推送成功'
        })
      })
    }
    else{
      res.json({
        "code":201,
        "msg":'风采已经被成功审核'
      })
    }
  })
})
//删除风采
router.get('/study/delete',(req,res)=>{
  var body = req.query
  Study.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"删除失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"删除成功"
      })
    }
})
})
//获取全部用户信息
router.get('/user/findall',(req,res)=>{
  User.find((err,ret)=>{
    if(err){
      res.send("err")
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":"success"
      })
    }
  })
})
//根据id查询用户角色
router.get('/user/findbyid',(req,res)=>{
  User.findOne({_id:req.query.id},(err,ret)=>{
    if(err){
      res.send("err")
    }
    else{
      res.send({
        "code":200,
        "data":ret.role,
        "msg":'success'
      })
    }
  })
})
//修改用户的角色
router.post('/user/changerole',(req,res)=>{
  User.updateOne({_id:req.body.id},{role:req.body.role},(err,ret)=>{
    if(err){
      res.json({
        "msg":"用户角色修改失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"修改成功"
      })
    }
  })
})
//查找风采详情
router.get('/study/getdatil', (req, res) => {
  Study.findOne({_id: req.query.id},(err,ret)=>{
    if(err){
      res.send(err,'出错了')
    }else{
      res.json({
        'data':ret
      })
    }
  })
})









//获取七牛云token
router.get('/token/cper/gettoken',(req,res)=>{
  const accesskey='NE8_vBQZRIGgA3rME0MDu_nrFLnb6RXYoE3vDdtH';
  const ssk='o7pfhdI45Y88B3rIw3P5yC0d18Jm7fFYN9teGDBx';
  const bucket='hcpr';
  let mac=new qiniu.auth.digest.Mac(accesskey,ssk);

  let options={
    scope:bucket,
     expires:3600*24
  };
  let putPolicy=new qiniu.rs.PutPolicy(options);
  let uploadToken=putPolicy.uploadToken(mac);
  res.json({
    "token":uploadToken
  })
})
//修改昵称
router.get('/personal/editnickname',(req,res)=>{
  var body = req.query,
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length != 0){ 
    User.updateOne({_id:req.session.user._id},{
      nickname:body.nickname
    },(err)=>{
      if(err){
        res.json({
          "data":"error"
        })
      } 
      else{
        User.findOne({_id:req.session.user._id},(err,result)=>{
          if (err) {
           res.json({
             "msg":"用户信息失效，请重新登陆",
             "data":err,
           })
          }
          else{
            res.json({
              "code":200,
              "msg":"修改成功",
              "data":result
            })
          }
          })
      }
    })
    .then(()=>{
      Blog.find((err,ret)=>{
        if(err){
          res.json({
            "msg":err
          })
        }else{
          var updatearr = ret.map((item,index)=>{
            return item.writer == req.session.user.username
          })
          for(i=0;i<ret.length;i++){
            if(updatearr[i]){
              Blog.updateMany({writer:req.session.user.username},{writerickname:body.nickname},(err)=>{
                if(err){
                  res.json({
                    "msg":"服务器错误"
                  })
                }
              })
            }
          }
        }
      })
    })
    .then(()=>{
      Comments.find((err,rut)=>{
        if(err){
          res.json({
            "msg":err
          })
        }else{
          // console.log(rut);
          var updatearr = rut.map((item,index)=>{
            return item.commer == req.session.user.username
          })
          for(i=0;i<rut.length;i++){
            if(updatearr[i]){
              Comments.updateMany({commer:req.session.user.username},{commernickname:body.nickname},(err)=>{
                if(err){
                  res.json({
                    "msg":"服务器错误"
                  })
                }
              })
            }
          }
        }
      })
    })
  }
  else{
    res.json({
      "msg":"用户未登录"
    })
  }
})
//修改头像
router.get('/personal/editheadimg',(req,res)=>{
  var body = req.query,
  
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length != 0){
    User.updateOne({_id:req.session.user._id},{
      // headimg:'http://hchopper.top/'+body.headimg
      headimg:body.headimg
    },(err)=>{
      if(err){
        res.json({
          "data":"error"
        })
      }
      else{
        User.findOne({_id:req.session.user._id},(err,result)=>{
          if (err) {
           res.json({
             "msg":"出错",
             "data":err,
           })
          }else{
           res.json({
             "code":200, 
             "msg":"修改成功",
             "data":result,
           })
          }
   })
      }
    })
    .then(()=>{
      Blog.find((err,ret)=>{
        if(err){
          res.json({
            "msg":err
          })
        }else{
          var updatearr = ret.map((item,index)=>{
            return item.writer == req.session.user.username
          })
          for(i=0;i<ret.length;i++){
            if(updatearr[i]){
              Blog.updateMany({writer:req.session.user.username},{headimg:body.headimg},(err)=>{
                if(err){
                  res.json({
                    "msg":"服务器错误"
                  })
                }
              })
            }
          }
        }
      })
    })
    .then(()=>{
      Comments.find((err,ret)=>{
        if(err){
          res.json({
            "msg":err
          })
        }else{
          var updatearr = ret.map((item,index)=>{
            return item.commer == req.session.user.username
          })
          for(i=0;i<ret.length;i++){
            if(updatearr[i]){
              Comments.updateMany({commer:req.session.user.username},{commerhead:body.headimg},(err)=>{
                if(err){
                  res.json({
                    "msg":"服务器错误"
                  })
                }
              })
            }
          }
        }
      })
    })
  }
})
//获取博客
router.get('/blog/getblog',(req,res)=>{
  Blog.find(function(err,data){
    if(err){
      res.json({
        "data":"没找到"
      })
    }else{
      res.json({
        "data":data
      })
    }
  })
})
//撰写博客
router.post('/blog/writeblog',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth();//得到月份
      var date = now.getDate();//得到日期
      var hour = now.getHours();//得到小时
      var minu = now.getMinutes();//得到分钟
      var sec = now.getSeconds();//得到秒
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      if (hour < 10) hour = "0" + hour;
      if (minu < 10) minu = "0" + minu;
      if (sec < 10) sec = "0" + sec;
      var time = "";
      time = year + "-" + month + "-" + date+ " " + hour + ":" + minu + ":" + sec;
  if(issession.length != 0){
    User.findOne({_id:req.session.user._id},(err,ret)=>{
      if(err){
        res.json({
          "msg":"查询用户错误"
        })
      }
      else{
        var blog = new Blog({
          title: req.body.title,
          text: req.body.text,
          writer: ret.username,
          writerickname:ret.nickname,
          headimg:ret.headimg,
          writedate:time,
          coverimg:req.body.coverimg,
          tags:req.body.tags,
          kind:req.body.kind,
          commentcount:0,
          visitors:[],
          liked:[]
        })
        blog.save((err,rut)=>{
          if (err) {
            res.json({
              "data":"保存失败"
            })
          }
          else{
            res.json({
              "code":200,
              "data":blog,
              "msg":"保存成功"
            })
          }
        })
      }
    })
  }
  else{
    res.json({
      "msg":"请先登录后在来"
    })
  }
})
//博客点击
router.get('/blog/findblogbyid',(req,res)=>{
    var body = req.query
    var arrv = []
    var v = {
      visitor:body.visitor
    }
    Blog.findOne({
      _id: body.id
    },(err,ret)=>{
      if(err){
        res.json({
          "msg":"error"
        })
      }
      else{
        arrv = ret.visitors
        if (v){
        var isvisit = arrv.filter(item=>{
          return item.visitor == body.visitor
        })
        if(isvisit.length==0){
          arrv.push(v)
        } 
      }
        Blog.updateOne({_id: body.id},{visitors:arrv},(err,s)=>{
          if(err){
            res.json({
              "msg":"不是吧阿sir"
            })
          }else{
            res.json({
              "code":200,
              "msg":"查询成功",
              "data":ret
            })
          }
        })
        
      }
    })
})
//查询评论
router.get('/blog/findcommentbyid',(req,res)=>{
  var body = req.query
  Comments.find({blogid:body.blogid},(err,ret)=>{
    if (err) {
      res.json({
        "msg":"获取评论列表失败"
      })
    }else{
      res.json({
        "code":200,
        "msg":"评论获取成功",
        "data":ret
      })
    }
  })
})
//发布评论
router.get('/blog/uploadcomment',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length!==0){
    User.findOne({_id:req.session.user._id},(err,ret)=>{
      if(err){
        res.json({
          "msg":"查询用户错误"
        })
      }
      else{
        var body = req.query
    var comment = new Comments({
      blogid:body.blogid,
      content:body.comment,
      commernickname:ret.nickname,
      commer:ret.username,
      commerhead:ret.headimg,
    })
    comment.save((err,ret)=>{
      if (err) {
        res.json({
          "data":"评论失败"
        })
      }
      else{
        var a = 0
        Blog.findOne({_id:body.blogid},(err,r)=>{
          a = r.commentcount + 1
          console.log(a);
        
        Blog.updateOne({_id:body.blogid},{commentcount:a},(err)=>{
          if(err){
            res.json({
              "msg":"评论失败"
            })
          }
          else{
            res.json({
              "code":200,
              "data":comment,
              "msg":"评论成功"
            })
          }
        })
      })
      }
    })
      }
    })
    
  } 
  else{
    res.json({
      "msg":"先登录了啦～～～",
      "code":201
    })
  } 
})
//查找所有用户
router.get('/user/findAll',(req,res)=>{
  User.find((err,ret)=>{
    if (err) {
      res.json({
        "msg":"error了"
      })
    }else{
      res.json({
        "code":200,
        "msg":"查询成功",
        "data":ret
      })
    }
  })
})
//查询所有博客
router.get('/blog/findAll',(req,res)=>{
  Blog.find((err,ret)=>{
    if (err) {
      res.json({
        "msg":"error了"
      })
    }else{
      res.json({
        "code":200,
        "msg":"查询成功",
        "data":ret
      })
    }
  })
})
//收藏博客
router.get('/blog/collectblog',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length!==0){
    var body = req.query
    var arrc = []
    var c = {
      blogid:body.blogid
    }
    var arrbc = []
    var bc = {
      username:req.session.user.username
    }
    User.findOne({_id:req.session.user._id},(err,ret)=>{
      if(err){
        res.json({
          "msg":"查询错误"
        })
      }
      else{
        
        iscollect = ret.collections.filter(item=>{
          return item.blogid == body.blogid
        })
        if(iscollect.length == 0){
          arrc = ret.collections
          arrc.push(c)
          User.updateOne({_id:ret._id},{collections:arrc},(err,rut)=>{
            if(err){
              res.json({
                "msg":"点赞失败"
              })
            }
            else{
              Blog.findOne({_id:body.blogid},(err,brr)=>{
                isbecollect = brr.collected.filter(item=>{
                  return item.username == req.session.user.username
                })
                if(isbecollect.length == 0){
                  arrbc = brr.collected
                  arrbc.push(bc)
                  Blog.updateOne({_id:body.blogid},{collected:arrbc},(err,ubr)=>{
                    if(err){
                      res.json({
                        "msg":'收藏失败'
                      })
                    }
                    else{
                      res.json({
                        "code":200,
                        "msg":'收藏成功'
                      })
                    }
                })
                }
              })
            }
          })
        }
      }
    })
  }
  else{
    res.json({
      "msg":"请先登录了啦～～～"
    })
  }
})
//取消收藏
router.get('/blog/discollectblog',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length!==0){
    var body = req.query
    var discarr = []
    var disc = {
      blogid: body.blogid
    }
    User.findOne({_id: req.session.user._id},(err,ret)=>{
      if(err){
        res.jaon({
          "mag":"获取用户信息失败"
        })
      }else{
        discarr = ret.collections
        for(var dis = 0;dis<discarr.length;dis++){
          if(disc.blogid == discarr[dis].blogid){
            discarr.splice(dis,1)
          }
        }
        User.updateOne({_id:ret._id},{collections:discarr},(err,rut)=>{
          if(err){
            res.json({
              "msg":"取消点赞失败"
            })
          }
          else{
            var disbcarr = []
            Blog.findOne({_id:body.blogid},(err,rbr)=>{
              if(err){
                console.log(错了);
              }
              else{
                disbcarr = rbr.collected
                for(var disb = 0;disb<disbcarr.length;disb++){
                  if(req.session.user.username == disbcarr[disb].username){
                    disbcarr.splice(disb,1)
                  }
                }
                Blog.updateOne({_id:body.blogid},{collected: disbcarr},(err)=>{
                  if(err){
                    console.log('cuole');
                  }
                  else{
                    res.json({
                      "code":200,
                      "msg":"取消点赞成功"
                    })
                  }
                })
              }
            })
            
          }
        })
      }
    })
  }
  else{
    res.json({
      "msg":"操作失败，用户登陆信息失效"
    })
  }
})
//检查博客是否被此用户收藏
router.get('/blog/isusercollect',(req,res)=>{
  User.findOne({username: req.session.user.username},(err,ret)=>{
    var body = req.query
    ret.collections.map(item=>{
      if (item.blogid == body.blogid) {
          res.json({
          "code":200,
          "msg":"查询收藏状态成功",
          "data":true 
        })
      }
    })
  })
})
//根据id查找博客
router.get('/blog/findbyid',(req,res)=>{
  var body = req.query
  Blog.find({_id: body.bgid},(err,ret)=>{
    if(err){
      res,json({
        "msg":"关注列表读取失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":'关注获取成功',
        "data":ret
      })
    }
  })
})
//查找收藏
router.get('/blog/findblogbycollect',(req,res)=>{
  User.findOne({_id:req.session.user._id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"获取失败"
      })
    }
    else{
      if(ret.collections.length == 0){
        res.json({
          "code":201,
          "msg":"还未收藏博客"
        })
      }
      else{
        var collblog = []
        ret.collections.map((item,index)=>{
          Blog.findOne({_id:item.blogid},(err,rut)=>{
            if(err){
                res.json({
                "msg":"这条博客已经消失"
              })
            }
            else{
              // console.log(index);
              collblog.push(rut)

              if(index==ret.collections.length-1){
                res.json({
                  "code":200,
                  "msg":"关注的博客查询成功",
                  "data":collblog
                })
              }
            }
          })
        })
        // for(var i = 0;i<ret.collections.length;i++){
        //     Blog.findOne({_id:ret.collections[i].blogid},(err,rut)=>{
        //       if(err){
        //         res.json({
        //           "msg":"这条博客已经消失"
        //         })
        //       }
        //       else{
        //         collblog.push(rut)
        //         // console.log(collblog);
        //         console.log(i);
        //       }
        //     })
        // }
      }
    }
  })
})
//查找个人博客
router.get('/blog/findpersonblog',(req,res)=>{
  Blog.find({writer: req.session.user.username},(err,ret)=>{
    if(err){
      res.json({
        "msg":'信息列表获取失败'
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"信息列表获取成功",
        "data":ret
      })
    }
  })
})
//根据id删除博客
router.get('/blog/deletebyid',(req,res)=>{
  var body = req.query
  Blog.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"删除失败"
      })
    }
    else{
      res.json({
        "code":200,
        "mag":"删除成功"
      })
    }
})
})
//删除博客时删除相关评论
router.get('/blog/deletecommentsbyid',(req,res)=>{
  var body = req.query
  Comments.find({blogid:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"评论获取失败"
      })
    }
    else if(ret.length == 0){
      res.json({
        "code":200
      })
    }
    else{
      Comments.deleteMany({blogid:body.id},(err,rut)=>{
        if(err){
          res.json({
            "msg":"相关评论删除失败"
          })
        }
        res.json({
          "code":200,
          "msg":"相关评论删除成功"
        })
      })
    }
  })
})
//删除相关用户关注信息
router.get('/blog/deletecollectsbyid',(req,res)=>{
  var body = req.query
  User.find((err,ret)=>{
    if(err){
      res.json({
        "msg":"用户关注查询失败"
      })
    }
    else{
      var newcollect = []
      ret.map(item=>{
        item.collections.map((itm,idx)=>{
          if(itm.blogid == body.id){
            item.collections.splice(idx,1)
            newcollect = item.collections
          }
        })
        User.updateOne({_id:item._id},{collections:newcollect},(err,re)=>{
          if(err){
            res.json({
              "msg":"用户收藏更新失败"
            })
          }
          else{
            res.json({
              "code":200,
              "msg":"评论列表删除成功"
            })
          }
        })
      })
    }
  })
})
//查找该用户的博客
router.get('/blog/findsomeoneblog',(req,res)=>{
  var body = req.query
  Blog.find({writer:body.username},(err,ret)=>{
    if(err){
      res.json({
        "msg":'别人家的博客获取失败'
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"别人家的博客获取成功",
        "data":ret
      })
    }
  })
})
//点赞
router.get('/blog/like',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length!==0){
    var body = req.query
    var arrl = []
    var l = {
      blogid:body.blogid
    }
    var arrbl = []
    var bl = {
      username:req.session.user.username
    }
    User.findOne({_id:req.session.user._id},(err,ret)=>{
      if(err){
        res.json({
          "msg":"查询错误"
        })
      }
      else{
        islike = ret.ilike.filter(item=>{
          return item.blogid == body.blogid
        })
        if(islike.length == 0){
        arrl = ret.ilike
        arrl.push(l)

        User.updateOne({_id:ret._id},{ilike:arrl},(err,rut)=>{
          if(err){
            res.json({
              "msg":"点赞失败"
            })
          }
          else{
            Blog.findOne({_id:body.blogid},(err,br)=>{
              isbeliked = br.liked.filter(item=>{
                return item.username == req.session.user.username
              })
              if(isbeliked.length == 0){
                arrbl = br.liked
                arrbl.push(bl)
                Blog.updateOne({_id:body.blogid},{liked:arrbl},(err,ubr)=>{
                  if(err){
                    res.json({
                      "msg":'点赞失败'
                    })
                  }
                  else{
                    res.json({
                      "code":200,
                      "msg":'点赞成功'
                    })
                  }
              })
              }
            })
          }
        })
      }
      }
    })
  }
  else{
    res.json({
      "msg":"请先登录了啦～～～"
    })
  }
})
//取消点赞
router.get('/blog/dislike',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length!==0){
    var body = req.query
    var dislarr = []
    var disl = {
      blogid: body.blogid
    }
    User.findOne({_id: req.session.user._id},(err,ret)=>{
      if(err){
        res.jaon({
          "mag":"获取用户信息失败"
        })
      }else{
        dislarr = ret.ilike
        for(var dis = 0;dis<dislarr.length;dis++){
          if(disl.blogid == dislarr[dis].blogid){
            dislarr.splice(dis,1)
          }
        }
        User.updateOne({_id:ret._id},{ilike:dislarr},(err,rut)=>{
          if(err){
            res.json({
              "msg":"取消点赞失败"
            })
          }
          else{
            var disblarr = []
            Blog.findOne({_id:body.blogid},(err,rbr)=>{
              if(err){
                console.log(错了);
              }
              else{
                disblarr = rbr.liked
                for(var disb = 0;disb<disblarr.length;disb++){
                  if(req.session.user.username == disblarr[disb].username){
                    disblarr.splice(disb,1)
                  }
                }
                Blog.updateOne({_id:body.blogid},{liked: disblarr},(err)=>{
                  if(err){
                    console.log('cuole');
                  }
                  else{
                    res.json({
                      "code":200,
                      "msg":"取消点赞成功"
                    })
                  }
                })
              }
            })
            
          }
        })
      }
    })
  }
  else{
    res.json({
      "msg":"操作失败，用户登陆信息失效"
    })
  }
})
//是否点赞
router.get('/blog/isuserlike',(req,res)=>{
  User.findOne({username: req.session.user.username},(err,ret)=>{
    var body = req.query
    ret.ilike.map(item=>{
      if (item.blogid == body.blogid) {
          res.json({
          "code":200,
          "msg":"查询收藏状态成功",
          "data":true 
        })
      }
    })
  })
})
//根据种类获取博客
router.get('/blog/getblogofkind',(req,res)=>{
  var body = req.query
  var kindblog = []
  Blog.find((err,ret)=>{
    var thiskind = ret.filter(item=>{
      return item.kind == body.kind
    })
    res.json({
      "data":thiskind
    })
  })
})
//发送私信
router.post('/user/sendchat',(req,res)=>{
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length != 0){
    
        var chat = new Chat({
          from:req.body.from,
          to:req.body.to,
          content:req.body.content,
          rechat:''
        })
        chat.save((err,rut)=>{
          if (err) {
            res.json({
              "data":"保存失败"
            })
          }
          else{
            res.json({
              "code":200,
              "data":chat,
              "msg":"保存成功"
            })
          }
        })
  }
  else{
    res.json({
      "code":201,
      "msg":"请先登录后在来"
    })
  }
})
//查找私信
router.get('/user/findchat',(req,res)=>{
  var body = req.query
  Chat.find({to:body.to},(err,ret)=>{
    if(err){
      res.json({
        "msg":'查询失败',
      })
    }
    else{
      res.json({
        "code":200,
        "data":ret,
        "msg":'查询成功'
      }) 
    }
  })
})
//删除私信
router.get('/user/deletechat',(req,res)=>{
  var body = req.query
  Chat.deleteOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"删除失败"
      })
    }
    else{
      res.json({
        "code":200,
        "mag":"删除成功"
      })
    }
})
})
//排序输出
router.get('/blog/sortblog',(req,res)=>{
  Blog.find((err,ret)=>{
    res.json({
      "data":ret
    })
  })
})
//修改密码
router.get('/user/editpassword',(req,res)=>{
  var body = req.query
  issession = session.filter(item=>{
    return item._id == req.session.user._id
  })
  if(issession.length != 0){ 
  User.updateOne({_id:req.session.user._id},{password:body.password},(err,ret)=>{
      res.json({
        "code":200,
        "msg":"密码修改成功"
      })
  })
  }
})
//博客修改前
router.get('/blog/beforeupdate',(req,res)=>{
  var body = req.query
  Blog.findOne({_id:body.id},(err,ret)=>{
    if(err){
      res.json({
        "msg":"error!! "
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"博客获取成功",
        "data":ret
      })
    }
  })
})
//修改博客
router.post('/blog/updateblog',(req,res)=>{
  Blog.updateOne({_id:req.body.id},{
    title:req.body.title,
    text:req.body.text,
    tags:req.body.tags,
    kind:req.body.kind,
    coverimg:req.body.coverimg,
  },(err,ret)=>{
    if(err){
      res.json({
        "msg":"修改失败"
      })
    }
    else{
      res.json({
        "code":200,
        "msg":"修改成功"
      })
    }
  })
})
module.exports = router;