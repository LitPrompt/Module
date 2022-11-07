/* *
[task_local]
#电信余量
0-59/5 * * * * https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Cellular.js, tag=电信余量, enabled=true
* */

const $ = new Env(`电信余量`)

!(async () => {
  try{
    let panel = {
        title: '电信余量',
        content: ``,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }
		
    let Month0=formatTime().month-1
	let Month1=formatTime().month
	if(Month1==1){Month0=12}
	if(Month0<=9){Month0='0'+Month0}
	if(Month1<=9){Month1='0'+Month1}
		
    let oldtime =`${formatTime().year}`+`${Month0}`
	let thistime=`${formatTime().year}`+`${Month1}`
	let loginerr=$.getdata('Bodyswitch')
	if(loginerr==undefined){//初次使用判断
		$.setdata($.toStr(0),'Bodyswitch')
		loginerr=$.getdata('Bodyswitch')
	}

	if(formatTime().day==1&&$.getdata("Tele_BD").indexOf(oldtime)!=-1&&loginerr==0){//月初Body信息修改
		Query($.getdata("Tele_BD"),loginerr).then(result=>{
		Notice('月初流量数据修正','通用修正：'+ToSize(Query_All(result).limitusage,2,0,1)+'  定向修正'+ToSize(Query_All(result).unlimitusage,2,0,1),'') })
		$.setdata(($.getdata("Tele_BD")).replace(oldtime,thistime),'Tele_BD')
	}
	
	
	let thishours=formatTime().hours
    let thisminutes=formatTime().minutes
    let Days=formatTime().day
    let lasthours=$.getdata('hourstimeStore')
    if(lasthours==undefined)lasthours=thishours    
    let lastminutes=$.getdata('minutestimeStore')
    if(lastminutes==undefined) lastminutes=thisminutes
    let hoursused=thishours-lasthours
	let minutesused,isFirst
	let interval=$.getdata('timeinterval')
	if(interval==undefined) {$.setdata($.toStr(5),'timeinterval')
	interval='5'
	}


	if(hoursused>=0){minutesused=(thisminutes-lastminutes)+hoursused*60} //上次查询的时间大于等于当前查询的时间
    else if(hoursused<0&&lasthours<=23){minutesused=(60-lastminutes)+(23-lasthours+thishours)*60+thisminutes} 
    //**********

    let Tele_body = $.getdata("Tele_BD");

	let Timer_Notice=$.getdata('notice_switch');
	if(Timer_Notice==undefined ) {
		$.setdata($.toStr(false),'notice_switch')
		Timer_Notice='false'
	}

	let Tele_value=$.getdata('threshold')

	if(Tele_value==undefined){$.setdata($.toStr(0),'threshold');Tele_value='0'}
	let Tile_All={Tile_Today:'',Tile_Month:'',Tile_Time:''}
    
	Query(Tele_body,loginerr).then(result=>{
        let ArrayQuery=Query_All(result)
		let brond=$.getdata('key_brond')
        if($.getdata('key_brond')==undefined){
        	for(var s=0;s+1<=result.RESULTDATASET.length;s++)
			{
				let typeid = result.RESULTDATASET[s].OFFERTYPE
				if(typeid==11){var brondid=s}
			}
			brond = result.RESULTDATASET[brondid].PRODUCTOFFNAME
			$.setdata(brond,"key_brond")
    	}  	

        let limitThis=ArrayQuery.limitusage//通用使用量
        let unlimitThis=ArrayQuery.unlimitusage//定向使用量
        let limitLast=$.getdata("limitStore") //将上次查询到的值读出来
        let unlimitLast=$.getdata("unlimitStore") //将上次查询到的值读出来
		if(limitLast==undefined&&unlimitLast==undefined) isFirst=true
		if(limitLast==undefined) limitLast=limitThis
		if(unlimitLast==undefined) unlimitLast=unlimitThis
		let limitChange=limitThis-limitLast
		let unlimitChange=unlimitThis-unlimitLast

        try{
            if(unlimitLast==''||unlimitThis-unlimitLast<0||limitLast==''||limitThis-limitLast<0||Dates==1&&Tele_body.indexOf(oldtime)!=-1) throw 'err'
        }catch(e){
            if(e=='err'){
                $.setdata($.toStr(0),'limitStore')
				$.setdata($.toStr(0),'unlimitStore')
                title="当前为初次查询或上次查询有误"
				body='已将上次查询归0'
				body1='下次通知可能会有误，不用在意'
				Notice(title,body,body1)
            }

        }
  		
        
        //***********

        let tile_date=$.getdata('day')

		if(tile_date==''){$.setdata($.toStr(Days),'day')}//初次
		let tile_unlimittoday=$.getdata('unlimittoday')
		let tile_limittoday=$.getdata('limittoday')
  		if((thishours==0&&thisminutes==0)||(tile_unlimittoday==''||tile_limittoday=='')||tile_date!=Days)//面板更新时间
		{
			$.setdata($.toStr(Days),'day')
			$.setdata($.toStr(ArrayQuery.unlimitusage),'unlimittoday')
			$.setdata($.toStr(ArrayQuery.limitusage),'limittoday')
		}
		let tile_unlimitTotal=ArrayQuery.unlimitusage-tile_unlimittoday//面板今日定向用量
		let tile_limitTotal=ArrayQuery.limitusage-tile_limittoday//面板今天通用用量
		let tile_unlimitUsageTotal=ArrayQuery.unlimitusage//面板本月定向使用量
		let tile_limitUsageTotal=ArrayQuery.limitusage//面板本月通用使用量

        if(thishours<10){tile_hour='0'+thishours}
		else{tile_hour=thishours}
    	if(thisminutes<10){tile_minute='0'+thisminutes}
		else{tile_minute=thisminutes}

		Tile_All['Tile_Today']=ToSize(tile_unlimitTotal,1,0,1)+'/'+ToSize(tile_limitTotal,1,0,1)
		Tile_All['Tile_Month']=ToSize(tile_unlimitUsageTotal,1,0,1)+'/'+ToSize(tile_limitUsageTotal,1,0,1)
		Tile_All['Tile_Time']=tile_hour+':'+tile_minute

		let notice_body=$.getdata('notice_body');
		if(notice_body==undefined)
		{notice_body=$.setdata("免/跳/总免/剩余",'notice_body')
		notice_body=$.getdata('notice_body').split('/')
	    }else{notice_body=$.getdata('notice_body').split('/')}

				
		$.log(`\n`+'流量卡名：'+brond+`\n`+'[1]'+brond+'通用：已用'+ToSize(ArrayQuery.limitusage,2,0,1)+`\n`+'[2]'+brond+'定向：已用'+ToSize(ArrayQuery.unlimitusage,2,0,1)+`\n`+'剩余流量：'+`\n`+'通用剩余：'+ToSize(ArrayQuery.limitleft,2,0,1)+' 定向剩余：'+ToSize(ArrayQuery.unlimitleft,2,0,1)+`\n`+'定时通知间隔：'+interval+' 分钟 流量变化阈值：'+ToSize(Tele_value,1,1,1))
		$.log("上次通用使用："+ToSize(limitLast,2,0,1)+" 当前通用使用："+ToSize(limitThis,2,0,1))
		$.log("上次定向使用："+ToSize(unlimitLast,2,0,1)+" 当前定向使用："+ToSize(unlimitThis,2,0,1))
		$.log("通用变化量："+ToSize(limitChange,2,0,1)+" 定向变化量："+ToSize(unlimitChange,2,0,1))
		


		if(Timer_Notice=="true"){
			$.log(`\n`+'当前为变化通知，变化阈值为：'+ToSize(Tele_value,1,0,1))
			if(limitChange>=Tele_value){
				$.setdata($.toStr(ArrayQuery.limitusage),"limitStore")
				$.setdata($.toStr(ArrayQuery.unlimitusage),"unlimitStore")
				$.setdata($.toStr(thishours),"hourstimeStore")
				$.setdata($.toStr(thisminutes),"minutestimeStore") 
				title=brond+'  耗时:'+formatMinutes(minutesused)
				body=notice_body[0]+ToSize(unlimitChange,2,1,1)+' '+notice_body[1]+ToSize(limitChange,2,1,1)
				body1=notice_body[2]+ToSize(ArrayQuery.unlimitusage,2,1,1)+' '+notice_body[3]+ToSize(ArrayQuery.limitleft,2,1,1)
				Notice(title,body,body1)
			}
			
		}else if(Timer_Notice=="false"){
		
			$.log(`\n`+'当前为定时通知，时间间隔为 '+interval+' 分钟')
			if(isFirst==true)$.log('首次使用：通知已发送！')
		  	if(minutesused>interval||isFirst==true){
			
				$.setdata($.toStr(ArrayQuery.limitusage),"limitStore")
				$.setdata($.toStr(ArrayQuery.unlimitusage),"unlimitStore")
				$.setdata($.toStr(thishours),"hourstimeStore")
				$.setdata($.toStr(thisminutes),"minutestimeStore") 
				title=brond+'  耗时:'+formatMinutes(minutesused)
				body=notice_body[0]+ToSize(unlimitChange,2,1,1)+' '+notice_body[1]+ToSize(limitChange,2,1,1)
				body1=notice_body[2]+ToSize(ArrayQuery.unlimitusage,2,1,1)+' '+notice_body[3]+ToSize(ArrayQuery.limitleft,2,1,1)
				Notice(title,body,body1)
          	 }
		}

    }).catch(e=>{
        if(e=="010040"&&loginerr==0){
            title="Body错误或已过期（也可能是电信的问题）"
            body='请尝试重新抓取Body(不抓没得用了！)'
            body1="覆写获取到Body后可以不用关闭覆写"
			Notice(title,body,body1)
            $.setdata($.toStr(1),'Bodyswitch')
        }else if(e=="010040"&&loginerr==1){
            $.log('失败原因：请重新登录')
        }else{$.log(e)}

    }).finally(() => {
		panel['title']=$.getdata('key_brond')
		panel['content']='今日免流/跳点：'+Tile_All['Tile_Today']+`\n`+'本月免流/跳点：'+Tile_All['Tile_Month']+`\n`+'查询时间：'+Tile_All['Tile_Time']
		$.done(panel)
      })
  }catch(e){$.log('错误：'+e)}   

})()

