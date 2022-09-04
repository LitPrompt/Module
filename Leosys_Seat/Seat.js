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
//'FULL' 不可用
//'IN_USE' 正在使用
//'FREE' 空闲
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

	let allfree=''
	let allfull=''
	
	if(jsondata.data==null){$notification.post('当前数据查询失败','原因：'+jsondata.message,'')}
else{
	for(var i in jsondata.data.layout){
			if(jsondata.data.layout[i].type=='seat'&&jsondata.data.layout[i].status=='FREE'){	allfree+=jsondata.data.layout[i].name+'空余 '}
			
if(jsondata.data.layout[i].type=='seat'&&jsondata.data.layout[i].status=='FULL'){	allfull+=jsondata.data.layout[i].name+'不可用 '}
			
	}
}

  let reservearr=reserve_info()//预约信息

  if((reservearr.begin.split(':')[0]==(hours-1)||reservearr.begin.split(':')[0]==hours)&&reservearr.stat=='RESERVE'){check_in(reservearr)}
  else{
		if(allfull||allfree){
   $notification.post(seatarr.room+'座位信息 总共:'+seatarr.totalSeats,'正在使用中:'+seatarr.inUse+' 剩余:'+seatarr.free+' 已预约:'+seatarr.reserved,'< '+allfull+'>'+`\n`+'<'+allfree+'>')}
else{console.log('--------------------------------------------------')}	
	}
    $done()
})


//签到函数
function check_in(reservearr){
 let seat_id=reservearr.id
 let seat_loc=reservearr.loc
 console.log('预约座位id：'+seat_id)
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

  stringarr=JSON.stringify(jsondata.data[1])
  $persistentStore.write(stringarr,'seat_info')
})
let seatinfo=JSON.parse($persistentStore.read('seat_info'))
return seatinfo
}


//token获取
function token_get(jsondata){
 if(jsondata.status=="fail"){
    $httpClient.get(
     {
   url: `https://leosys.cn/axhu/rest/auth?username=${userid_info[0]}&password=${userid_info[1]}`,
   headers: {
      'token' : $persistentStore.read("LeoSys_Token"),
     'actCode' : `true`},
   body: '', 
 },(error,response,data)=>{
   tokendata = JSON.parse(data);
 $persistentStore.write(tokendata.data.token,"LeoSys_Token")
   })
  }
}