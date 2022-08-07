//var cookie = ''
var i = 1 //选择第几个包
var j = 0 //items，默认包只有一个items
//这需要你有json取数基础，后期会优化，对https://e.189.cn/store/user/package_detail.do给出的数据选取

var jsonData //存储json数据
var productOFFName //包名
var ratableResourcename //包名下属名
var balanceAmount //剩余量
var usageAmount //使用量
var Last //上次的使用量
var This //当前使用量
var Store //定义存储池key
var Used
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
 	
	console.log(data)
    jsonData = JSON.parse(data)
  	CellularChoose()
  
  	This=usageAmount //将当前查询的值存到This中
 	Last=$persistentStore.read(Store) //将上次查询到的值存到Store中

 	 //usageAmount = (usageAmount/1024).toFixed(2) //转换成mb保留 两位小数
 	balanceAmount=(balanceAmount/1048576).toFixed(2) //转化成gb保留两位小数
  	Used=((This-Last)/1024).toFixed(3)//转化成mb保留三位小数

  	if(Used!=0){$persistentStore.write(usageAmount,Store)}  //进行判断是否将本次查询到的值存到本地存储器中供下次使用
 	check()
 
  	$done()
  }
 
)



function CellularChoose()
{
 	productOFFName = jsonData.items[i].productOFFName
 	ratableResourcename = jsonData.items[i].items[j].ratableResourcename
 	balanceAmount = jsonData.items[i].items[j].balanceAmount
 	usageAmount = jsonData.items[i].items[j].usageAmount
}

function check()
{
   if(This-Last>0)
	{
		console.log('当前使用：'+This+' KB')
  	 	console.log('上次使用：'+Last+' KB')
  	 	console.log('当前'+productOFFName+ratableResourcename+'跳点为：'+Used+' MB')
 	}
   else 
  	{
  		console.log('当前使用：'+This+' KB')
  		console.log('上次使用：'+Last+' KB')
  		console.log('无跳点')
  		console.log(productOFFName+ratableResourcename+'已使用：'+(usageAmount/1024).toFixed(2) +' MB')
 		console.log(productOFFName+ratableResourcename+'剩余：'+balanceAmount +' GB')
   }
}

