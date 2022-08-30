var ns = $persistentStore.read("notice_switch");
var auto = $persistentStore.read("auto_switch");
var Tele_body = $persistentStore.read("Tele_BD");
var Tele_value= $persistentStore.read("threshold")
let bark_key=$persistentStore.read('bark_key')
let icon_url=$persistentStore.read('bark_icon')

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
		title="Body错误或已过期❌（也可能是电信的问题）"
		body='请尝试重新抓取Body(不抓没得用了！)'
		body1="覆写获取到Body后可以不用关闭覆写"
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}	
		let loginerror=1
		$persistentStore.write(loginerror,'Bodyswitch')
		$done()
	}

//时间判断部分****
	dateObj = $script.startTime//获取时间
	Minutes = dateObj.getMinutes();//获取分钟
  	Hours = dateObj.getHours(); //获取小时
    Dates = dateObj.getHours(); //获取日期天
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
		$persistentStore.write(0,"limitStore")
		title="当前为初次查询或上次查询有误"
		body='已将上次查询归0'
		body1=''
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}	
	}//初次查询的判断
	if(unlimitLast==null||unlimitThis-unlimitLast<0)
	{
		$persistentStore.write(0,"unlimitStore")
		title="当前为初次查询或上次查询有误"
		body='已将上次上旬归0'
		body1=''
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}		
	}
  	limitChange=limitThis-limitLast
	unlimitChange=unlimitThis-unlimitLast
	console.log("定向变化量:"+unlimitChange)
	console.log("通用变化量:"+limitChange)
  	if(limitChange!=0){$persistentStore.write(limitusagetotal,"limitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  	if(unlimitChange!=0){$persistentStore.write(unlimitusagetotal,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
//*******
    let tile_date=$persistentStore.read('day')
	if(tile_date==undefined){$persistentStore.write(Dates,'day')}//初次
	let tile_unlimittoday=$persistentStore.read('unlimittoday')
	let tile_limittoday=$persistentStore.read('limittoday')
  	if((Hours==0&&Minutes==0)||(tile_unlimittoday==undefined||tile_limittoday==undefined)||tile_date!=Dates)
	{
		$persistentStore.write(Dates,'day')
		$persistentStore.write(unlimitusagetotal,'unlimittoday')
		$persistentStore.write(limitusagetotal,'limittoday')
	}
	let tile_unlimitTotal=unlimitusagetotal-tile_unlimittoday
	let tile_limitTotal=limitusagetotal-tile_limittoday

	if(tile_unlimitTotal>1022976){tile_unlimitTotal=(tile_unlimitTotal/1048576).toFixed(2)+'GB'}
	else{tile_unlimitTotal=(tile_unlimitTotal/1024).toFixed(0)+'MB'}
	if(tile_limitTotal>1022976){tile_limitTotal=(tile_limitTotal/1048576).toFixed(2)+'GB'}
	else{tile_limitTotal=(tile_limitTotal/1024).toFixed(0)+'MB'}
	notice()//通知部分
    
	if(Hours<10){tile_hour='0'+Hours}
	else{tile_hour=Hours}
    if(Minutes<10){tile_minute='0'+Minutes}
	else{tile_minute=Minutes}

	body={
        title: `${brond}`,
        content: `今日免流/跳点：${tile_unlimitTotal}/${tile_limitTotal}\n查询时间：${tile_hour}:${tile_minute}`,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }
	$done(body)
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
			title=brond+'  耗时:'+minutesused+'分钟'
			body='免'+unlimitUsed+' 跳'+limitUsed+' MB'
			body1='总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB'
			if(bark_key){bark_notice(title,body,body1)}
			else{$notification.post(title,body,body1)}	
		  	console.log('免 '+unlimitUsed+' MB '+'  跳 '+limitUsed+' MB')
			console.log('总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB')
		}
	}
	else//默认定时通知
	{
		$persistentStore.write(thisminutes,"minutestimeStore")  
		$persistentStore.write(thishours,"hourstimeStore")
		title=brond+'  耗时:'+minutesused+'分钟'
		body='免'+unlimitUsed+' 跳'+limitUsed+' MB'
		body1='总免'+unlimitusagetotal+' GB '+' 剩余'+limitbalancetotal+' GB'
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}	
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

function bark_notice(title,body,body1){
	let bark_title=title
	let bark_body=body
	let bark_body1=body1

	let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}

	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}`

	$httpClient.get({url})
}
