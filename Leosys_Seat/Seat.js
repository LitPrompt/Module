const url = `https://leosys.cn/axhu/rest/v2/room/layoutByDate/2/2022-08-24`;
const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : $persistentStore.read("LeoSys_Token"),
};
const body = ``;

$httpClient.get(
    {
      url: url,
      headers: headers,
      body: body, 
    },
    (error, response, data) => {
        var jsondata = JSON.parse(JSON.stringify(data));
        console.log(jsondata.status)
        $notification.post(jsondata.status,"","")
    })