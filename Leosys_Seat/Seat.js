let url = `https://leosys.cn/axhu/rest/v2/room/layoutByDate/2/2022-08-24`;
const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : $persistentStore.read("LeoSys_Token"),
};
const body = ``;
let seat=$persistentStore.read("tsg_seat")

$httpClient.get(
    {
      url: url,
      headers: headers,
      body: body, 
    },
    (error, response, data) => {
        var jsondata = JSON.parse(data);
        let y=0
        if(jsondata.status=="fail"){
            $notification.post("Token已过期，请重新抓取Token","原因："+jsondata.message)
        }
        for(var k in jsondata.data.layout){
            key=Number(k)
            if(jsondata.data.layout[k].status=="FREE")
            {y++}
        }
        console.log("当前空余座位："+y+"个，快抢!!!")
        $notification.post("当前空余座位："+y+"个，快抢!!!")
        $done()
    })
 