async function Query(Tele_body,loginerr){//余量原始数据
    return new Promise((resolve,reject)=>{
		if(($.isSurge()||$.isQuanX()||$.isShadowrocket())&&(Tele_body==''||loginerr==1)){
			reject('010040')
			return
			}
        $.post({
            url: 'https://czapp.bestpay.com.cn/payassistant-client?method=queryUserResource',
			headers: {
				'User-Agent':
				  'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
			  },
    		body: Tele_body, // 请求体
        }, function (error,response,data){
            jsondata=JSON.parse(data)
            if(error){
                reject('网络请求错误❌，请检查')
                return
            }
            if(jsondata.RESPONSECODE=="010040"){
				$.setdata(data,'packge_detail')
                reject(jsondata.RESPONSECODE)//010040
                return
            }
            if(jsondata.RESPONSECODE=="000000"){
				$.setdata(data,'packge_detail')
                resolve(jsondata)
                return
            }
            
        })
    })
}


function Query_All(jsonData){//原始量累计
    let unlimitratabletotal=0
    let unlimitbalancetotal=0
    let unlimitusagetotal=0
    let limitratabletotal=0
    let limitbalancetotal=0
    let limitusagetotal=0

    
	let packge_switch = $.getdata("auto_switch");//自动选包开关
	if(packge_switch==undefined) packge_switch='true'
	//35110000元30g小区流量
	//

    if(packge_switch=='true'){
    for(var s in jsonData.RESULTDATASET){
        const k = jsonData.RESULTDATASET[s].RATABLERESOURCEID//获取包名id判断定向与通用
        if(k==33120004||k==331202||k==351100||k==3511000||k==3312000||k==3312010||k==33120001||k==33140001||k==3322000)//判断定向
		{
			unlimitratableAmount =jsonData.RESULTDATASET[s].RATABLEAMOUNT//单包定向总量
			unlimitbalanceAmount =jsonData.RESULTDATASET[s].BALANCEAMOUNT//单包定向余量
			unlimitusageAmount =jsonData.RESULTDATASET[s].USAGEAMOUNT//单包定向使用量
			unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
			unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
			unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
		}
		if(k==33110004||k==33110001||k==33210001||k==33110104||k==33210004||k==331100||k==3311000||k==3321000)//判断通用
		{
			limitratableAmount =jsonData.RESULTDATASET[s].RATABLEAMOUNT//通用总量
			limitbalanceAmount =jsonData.RESULTDATASET[s].BALANCEAMOUNT//通用余量
			limitusageAmount =jsonData.RESULTDATASET[s].USAGEAMOUNT//通用使用量
			limitratabletotal+=Number(limitratableAmount)//总量累加
			limitbalancetotal+=Number(limitbalanceAmount)//余量累加
			limitusagetotal+=Number(limitusageAmount)//使用累加
		}
    }
    }else{
      let x = $.getdata("limititems").split(' ');//通用正则选择
	  let y = $.getdata('unlimititems').split(' ');//定向正则选择
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
    }
    let queryinfo={unlimitall:unlimitratabletotal,unlimitleft:unlimitbalancetotal,unlimitusage:unlimitusagetotal,limitall:limitratabletotal,limitleft:limitbalancetotal,limitusage:limitusagetotal}
    return queryinfo
}

