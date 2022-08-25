let tsgseat=Number($persistentStore.read("tsg_seat"))
// .split(' ')

dateObj = $script.startTime//获取时间
data=dateObj.getDate()
month=dateObj.getMonth()+1
year=dateObj.getFullYear()
hours=dateObj.getHours()
minutes=dateObj.getMinutes()
let time=year+"-"+month+"-"+data
let times=time+" "+hours+"点"+minutes+"分"

const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : $persistentStore.read("LeoSys_Token"),
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
    if(jsondata.status=="fail"){
        $notification.post('当前Token失效',jsondata.message,'开始尝试重新获取Token')
        $httpClient.get(
            {
                
                url: 'https://leosys.cn/axhu/rest/auth?username=1942065227&password=NAZHVX.H.1VH%5BYBF',
                headers: {
                    'token' : $persistentStore.read("LeoSys_Token"),
                    'actCode' : `true`},
                body: body, 
            },(error,response,data)=>{
                tokendata = JSON.parse(data);
                $persistentStore.write(tokendata.data.token,"LeoSys_Token")})
                $$notification.post('已成功获取Token',headers.token,'')
                }
    else{
        console.log("当前第三自习室空余座位："+total_seat(jsondata)+"个  "+"座位状态："+get_seat(tsgseat,jsondata))

        $notification.post('当前第三自习室空余座位：'+total_seat(jsondata)+'个','座位状态：'+get_seat(tsgseat,jsondata),`查询时间为：${times}`)
    }
    $done()
})


function total_seat(jsondata){
    let total=0
    for(var k in jsondata.data.layout)
    {
        const datasys=jsondata.data.layout[Number(k)]
        if(datasys.status=="FREE"&&datasys.type=="seat")
        {total++}
    }
    return total
}

function get_seat(seat,jsondata){
    for(var k in jsondata.data.layout){
    if(jsondata.data.layout[Number(k)].name==seat)
    {
        if(jsondata.data.layout[Number(k)].status=="FREE")
        {return '所选座位没有人'}
        else
        {return '所选座位有人'}
    }
    }
}
