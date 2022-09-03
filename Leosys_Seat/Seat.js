
let userid_info=$persistentStore.read("userid_info").split(' ')

dateObj = $script.startTime//获取时间
data=dateObj.getDate()
month=dateObj.getMonth()+1
year=dateObj.getFullYear()
hours=dateObj.getHours()
minutes=dateObj.getMinutes()
let time=year+"-"+month+"-"+data
let times=hours+"点"+minutes+"分"

const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : $persistentStore.read("LeoSys_Token"),
'user_ip' : `192.168.199.100`,
};
const body = ``;

$httpClient.get(
    {
      url: `https://leosys.cn/axhu/rest/v2/room/layoutByDate/2/${time}`,
      headers: headers,
      body: body, 
    },
  (error, response, data) => {
		//console.log(data)
    jsondata = JSON.parse(data);
		token_get(jsondata)//token获取
		let seatarr=seat_info(time)
		console.log('总共'+seatarr.totalseat+' 正在使用中'+seatarr.inuse+' 剩余'+seatarr.free)
		let reservearr=reserve_info()//预约信息

		if((reservearr.begin).split(':')[0]==(hours+1)){check_in(reservearr)}

    $done()
})


//签到函数
function check_in(reservearr){
	let seat_id=reservearr.id
	let seat_loc=reservearr.loc

	$httpClient.get(
		{
		url: `https://leosys.cn/axhu/rest/v2/checkIn/${seat_id}`,
		headers: headers
		},(error,response,data)=>{
		jsondata = JSON.parse(data);
	  	if(jsondata.status=='fail'){$notification.post('签到失败 原因：',jsondata.message,'')}
		else{$notification.post('签到成功 ',jsondata.message,seat_loc)}
  })
 
}

//预约信息
function reserve_info(){
	$httpClient.get(
    {
      url: `https://leosys.cn/axhu/rest/v2/history/1/50?page=1`,
      headers: headers,
      body: '', 
    },
  (error, response, data) => {
    jsondata = JSON.parse(data);
		arr=jsondata.data.reservations[0]
		
		stringarr=JSON.stringify(arr)
		$persistentStore.write(stringarr,'reserve_info')
})
let reserveinfo=JSON.parse($persistentStore.read('reserve_info'))
return reserveinfo
}


//座位个数
function seat_info(time){
	$httpClient.get(
    {
      url: `https://leosys.cn/axhu/rest/v2/room/stats2/1/${time}`,
      headers: headers,
      body: '', 
    },
  (error, response, data) => {
    jsondata = JSON.parse(data);

		const datas=jsondata.data
		for(var k in datas){//座位个数判断
		if(datas[k].roomId==2){
				totalseat=datas[k].totalSeats
				inuse=datas[k].inUse
				free=datas[k].free}}
		arr={
		'totalseat':totalseat,
		'inuse':inuse,
		'free':free}
		stringarr=JSON.stringify(arr)
		$persistentStore.write(stringarr,'seat_info')
})
let seatinfo=JSON.parse($persistentStore.read('seat_info'))
return seatinfo
}


//token获取
function token_get(jsondata){
	if(jsondata.status=="fail"){
   //$notification.post('当前Token失效',jsondata.message,'开始尝试重新获取Token')
	//console.log('当前Token失效'+jsondata.message,'开始尝试重新获取Token')
    $httpClient.get(
     {
   url: `https://leosys.cn/axhu/rest/auth?username=${userid_info[0]}&password=${userid_info[1]}`,
   headers: {
      'token' : $persistentStore.read("LeoSys_Token"),
     'actCode' : `true`},
   body: '', 
	},(error,response,data)=>{
   tokendata = JSON.parse(data);
   //console.log(data)
	$persistentStore.write(tokendata.data.token,"LeoSys_Token")})
	//console.log('已成功获取Token'+headers.token,)
     //$notification.post('已成功获取Token',headers.token,'')
     }
}