function Notice(title,body,body1){
	let bark_title=title
	let bark_body=body
	let bark_body1=body1
    let bark_key=$.getdata('bark_key')
	let icon_url=$.getdata('bark_icon')
    if(bark_key)
    {
        let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}

	let bark_other=$.getdata('bark_add')
  	let effective=bark_icon.indexOf("?icon")
  	if((effective!=-1)&&bark_other){bark_other=`&${bark_other}`}
	else if((effective==-1)&&bark_other){bark_other=`?${bark_other}`}
	else{bark_other=''}
	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

	$.post({url})
    }else{$.msg(title,body,body1)}
	
}



function ToSize(kbyte,s,l,t) {//字节转换s保留位数l是否空格t是否单位
    let kbytes,i
	if (kbyte < 1024) {kbytes=kbyte/1024}
	else{kbytes=kbyte}
    let k = 1024;
    sizes = ["MB", "MB", "GB", "TB"];
	if(kbyte!=0){i = Math.floor(Math.log(kbyte) / Math.log(k));}//获取指数
	else{i=0}
	if(kbyte==0)s=0
	if(l==1&&t==1){
		return (kbytes / Math.pow(k, i)).toFixed(s) + " " + sizes[i];
	}else if(l==1&&t==0){
		return (kbytes / Math.pow(k, i)).toFixed(s) + " " ;
	}else if(l==0&t==1){
		return (kbytes / Math.pow(k, i)).toFixed(s) + sizes[i];
	}else{
		return (kbytes / Math.pow(k, i)).toFixed(s);
	}
}

function formatMinutes(value) {
  let minute = parseInt(value)
  let hour = 0
  let day = 0
  if (minute > 60) {
    hour = parseInt(minute / 60)
    minute = parseInt(minute % 60)
    if (hour > 23) {
      day = parseInt(hour / 24)
      hour = parseInt(hour % 24)
    }
  }

  let result = parseInt(minute) + '分钟'
  if (hour > 0) result = parseInt(hour) + '小时'
  if (day > 0) result = parseInt(day) + '天'
  return result
}

function formatTime() {
    let dateObj = new Date()//获取时间
	let Minutes = dateObj.getMinutes();//获取分钟
  	let Hours = dateObj.getHours(); //获取小时
    let Dates = dateObj.getDate(); //获取日期天
	let Month = dateObj.getMonth()+1//获取日期月
	let Year = dateObj.getFullYear()//获取日期年
    let objtime={year: Year, month: Month, day:Dates, hours:Hours, minutes:Minutes}
    return objtime
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
