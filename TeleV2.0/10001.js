const $ = new Env(`电信余量`)

var ns = $persistentStore.read("notice_switch");
var auto = $persistentStore.read("auto_switch");
var Tele_body = $persistentStore.read("Tele_BD");
var Tele_value= $persistentStore.read("threshold")

var jsonData //存储json数据
var dateObj
var Minutes
var Hours
var brond //卡名

var unlimitratabletotal=0//初始化
var unlimitbalancetotal=0
var unlimitusagetotal=0

var limitratabletotal=0
var limitbalancetotal=0
var limitusagetotal=0

var lasthours
var thishours//上次查询与当前查询的小时
var lastminutes
var thisminutes//上次查询与当前查询的分钟
var limitLast
var limitThis //通用与定向的上次使用量
var unlimitThis
var unlimitLast //通用与定向当前使用量

var hoursused
var minutesused
var limitChange
var unlimitChange
var limitUsed
var unlimitUsed //通用差值与定向差值以及时间差值



$httpClient.post(
  {
	url: 'https://czapp.bestpay.com.cn/payassistant-client?method=queryUserResource',
	headers: "",
    body: Tele_body, // 请求体
  },
  (error, response, data) => {
  
    // console.log(data)
  	jsonData = JSON.parse(data)
	var logininfo=jsonData.RESPONSECODE
	// console.log(logininfo)
	if(logininfo=="010040")
	{
		$notification.post("Body错误或已过期❌（也可能是电信的问题）","请尝试重新抓取Body(不抓没得用了！)","覆写获取到Body后可以不用关闭覆写")
		$done()
	}

//时间判断部分****
	dateObj = $script.startTime//获取时间
	Minutes = dateObj.getMinutes();//获取分钟
  	Hours = dateObj.getHours(); //获取小时

  	thishours=Hours //将当前查询的小时存到hours中
	thisminutes=Minutes //将当前查询的时间存到thisminute中
	
	lasthours = $persistentStore.read("hourstimeStore")
  	lastminutes=$persistentStore.read("minutestimeStore") //将上次查询到的时间读出来
	if(lasthours==undefined){lasthours=Hours}//初次查询的判断
	if(lastminutes==undefined){lastminutes=Minutes}
	
	hoursused=thishours-lasthours

	if(hoursused>=0){minutesused=(thisminutes-lastminutes)+hoursused*60} //上次查询的时间大于等于当前查询的时间
	else if(hoursused<0&&lasthours==23){minutesused=(60-lastminutes)+thishours*60+thisminutes} 
//******
	i = jsonData.RESULTDATASET.length;//获取第一个items长度
	// console.log(i)
	if(auto=="true")
	{cellular()}//取值部分
	else
	{cellular_choose()}

//流量判断部分
	limitThis=limitusagetotal //将当前查询的值存到limitThis中
  	unlimitThis=unlimitusagetotal //将当前查询的值存到unlimitThis中
	limitLast=$persistentStore.read("limitStore") //将上次查询到的值读出来
  	unlimitLast=$persistentStore.read("unlimitStore") //将上次查询到的值读出来
	console.log("当前通用使用"+limitThis)
	console.log("当前定向使用"+unlimitThis)
	console.log("上次通用使用"+limitLast)
	console.log("上次定向使用"+unlimitLast)
	if(limitLast==null||limitThis-limitLast<0)
	{
		limitLast=0
		$notification.post("当前为初次查询或上次查询有误，已将上次查询归0",'','')
	}//初次查询的判断
	if(unlimitLast==null||unlimitThis-unlimitLast<0)
	{
		unlimitLast=0
		$notification.post("当前为初次查询或上次查询有误，已将上次查询归0",'','')
	}
  	limitChange=limitThis-limitLast
	unlimitChange=unlimitThis-unlimitLast
	console.log("定向变化量:"+unlimitChange)
	console.log("通用变化量:"+limitChange)
  	if(limitChange!=0){$persistentStore.write(limitusagetotal,"limitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  	if(unlimitChange!=0){$persistentStore.write(unlimitusagetotal,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
//*******

	notice()//通知部分
	//tiles()
	$done()
  }
 
)

//  retableResourceID:
// 定向：3312000
// 本月通用；3311000
// 通用结转；3321000


function notice()
{	
	brond=$persistentStore.read("key_brond")
	if(typeof brond=="undefined")
	{
		for(var s=0;s+1<=i;s++)
			{
				var typeid = jsonData.RESULTDATASET[s].OFFERTYPE
				if(typeid==11){var brondid=s}
			}
			brond = jsonData.RESULTDATASET[brondid].PRODUCTOFFNAME
			$persistentStore.write(brond,"key_brond")
		}
	
	limitUsed=(limitChange/1024).toFixed(3) //跳点转成mb保留三位
	if(unlimitChange<=1024000)
	{unlimitUsed=(unlimitChange/1024).toFixed(2)+' MB ' }//免流转成mb保留两位
	else
	{unlimitUsed=(unlimitChange/1048576).toFixed(2)+' GB '}//免流转换成gb
	
	if(limitChange==0){limitUsed=0}
	if(unlimitChange==0){unlimitUsed=0+' MB '}

	limitbalancetotal=(limitbalancetotal/1048576).toFixed(2) //剩余转成gb保留两位
  	unlimitusagetotal=(unlimitusagetotal/1048576).toFixed(2)//总免使用转化成gb保留两位小数
	if(ns=="true")//true时执行变化通知
	{  	
		if(limitChange>Tele_value||unlimitChange>Tele_value)
		{
			$persistentStore.write(thishours,"hourstimeStore")
			$persistentStore.write(thisminutes,"minutestimeStore") 
			$notification.post(brond+'  耗时:'+minutesused+'分钟','免'+unlimitUsed+' 跳'+limitUsed+' MB','总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB')
		  	console.log(brond+'  耗时:'+minutesused+'分钟')
		  	console.log('免 '+unlimitUsed+' MB '+'  跳 '+limitUsed+' MB')
			console.log('总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB')
		}
	}
	else//默认定时通知
	{
		$persistentStore.write(thisminutes,"minutestimeStore")  
		$persistentStore.write(thishours,"hourstimeStore")
		$notification.post(brond+'  耗时:'+minutesused+'分钟','免'+unlimitUsed+' 跳'+limitUsed+' MB','总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB')	
		console.log(brond+'  耗时:'+minutesused+'分钟')
		console.log('免 '+unlimitUsed+' MB '+'  跳 '+limitUsed+' MB')
		console.log('总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB')
		
	}
}


function cellular()//流量包取值均为kb未转换
{
		
		//console.log(i)
		for(var a=1;a<=i;a++)
	{
		k = jsonData.RESULTDATASET[a-1].RATABLERESOURCEID//获取包名id判断定向与通用
		if(k==3312000)//判断定向
		{
			unlimitratableAmount =jsonData.RESULTDATASET[a-1].RATABLEAMOUNT//单包定向总量
			unlimitbalanceAmount =jsonData.RESULTDATASET[a-1].BALANCEAMOUNT//单包定向余量
			unlimitusageAmount =jsonData.RESULTDATASET[a-1].USAGEAMOUNT//单包定向使用量
			unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
			unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
			unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
		}
		if(k==3311000||k==3321000)//判断通用
		{
			limitratableAmount =jsonData.RESULTDATASET[a-1].RATABLEAMOUNT//通用总量
			limitbalanceAmount =jsonData.RESULTDATASET[a-1].BALANCEAMOUNT//通用余量
			limitusageAmount =jsonData.RESULTDATASET[a-1].USAGEAMOUNT//通用使用量
			limitratabletotal+=Number(limitratableAmount)//总量累加
			limitbalancetotal+=Number(limitbalanceAmount)//余量累加
			limitusagetotal+=Number(limitusageAmount)//使用累加
		}
	
	}
	// console.log(unlimitratabletotal)
	// console.log(unlimitbalancetotal)
	// console.log(unlimitusagetotal)
	
	// console.log(limitratabletotal)
	// console.log(limitbalancetotal)
	// console.log(limitusagetotal)
	// console.log("")
	
}

	
function cellular_choose()
{
	var x = $persistentStore.read("limititems").split(' ');//通用正则选择
	var y = $persistentStore.read('unlimititems').split(' ');//定向正则选择

	for(var j=0;j+1<=jsonData.RESULTDATASET.length;j++){
		for(var i=0;i+1<=x.length;i++){
			const limitRegExp=new RegExp(x[i])//正则判断是否包含算选包正则
			if(limitRegExp.test(jsonData.RESULTDATASET[j].PRODUCTOFFNAME+jsonData.RESULTDATASET[j].RATABLERESOURCENAME)){
				limitusageAmount=jsonData.RESULTDATASET[j].USAGEAMOUNT//特定通用使用量
				limitbalanceAmount=jsonData.RESULTDATASET[j].BALANCEAMOUNT
				limitratableAmount=jsonData.RESULTDATASET[j].RATABLEAMOUNT	
				limitratabletotal+=Number(limitratableAmount)//总量累加
				limitbalancetotal+=Number(limitbalanceAmount)//余量累加
				limitusagetotal+=Number(limitusageAmount)//使用累加
			}
		}

	}

	
	for(var k=0;k+1<=jsonData.RESULTDATASET.length;k++){
		for(var e=0;e+1<=y.length;e++){
			const unlimitRegExp=new RegExp(y[e])//正则判断是否包含算选包正则
			if(unlimitRegExp.test(jsonData.RESULTDATASET[k].PRODUCTOFFNAME+jsonData.RESULTDATASET[k].RATABLERESOURCENAME)){
				unlimitusageAmount=jsonData.RESULTDATASET[k].USAGEAMOUNT//特定定向使用量
				unlimitbalanceAmount=jsonData.RESULTDATASET[k].BALANCEAMOUNT
				unlimitratableAmount=jsonData.RESULTDATASET[k].RATABLEAMOUNT
				unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
				unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
				unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
			}

		}

	}

	console.log(unlimitratabletotal)
	console.log(unlimitbalancetotal)
	console.log(unlimitusagetotal)
	
	console.log(limitratabletotal)
	console.log(limitbalancetotal)
	console.log(limitusagetotal)
	console.log("")
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,n]=i.split("@"),a={url:`http://${n}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),n=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(n);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:n}=t,a=s.decode(n,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:n}=t,a=i.decode(n,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:n,body:a},a)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}