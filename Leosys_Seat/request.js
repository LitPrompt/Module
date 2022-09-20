const request = require('request')
var rest 	 = require('restler'),
	fs   	 = require('fs')

const { resolve } = require('path')
const { rejects } = require('assert');
const { Console } = require('console');

let userid_name = '1942065254'
let userid_password = '%7DW3AI6IH8P%7DZ-DXX'


async function Run(){
try{
  let token

    if(await getdata()=='') {//内容为空时重新获取

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

    // console.log('11')
      let singleword=JSON.parse(await single_word(picbase2)).words_result[0].words//{err_no: 0,err_str: 'OK',pic_id: '2190415260968890001',pic_str: 'k',md5: 'fe90f798bb323010278cf2659f1eac9f'}
      
      let v,s,wordloc
      let b=(a.pic_str).split('|')
      for(var i in b){
        let word=b[i].split(',')
        if(word[0]==singleword)
        {
          v=`[{"x":${word[1]},"y":${word[2]}}]`
          s =Buffer.from(v);
          wordloc = s.toString('base64');//加密后的位置
        }
        else{
          //  Run()
        }
      }

     if(wordloc!=undefined) console.log(wordloc)
      // console.log('22')
      console.log(singleword)
      // let YZM_RES=JSON.parse(await YZM(picbase1))//{err_no: 0,err_str: 'OK',pic_id: '2190415260968890001',pic_str: 'k',md5: 'fe90f798bb323010278cf2659f1eac9f'}
      // if (YZM_RES.err_no == 0) {console.log('识别结果 ='+ YZM_RES.pic_str)} else {console.log('错误原因：'+ YZM_RES.err_str)}
      // console.log(YZM_RES)


      // let reserveInfo=await reserve_info(token)
      
      // console.log(reserveInfo.data.reservations)
      }
     

    }


  }catch(e){
    console.log("错误是："+e)
  }

}

Run()


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
        'pass': 'ADSLCJY123',
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


function capt_token(a,b){//4a0d6b5d-347f-4fce-8928-15a2b48164a5
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

function reserve_info(token){
  return new Promise((resolve, reject)=>{
     var url= `https://leosys.cn/axhu/rest/v2/history/1/50?page=1`   
     var option ={
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
            'actCode' : `true`,
            'token': token
        }
      }
      request(option, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(body)
        }else{
          reject(body.message)
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


