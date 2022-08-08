var i =  $persistentStore.read("limit");
var j =  $persistentStore.read("limit_items");
var x =  $persistentStore.read("unlimit");
var y =  $persistentStore.read("unlimit_items");
var jsonData //存储json数据
var unlimitproductOFFName //定向包名
var unlimitratableAmount //定向包总
var unlimitbalanceAmount //定向剩余量
var unlimitusageAmount //定向使用量
var limitproductOFFName //通用包名
var limitratableAmount //通用包总量
var limitbalanceAmount //通用剩余量
var limitusageAmount //通用使用量
var limitLast
var limitThis //通用与定向的使用量
var unlimitThis
var unlimitLast //通用与定向当前使用量
var limitStore 
var unlimitStore //定义通用与定向的存储池key
var limitUsed 
var unlimitUsed //通用差值与定向差值

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
  	limit_CellularChoose()
	unlimit_CellularChoose()
    
  	limitThis=limitusageAmount //将当前查询的值存到limitThis中
	unlimitThis=unlimitusageAmount //将当前查询的值存到unlimitThis中
		
	limitLast=$persistentStore.read("limitStore") //将上次查询到的值存到limitStore中
		//limitLast =1000
	unlimitLast=$persistentStore.read("unlimitStore") //将上次查询到的值存到unlimitStore中
		
	limitUsed=((limitThis-limitLast)/1024).toFixed(3)//通用跳点转化成mb保留三位小数
		//console.log(limitUsed)
	unlimitUsed=((unlimitThis-unlimitLast)/1024).toFixed(3)//免流转化成mb保留三位小数

	if(limitUsed!=0){$persistentStore.write(limitusageAmount,"c")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
		
	if(unlimitUsed!=0){$persistentStore.write(unlimitusageAmount,"unlimitStore")}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
 	//$done()
	limit_check()
	unlimit_check()

  	$done()
  }
 
)

function limit_CellularChoose() //通用选择
{
 	limitproductOFFName = jsonData.items[i].productOFFName
 	limitratableAmount = jsonData.items[i].items[j].limitratableAmount//总
 	limitbalanceAmount = jsonData.items[i].items[j].balanceAmount //剩
 	limitusageAmount = jsonData.items[i].items[j].usageAmount //已用
}

function unlimit_CellularChoose() //定向选择
{
 	unlimitproductOFFName = jsonData.items[x].productOFFName
 	unlimitratableAmount = jsonData.items[x].items[y].unlimitratableAmount //总
 	unlimitbalanceAmount = jsonData.items[x].items[y].balanceAmount //剩
 	unlimitusageAmount = jsonData.items[x].items[y].usageAmount //已用
}


function limit_check()
{
	limitThis=(limitThis/1048576).toFixed(2) //转化成gb保留两位小数
	limitLast=(limitLast/1048576).toFixed(2) //转化成gb保留两位小数
	limitusageAmount=(limitusageAmount/1048576).toFixed(2)
	limitbalanceAmount=(limitbalanceAmount/1048576).toFixed(2) //转化成gb保留两位小数
   
	if(limitThis-limitLast>0)
	{
		console.log('通用当前使用：'+limitThis+' GB')
  	 	console.log('通用上次使用：'+limitLast+' GB')
  	 	console.log('当前'+limitproductOFFName+'跳点为：'+limitUsed+' MB')
 	}
	else 
  	{
  		console.log('通用当前使用：'+limitThis+' GB')
  		console.log('通用上次使用：'+limitLast+' GB')
  		console.log('无跳点')
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
		console.log('定向当前使用：'+unlimitThis+' GB')
  	 	console.log('定向上次使用：'+unlimitLast+' GB')
  	 	console.log('当前'+unlimitproductOFFName+'已免流量为：'+unlimitUsed+' MB')
 	}
	else 
  	{
  		console.log('定向当前使用：'+unlimitThis+' GB')
  		console.log('定向上次使用：'+unlimitLast+' GB')
  		console.log(unlimitproductOFFName+'定向已使用：'+ unlimitusageAmount+' GB')
 		console.log(unlimitproductOFFName+'定向剩余：'+unlimitbalanceAmount +' GB')
   }
}