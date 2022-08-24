let url = `https://leosys.cn/axhu/rest/v2/room/layoutByDate/2/2022-08-24`;
const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : $persistentStore.read("LeoSys_Token"),
};
const body = ``;
let seat=Number($persistentStore.read("tsg_seat"))
console.log(typeof seat)
console.log(seat)
// .split(' ')

function seat_left(){
    let y=0
    for(var k in jsondata.data.layout){
        if(jsondata.data.layout[Number(k)].status=="FREE")
        {y++}
    }
    return y
}

function seat_get(a){
    for(var k in jsondata.data.layout){
        if(jsondata.data.layout[Number(k)].name==a){
            if(jsondata.data.layout[Number(k)].status=="FREE"){return '所选座位没有人'}
            else{return '所选座位有人'}
        }
    }
}

$httpClient.get(
    {
      url: url,
      headers: headers,
      body: body, 
    },
    (error, response, data) => {
        var jsondata = JSON.parse(data);
        if(jsondata.status=="fail"){$notification.post("Token已过期，请重新抓取Token",jsondata.message,"")}
        
        console.log("当前空余座位："+seat_left()+"个，快抢!!!")
        console.log("所选座位状态："+seat_get(seat))
        $notification.post('当前空余座位：'+seat_left()+'个','座位状态：'+seat_get(seat),'')

        $done()
    })
 
