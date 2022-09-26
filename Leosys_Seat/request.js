const request = require('request')
var rest 	 = require('restler'),
	fs   	 = require('fs')

const { resolve } = require('path')
const { rejects } = require('assert');
const { Console } = require('console');
const { Agent } = require('http');
const useragent= `Mozilla/5.0 (iPad; CPU OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.28(0x18001c29) NetType/WIFI Language/zh_CN`

let userid_name = '1942065254'
let userid_password = '%7DW3AI6IH8P%7DZ-DXX'


async function Run(){
try{
  let token

    if(await getdata()=='') {//内容为空时重新获取
      let time= formatTime().year+'-'+formatTime().month+"-"+formatTime().day
      console.log(time)

      console.log(`尝试重新获取Token\n`)
      token=(await httprequest(userid_name,userid_password)).data.token
      setdata(token)
      Run()
    }else{
      token=(JSON.parse(await getdata())).token//获取token
      let userid,capttoken

      if((await user_id(token)).status=='fail'){//token失效时重新获取
        fs.writeFile('./test2.txt', '', function(err){});
        Run()
      }else{

        userid=(await user_id(token)).data.id //获取用户id
        capttoken=(await capt_token(userid,userid_name)).token //获取用户验证token


        // console.log('000')
        let captcha=await Promise.all([pic_down1(capttoken), pic_down2(capttoken)])//等待验证码
        let picbase1,picbase2//base64的验证码编码
        if(captcha[0]==captcha[1]){
         picbase1=await pic_base64('./image/cap1.jpeg')//图片进行base64编码
         picbase2=await pic_base64('./image/cap2.jpeg')//图片进行base64编码
        }

    //  console.log(`图片1的base64编码为；${picbase1}\n图片2的base64编码为；${picbase2}`)


    let a={
      err_no: 0,
      err_str: 'OK',
      pic_id: '8190418560968890004',
      pic_str: '因,14,85|在,111,79|其,253,90|紧,198,84',
      md5: '77c279ec44fe1037804ed7aa6a2ff005'
    }
    // let YZM_RES=JSON.parse(await YZM(picbase1))


      // let YZM_RES=JSON.parse(await YZM(picbase1))//{err_no: 0,err_str: 'OK',pic_id: '2190415260968890001',pic_str: 'k',md5: 'fe90f798bb323010278cf2659f1eac9f'}
      // if (YZM_RES.err_no == 0) {console.log('识别结果 ='+ YZM_RES.pic_str)} else {console.log('错误原因：'+ YZM_RES.err_str)}
      // console.log(YZM_RES)


      let singleword=JSON.parse(await single_word(picbase2)).words_result[0]//{err_no: 0,err_str: 'OK',pic_id: '2190415260968890001',pic_str: 'k',md5: 'fe90f798bb323010278cf2659f1eac9f'}
      console.log(singleword)
      
      let v,s,wordloc,word//v: 未加密的坐标位置 s：转换为base前的二进制编码 word; 服务器返回的word [0]为返回的文字， [1]为x坐标，[2]为y坐标
      let b=(a.pic_str).split('|')//pic_str中四个字以|分开后的数组
      for(var i in b){
        word=b[i].split(',')
        if(word[0]=='紧')
        {
          v=`[{"x":${word[1]},"y":${word[2]}}]`
          s =Buffer.from(v);
          wordloc = s.toString('base64');//加密后的位置
        }
        else{
          //  Run()
        }
      }

     if(wordloc!=undefined) {
      await chickincapt(wordloc,capttoken,token)
      console.log(wordloc)
    }
 
  
    // console.log(await chickincapt(wordloc,capttoken,token))
      }
     

    }


  }catch(e){
    console.log("错误是："+e)
  }

}

Run()

function formatTime() {
  let dateObj = new Date()//获取时间
let Minutes = dateObj.getMinutes();//获取分钟
  let Hours = dateObj.getHours(); //获取小时

  let Dates = dateObj.getDate(); //获取日期天
  if(Dates<10) Dates = '0'+dateObj.getDate(); //获取日期天
let Month = dateObj.getMonth()+1//获取日期月
if(Month<10) Month = '0'+(dateObj.getMonth()+1)//获取日期月
let Year = dateObj.getFullYear()//获取日期年
  let objtime={year: Year, month: Month, day:Dates, hours:Hours, minutes:Minutes}
  return objtime
}


function single_word(base64){
  return new Promise((resolve,reject)=>{
    rest.post('https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=24.b96bc89dd6f2497e31cdf6de818380f1.2592000.1666262223.282335-24228793', {
      multipart: true,
      data: {
        'language_type':'CHN_ENG',
        'image': base64  
      },
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type' : 'application/x-www-form-urlencoded' 
      }
    }).on('complete', function(data) {
      var captcha = JSON.stringify(data);
      // console.log('Captcha Encoded.');
      resolve(captcha)
      // console.log(captcha);
    });

  })
}

