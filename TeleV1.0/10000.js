//var cookie = ''
var i =  $persistentStore.read("limit");
 //选择第几个包
var j =  $persistentStore.read("limit_items");
 //items，默认包只有一个items
var x =  $persistentStore.read("unlimit");

var y =  $persistentStore.read("unlimit_items");
var nt = $persistentStore.read("notice_switch");


//这需要你有json取数基础，后期会优化，对https://e.189.cn/store/user/package_detail.do给出的数据选取

var jsonData //存储json数据
var Minutes
var Hours
var dateObj
var brond //卡名
var unlimitproductOFFName //定向包名
var unlimitratableAmount //定向包总
var unlimitbalanceAmount //定向剩余量
var unlimitusageAmount //定向使用量

var limitproductOFFName //通用包名
var limitratableAmount //通用包总量
var limitbalanceAmount //通用剩余量
var limitusageAmount //通用使用量

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

const Cookies = $persistentStore.read("Tele_CK");

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
	if(logininfo==-10001){
		$notification.post("Cookies错误或已过期❌","请尝试重新抓取Cookies(不抓没得用了！)","")
		$done()}
   	limit_CellularChoose()
  	unlimit_CellularChoose()

	dateObj = $script.startTime//获取时间
	Minutes = dateObj.getMinutes();//获取分钟
    Hours = dateObj.getHours(); //获取小时

	thishours=Hours //将当前查询的小时存到hours中
	thisminutes=Minutes //将当前查询的时间存到thisminute中
   	limitThis=limitusageAmount //将当前查询的值存到limitThis中
  	unlimitThis=unlimitusageAmount //将当前查询的值存到unlimitThis中
  
	lasthours = $persistentStore.read("hourstimeStore")
    lastminutes=$persistentStore.read("minutestimeStore") //将上次查询到的时间读出来
    limitLast=$persistentStore.read("limitStore") //将上次查询到的值读出来
  	unlimitLast=$persistentStore.read("unlimitStore") //将上次查询到的值读出来

	hoursused=thishours-lasthours

	if(hoursused>=0){minutesused=(thisminutes-lastminutes)+hoursused*60} //上次查询的时间等于当前查询的时间
	else{minutesused=(59-lastminutes)+thisminutes} 

  	limitUsed=((limitThis-limitLast)/1024).toFixed(3) //跳点转成mb保留三位
  	unlimitUsed=((unlimitThis-unlimitLast)/1024).toFixed(2)//免流转化成mb保留两位小数

  	if(limitUsed!=0){$persistentStore.write(limitusageAmount,"limitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  	if(unlimitUsed!=0){$persistentStore.write(unlimitusageAmount,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
  	
   	limit_check()
  	unlimit_check()
	notice()
	//tiles()
	$done()
  }
 
)

//  retableResourceID:
// 定向：3312000
// 本月通用；3311000
// 通用结转；3321000



function limit_CellularChoose() //通用选择
{
  	limitproductOFFName = jsonData.items[i].productOFFName
  	limitratableAmount = jsonData.items[i].items[j].ratableAmount//总
  	limitbalanceAmount = jsonData.items[i].items[j].balanceAmount //剩
  	limitusageAmount = jsonData.items[i].items[j].usageAmount //已用
}

function unlimit_CellularChoose() //定向选择
{
  	unlimitproductOFFName = jsonData.items[x].productOFFName
  	unlimitratableAmount = jsonData.items[x].items[y].ratableAmount //总
  	unlimitbalanceAmount = jsonData.items[x].items[y].balanceAmount //剩
  	unlimitusageAmount = jsonData.items[x].items[y].usageAmount //已用
}

function notice()
{

	for(var s=0;jsonData.items[s].offerType==11;s++)//从json中筛选出卡名
	brond = jsonData.items[s].productOFFName
	if(nt=="true")
	{  	
		if(limitUsed>0||unlimitUsed>0)
		{
			$persistentStore.write(thishours,"hourstimeStore")
			$persistentStore.write(thisminutes,"minutestimeStore") 
			$notification.post(brond+'  耗时:'+minutesused+'分钟','免'+unlimitUsed+' MB '+' 跳 '+limitUsed+'MB','')}
		}
	else
	{
		$persistentStore.write(thisminutes,"minutestimeStore")  
		$persistentStore.write(thishours,"hourstimeStore")
		$notification.post(brond+'  耗时:'+minutesused+'分钟','免'+unlimitUsed+' MB '+' 跳 '+limitUsed+'MB','')
	}
}

function tiles()
{
	var mian = "免："+unlimitUsed+" M  " ;
	var tiao = "跳："+limitUsed+" M";
	var limitleft = limitproductOFFName+"剩余："+limitbalanceAmount+" G";
	var unlimitleft = unlimitproductOFFName+"剩余："+unlimitbalanceAmount+" G";
	body={
        title: "测试信息" ,
        content: `${mian}${tiao}\n${limitleft}\n${unlimitleft}`,
        backgroundColor: "#009944",
        icon: "dial.max.fill",
    }
	$done(body);
}

function limit_check()
{
  	limitThis=(limitThis/1048576).toFixed(3) //本次查询用量转化成gb保留两位小数
  	limitLast=(limitLast/1048576).toFixed(3) //上次查询用量转化成gb保留两位小数
   	limitusageAmount=(limitusageAmount/1048576).toFixed(3)// 通用已使用量
	limitbalanceAmount=(limitbalanceAmount/1048576).toFixed(3) //通用剩余转化成gb保留两位小数
   
  if(limitThis-limitLast>0)
 {
   	console.log('当前'+limitproductOFFName+'跳点为：'+limitUsed+' MB')
   	console.log('通用当前使用：'+limitThis+' GB')
    console.log('通用上次使用：'+limitLast+' GB')
   	console.log(limitproductOFFName+'累计已使用：'+limitusageAmount+' GB')
    console.log(limitproductOFFName+'剩余：'+limitbalanceAmount +' GB')
     
  }
 else 
   {
   	console.log('无跳点')
    console.log('通用当前使用：'+limitThis+' GB')
    console.log('通用上次使用：'+limitLast+' GB')
    console.log(limitproductOFFName+'累计已使用：'+limitusageAmount+' GB')
    console.log(limitproductOFFName+'剩余：'+limitbalanceAmount +' GB')
   }
}

function unlimit_check()
{
 	unlimitbalanceAmount=(unlimitbalanceAmount/1048576).toFixed(2) //转化成gb保留两位小数
 	unlimitThis=(unlimitThis/1048576).toFixed(2) //转化成gb保留两位小数
	unlimitLast=(unlimitLast/1048576).toFixed(2) //转化成gb保留两位小数
 	unlimitusageAmount=(unlimitusageAmount/1048576).toFixed(2)
 
    if(unlimitThis-unlimitLast>0)
 {
  	console.log('当前'+unlimitproductOFFName+'已免流量为：'+unlimitUsed+' MB')
  	console.log('定向当前使用：'+unlimitThis+' GB')
    console.log('定向上次使用：'+unlimitLast+' GB')
     
  }
 else 
   {
    console.log('定向当前使用：'+unlimitThis+' GB')
    console.log('定向上次使用：'+unlimitLast+' GB')
    console.log(unlimitproductOFFName+'定向已使用：'+ unlimitusageAmount+' GB')
    console.log(unlimitproductOFFName+'定向剩余：'+unlimitbalanceAmount +' GB')
   }
}