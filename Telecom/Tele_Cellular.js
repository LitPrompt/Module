/*
[task_local]
#电信余量
0-59/5 * * * * https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Cellular.js, tag=电信余量, enabled=true
*/

const $ = new Env(`电信余量`)

!(async () => {
    let panel = {
        title: '电信余量',
        content: ``,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }
    Month0=formatTime().month-1
	Month1=formatTime().month
	if(Month1==1){Month0=12}
	if(Month0<=9){Month0='0'+Month0}
	if(Month1<=9){Month1='0'+Month1}
		
    let oldtime =`${formatTime().year}`+`${Month0}`
	let thistime=`${formatTime().year}`+`${Month1}`
	if(formatTime().day==1&&Tele_body.indexOf(oldtime)!=-1){//月初Body信息修改
		let Tele_body1= Tele_body.replace(oldtime,thistime)
		$.write(Tele_body1,'Tele_BD')
	}
	thishours=formatTime().hours
    thisminutes=formatTime().minutes
    Days=formatTime().day
    lasthours=$.read('hourstimeStore')
    lastminutes=$.read('minutestimeStore')
    hoursused=thishours-lasthours

	if(hoursused>=0){minutesused=(thisminutes-lastminutes)+hoursused*60} //上次查询的时间大于等于当前查询的时间
    else if(hoursused<0&&lasthours==23){minutesused=(60-lastminutes)+thishours*60+thisminutes} 
    //**********

    let Tele_body = $.read("Tele_BD");
    let brond=$.read('key_brond')
	let Timer_Notice=$.read('notice_switch')
	let Tele_value=$.read('threshold')

	let Tile_All={Tile_Today:'',Tile_Month:'',Tile_Time:''}
    
    Query(Tele_body).then(result=>{
        let ArrayQuery=Query_All(result)

        if(brond==''){
        	for(var s=0;s+1<=result.RESULTDATASET.length;s++)
			{
				let typeid = result.RESULTDATASET[s].OFFERTYPE
				if(typeid==11){var brondid=s}
			}
			brond = result.RESULTDATASET[brondid].PRODUCTOFFNAME
			$.write(brond,"key_brond")
    	}  	
        limitThis=ArrayQuery.limitusage//通用使用量
        unlimitThis=ArrayQuery.unlimitusage//定向使用量
        limitLast=$.read("limitStore") //将上次查询到的值读出来
        unlimitLast=$.read("unlimitStore") //将上次查询到的值读出来
        $.log("当前通用使用"+limitThis)
		$.log("当前定向使用"+unlimitThis)
		$.log("上次通用使用"+limitLast)
		$.log("上次定向使用"+unlimitLast)
        try{
            if(limitLast==null||limitThis-limitLast<0||Dates==1&&Tele_body.indexOf(oldtime)!=-1){throw 'limiterr'}
            if(unlimitLast==null||unlimitThis-unlimitLast<0||Dates==1&&Tele_body.indexOf(oldtime)!=-1){throw 'unlimiterr'}
        }catch(e){
            if(e=='limiterr'){
                $.write(0,'limitStore')
                title="当前为初次查询或上次查询有误"
				body='已将上次通用查询归0'
				body1=''
                Notice(title,body,body1)
            }
            if(e=='unlimiarr'){
                $.write(0,'unlimitStore')
                title="当前为初次查询或上次查询有误"
    			body='已将上次定向查询归0'
            	body1=''
                Notice(title,body,body1)
            }
        }
        limitChange=limitThis-limitLast
		unlimitChange=unlimitThis-unlimitLast
		$.log("定向变化量:"+unlimitChange)
		$.log("通用变化量:"+limitChange)
  		if(limitChange!=0){$.write(ArrayQuery.limitusage,"limitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  		if(unlimitChange!=0){$.write(ArrayQuery.unlimitusage,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
        
        //***********

        let tile_date=$.read('day')
		if(tile_date==undefined){$.write(Days,'day')}//初次
		let tile_unlimittoday=$.read('unlimittoday')
		let tile_limittoday=$.read('limittoday')
  		if((thishours==0&&thisminutes==0)||(tile_unlimittoday==undefined||tile_limittoday==undefined)||tile_date!=Days)//面板更新时间
		{
			$.write(Days,'day')
			$.write(ArrayQuery.unlimitusage,'unlimittoday')
			$.write(ArrayQuery.limitusage,'limittoday')
		}
		tile_unlimitTotal=ArrayQuery.unlimitusage-tile_unlimittoday//面板今日定向用量
		tile_limitTotal=ArrayQuery.limitusage-tile_limittoday//面板今天通用用量
		tile_unlimitUsageTotal=ArrayQuery.unlimitusage//面板本月定向使用量
		tile_limitUsageTotal=ArrayQuery.limitusage//面板本月通用使用量

        if(thishours<10){tile_hour='0'+thishours}
		else{tile_hour=thishours}
    	if(thisminutes<10){tile_minute='0'+thisminutes}
		else{tile_minute=thisminutes}

		Tile_All['Tile_Today']=ToSize(tile_unlimitTotal,0,0,1)+'/'+ToSize(tile_limitTotal,0,0,1)
		Tile_All['Tile_Month']=ToSize(tile_unlimitUsageTotal,0,0,1)+'/'+ToSize(tile_limitUsageTotal,0,0,1)
		Tile_All['Tile_Time']=tile_hour+':'+tile_minute

		let notice_body=$.read('notice_body').split('/')

		if(Timer_Notice=="true"&&(limitChange>Tele_value||unlimitChange>Tele_value)){
			$.write(thishours,"hourstimeStore")
			$.write(thisminutes,"minutestimeStore") 
			title=brond+'  耗时:'+minutesused+'分钟'
			body=notice_body[0]+ToSize(unlimitChange,2,1,1)+' '+notice_body[1]+ToSize(limitChange,2,1,1)
			body1=notice_body[2]+ToSize(ArrayQuery.unlimitusage,2,1,1)+' '+notice_body[3]+ToSize(ArrayQuery.limitleft,2,1,1)
			Notice(title,body,body1)
		}else if(Timer_Notice=="false"){
			$.write(thishours,"hourstimeStore")
			$.write(thisminutes,"minutestimeStore") 
			title=brond+'  耗时:'+minutesused+'分钟'
			body=notice_body[0]+ToSize(unlimitChange,2,1,1)+' '+notice_body[1]+ToSize(limitChange,2,1,1)
			body1=notice_body[2]+ToSize(ArrayQuery.unlimitusage,2,1,1)+' '+notice_body[3]+ToSize(ArrayQuery.limitleft,2,1,1)
			Notice(title,body,body1)

		}

    }).catch(e=>{

        if(e=="010040"){
            title="Body错误或已过期❌（也可能是电信的问题）"
            body='请尝试重新抓取Body(不抓没得用了！)'
            body1="覆写获取到Body后可以不用关闭覆写"
			Notice(title,body,body1)
            let loginerror=1
            $.write(loginerror,'Bodyswitch')
        }else{
            $.log(e)
        }

    }).finally(() => {
		panel['title']=brond
		panel['content']='今日免流/跳点：'+Tile_All['Tile_Today']+`\n`+'本月免流/跳点：'+Tile_All['Tile_Month']+`\n`+'查询时间：'+Tile_All['Tile_Time']
        $done(panel)
      })
      

})()

async function Query(Tele_body){//余量原始数据
    return new Promise((resolve,reject)=>{
        $.post({
            url: 'https://czapp.bestpay.com.cn/payassistant-client?method=queryUserResource',
			headers: "",
    		body: Tele_body, // 请求体
        }, function (error,response,data){
            jsondata=JSON.parse(data)
            if(error){
                reject('网络请求错误❌，请检查')
                return
            }
            if(jsondata.RESPONSECODE=="010040"){
				$.write(data,'packge_detail')
                reject(jsondata.RESPONSECODE)//010040
                return
            }
            if(jsondata.RESPONSECODE=="000000"){
				$.write(data,'packge_detail')
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

    let x = $.read("limititems").split(' ');//通用正则选择
	let y = $.read('unlimititems').split(' ');//定向正则选择
	let packge_switch = $.read("auto_switch");//自动选包开关

    if(packge_switch=='true'){
    for(var s in jsonData.RESULTDATASET){
        const k = jsonData.RESULTDATASET[s].RATABLERESOURCEID//获取包名id判断定向与通用
        if(k==3312000||k==331202||k==351100||k==3511000)//判断定向
		{
			unlimitratableAmount =jsonData.RESULTDATASET[s].RATABLEAMOUNT//单包定向总量
			unlimitbalanceAmount =jsonData.RESULTDATASET[s].BALANCEAMOUNT//单包定向余量
			unlimitusageAmount =jsonData.RESULTDATASET[s].USAGEAMOUNT//单包定向使用量
			unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
			unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
			unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
		}
		if(k==3311000||k==3321000||k==331100)//判断通用
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
    let bark_key=$.read('bark_key')
	let icon_url=$.read('bark_icon')
    if(bark_key)
    {
        let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}

	let bark_other=$.read('bark_add')
  	let effective=bark_icon.indexOf("?icon")
  	if((effective!=-1)&&bark_other){bark_other=`&${bark_other}`}
	else if((effective==-1)&&bark_other){bark_other=`?${bark_other}`}
	else{bark_other=''}
	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

	$.post({url})
    }else{$.notice(title,body,body1)}
	
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


function Env(name) {
  LN = typeof $loon != `undefined`
  SG_STH_SDR = typeof $httpClient != `undefined` && !LN
  QX = typeof $task != `undefined`
  read = (key) => {
    if (LN || SG_STH_SDR) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG_STH_SDR) return $persistentStore.write(String(key), val); 
    if (QX) return $prefs.setValueForKey(String(key), val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG_STH_SDR) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { 'open-url': url })
  }
  get = (url, cb) => {
    if (LN || SG_STH_SDR) {$httpClient.get(url, cb)}
    if (QX) {url.method = `GET`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG_STH_SDR) {$httpClient.post(url, cb)}
    if (QX) {url.method = `POST`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  toObj = (str) => JSON.parse(str)
  toStr = (obj) => JSON.stringify(obj)
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { name, read, write, notice, get, post, toObj, toStr, log, done }
}