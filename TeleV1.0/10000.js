var ns = $persistentStore.read("notice_switch");
const Cookies = $persistentStore.read("Tele_CK");

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

var hourstimeStore
var minutestimeStore
var limitStore 
var unlimitStore //定义通用与定向的存储池key

var hoursused
var minutesused
var limitUsed 
var unlimitUsed //通用差值与定向差值以及时间差值

$httpClient.post(
  {

	url: 'https://e.189.cn/store/user/package_detail.do',
	headers: {
      'Cookie': Cookies,
     },
     body: '{}', // 请求体
  },
  (error, response, data) => {
  
   //console.log(data)
  jsonData = JSON.parse(data)
	var logininfo=jsonData.result
	if(logininfo==-10001)
	{
		$notification.post("Cookies错误或已过期❌","请尝试重新抓取Cookies(不抓没得用了！)","")
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
	else if(hoursused<0&&lasthours==23){minutesused=(60-lastminutes)+lasthours*60+thisminutes} 
//******

	cellular()//取值部分

//流量判断部分
	limitThis=limitusagetotal //将当前查询的值存到limitThis中
  unlimitThis=unlimitusagetotal //将当前查询的值存到unlimitThis中
	limitLast=$persistentStore.read("limitStore") //将上次查询到的值读出来
  unlimitLast=$persistentStore.read("unlimitStore") //将上次查询到的值读出来
	if(limitLast==undefined){limitLast=0}//初次查询的判断
	if(unlimitLast==undefined){unlimitLast=0}
	
  limitUsed=((limitThis-limitLast)/1024).toFixed(3) //跳点转成mb保留三位
  unlimitUsed=((unlimitThis-unlimitLast)/1024).toFixed(2)//免流使用转化成mb保留两位小数
	
  if(limitUsed!=0){$persistentStore.write(limitusagetotal,"limitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  if(unlimitUsed!=0){$persistentStore.write(unlimitusagetotal,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
//*******
		notice()//通知部分
	    tiles()
		$done()
  }
 
)

//  retableResourceID:
// 定向：3312000
// 本月通用；3311000
// 通用结转；3321000


function notice()
{

	for(var s=0;jsonData.items[s].offerType==11;s++)//从json中筛选出卡名
	brond = jsonData.items[s].productOFFName
	limitbalancetotal=(limitbalancetotal/1048576).toFixed(2) //剩余转成mb保留两位
  unlimitusagetotal=(unlimitusagetotal/1048576).toFixed(2)//总免使用转化成gb保留两位小数
	if(ns=="true")//true时执行变化通知
	{  	
		if(limitUsed>0||unlimitUsed>0)
		{
			$persistentStore.write(thishours,"hourstimeStore")
			$persistentStore.write(thisminutes,"minutestimeStore") 
			$notification.post(brond+'  耗时:'+minutesused+'分钟'+'  总免'+unlimitusagetotal+' GB','免'+unlimitUsed+' MB '+' 跳'+limitUsed+' MB '+' 剩余'+limitbalancetotal+' GB','')}
		  //console.log(brond+'  耗时:'+minutesused+'分钟'+'  总免 '+unlimitusagetotal+' GB')
		//console.log('免'+unlimitUsed+' MB '+' 跳 '+limitUsed+'MB'+'剩余 '+limitbalancetotal+'GB')
	  }
	else//默认定时通知
	{
		$persistentStore.write(thisminutes,"minutestimeStore")  
		$persistentStore.write(thishours,"hourstimeStore")
		$notification.post(brond+'  耗时:'+minutesused+'分钟'+'  总免'+unlimitusagetotal+' GB','免'+unlimitUsed+' MB '+' 跳'+limitUsed+' MB '+' 剩余'+limitbalancetotal+' GB','')
		//console.log(brond+'  耗时:'+minutesused+'分钟'+'  总免'+unlimitusagetotal+' GB')
		//console.log('免'+unlimitUsed+' MB '+' 跳'+limitUsed+' MB '+' 剩余'+limitbalancetotal+' GB')
		
	}
}

function tiles()
{
	//var mian = "免："+unlimitUsed+" M  " ;
	//var tiao = "跳："+limitUsed+" M";
	//var limitleft = "剩余："+limitbalanceAmount+" G";
	//var unlimitleft = "剩余："+unlimitbalanceAmount+" G";
	//console.log("面板执行")

	body={
        title: "测试信息",
        content: `${brond}\n${brond}\n${brond}`,
        backgroundColor: "#FF6600",
        icon: "antenna.radiowaves.left.and.right.circle.fill",
    }
    $done(body)
}

function cellular()//流量包取值均为kb未转换
{
		i = jsonData.items.length;//获取第一个items长度
		
		//console.log(i)
		for(var a=1;a<=i;a++)
	{
		j = jsonData.items[a-1].items.length//获取第二个items长度
		//console.log(j)
		for(var b=1;b<=j;b++)
	{
		k = jsonData.items[a-1].items[b-1].ratableResourceID//获取包名id判断定向与通用
		if(k==3312000)//判断定向
		{
			unlimitratableAmount =jsonData.items[a-1].items[b-1].ratableAmount//单包定向总量
			unlimitbalanceAmount =jsonData.items[a-1].items[b-1].balanceAmount//单包定向余量
			unlimitusageAmount =jsonData.items[a-1].items[b-1].usageAmount//单包定向使用量
			
			unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
			unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
			unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
			
		}
		if(k==3311000||k==3321000)//判断通用
		{
			limitratableAmount =jsonData.items[a-1].items[b-1].ratableAmount//通用总量
			limitbalanceAmount =jsonData.items[a-1].items[b-1].balanceAmount//通用余量
			limitusageAmount =jsonData.items[a-1].items[b-1].usageAmount//通用使用量
			
			limitratabletotal+=Number(limitratableAmount)//总量累加
			limitbalancetotal+=Number(limitbalanceAmount)//余量累加
			limitusagetotal+=Number(limitusageAmount)//使用累加
		}
	 }
	}
	//console.log(unlimitratabletotal)
	//console.log(unlimitbalancetotal)
	//console.log(unlimitusagetotal)
	
	//console.log(limitratabletotal)
	//console.log(limitbalancetotal)
	//console.log(limitusagetotal)
	//console.log("")
	
}

	