function YZM(base64){
  return new Promise((resolve,reject)=>{
    rest.post('http://upload.chaojiying.net/Upload/Processing.php', {
      multipart: true,
      data: {
        'user': '859364954',
        'pass': '',
        'softid':'939195',  //软件ID 可在用户中心生成
        'codetype': '9501',  //验证码类型 http://www.chaojiying.com/price.html 选择
        'file_base64': base64  // filename: 抓取回来的码证码文件
      },
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type' : 'application/x-www-form-urlencoded' 
      }
    }).on('complete', function(data) {
      var captcha = JSON.stringify(data);
      // console.log('Captcha Encoded.');
      resolve(captcha)
      // console.log(captcha);
    });

  })
}

// function YZM1(base64){
//   return new Promise((resolve,reject)=>{
//     rest.post('https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=24.c359932583f3321a56ce0fa1a656fa84.2592000.1666348488.282335-9777217', {
//       multipart: true,
//       data:{
//         'image':base64,
//         'vertexes_location':'true',
//         'probability': 'true'
        
//     },    
//       headers: { 
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
//         'Content-Type' : 'application/x-www-form-urlencoded' 
//       }
//     }).on('complete', function(data) {
//       var captcha = JSON.stringify(data);
//       // console.log('Captcha Encoded.');
//       resolve(captcha)
//     });

//   })
// }

function freeBook(seatid,date,start,end,capttoken,token){//座位预约请求
  return new Promise((resolve, reject)=>{
     var url= `https://leosys.cn/axhu/rest/v2/freeBook`;
     var option ={
        url: url,
        method: "POST",
        headers:{
          'content-type' : `application/x-www-form-urlencoded`,
          'User-Agent' : useragent,
          'token':token
        },
        body : `seat=${seatid}&date=${date}&startTime=${start}&endTime=${end}&authid=${capttoken}`,
        json: true
      }
      request(option, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(body)
        }else{
          reject(error)
        }
      });
  });
};

function chickincapt(wordloc,capttoken,token){//a=4a0d6b5d-347f-4fce-8928-15a2b48164a5 b=用户账户
  return new Promise((resolve, reject)=>{
     var url= `https://leosys.cn/axhucap/checkCaptcha?a=${wordloc}&token=${capttoken}`
     var option ={
        url: url,
        method: "GET",
        headers:{
          'User-Agent' : useragent,
          'token':token
        },
        json: true
      }
      request(option, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(body)
        }else{
          reject(error)
        }
      });
  });
};

function pic_down1(capttoken){
  return new Promise((resolve,reject)=>{
      let imgUrl1 = `https://leosys.cn/axhucap/captchaImg/1?token=${capttoken}`;
      request(imgUrl1,(error,response,body)=>{resolve(response.statusCode)}).pipe(fs.createWriteStream(`./image/cap1.jpeg`));
  })
}

function pic_down2(capttoken){
  return new Promise((resolve,reject)=>{
      let imgUrl2 = `https://leosys.cn/axhucap/captchaImg/2?token=${capttoken}`;
      request(imgUrl2,(error,response,body)=>{resolve(response.statusCode)}).pipe(fs.createWriteStream(`./image/cap2.jpeg`));
  })
}

function capt_token(a,b){//a=4a0d6b5d-347f-4fce-8928-15a2b48164a5 b=用户账户
  return new Promise((resolve, reject)=>{
     var url= `https://leosys.cn/axhucap/captcha`
     var option ={
        url: url,
        method: "POST",
        json: true,
        body:`userId=${a}&username=${b}`
      }
      request(option, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(body)
        }else{
          reject(error)
        }
      });
  });
};

function user_id(token){//20423
  return new Promise((resolve, reject)=>{
     var url= `https://leosys.cn/axhu/rest/v2/user`  
     var option ={
        url: url,
        method: "POST",
        json: true,
        headers: {
          'User-Agent' : useragent,
          'token': token
        }
      }
      request(option, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(body)
        }else{
          reject(error)
        }
      });
  });
};

function httprequest(userid_name,userid_password){//token获取
    return new Promise((resolve, reject)=>{
        var url=`https://leosys.cn/axhu/rest/auth?username=${userid_name}&password=${userid_password}` 
        var option ={
          url: url,
          method: "POST",
          json: true,
          headers: {
            'User-Agent' : useragent,
              "content-type": "application/json",
              'actCode' : `true`
          },
        }
        request(option, function(error, response, body) {
          if (!error && response.statusCode == 200&&body.status=='success') {
              resolve(body)
          }else{
            reject(body.message)
          }
        });
    });
};

function pic_base64(adress){//对本地图片进行base64加密
  return new Promise((resolve,reject)=>{
    fs.readFile(adress,'binary',function(err,data){
      if(err){
          reject(err)
      }else{
          const buffer = Buffer.from(data, 'binary');
          resolve(buffer.toString('base64')) 
      }
  });
  })
}

function setdata(val){
  return new Promise((resolve,reject)=>{
    let obj=new Object()
    obj.token=String(val)
    obj=JSON.stringify(obj)
    fs.writeFile('./test2.txt', obj, function(err) {    
      if (err) reject(err)
      else resolve(true)
      });
  })
}

function getdata(){
  return new Promise((resolve,reject)=>{
    fs.readFile('./test2.txt', 'utf-8', function(err, data) {
      
      resolve(data)});
  })
}


