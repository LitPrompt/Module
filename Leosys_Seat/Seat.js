const url = `https://leosys.cn/axhu/rest/v2/room/layoutByDate/2/2022-08-24`;
const headers = {
'User-Agent' : `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.26(0x18001a31) NetType/WIFI Language/zh_CN`,
'token' : `IE93YAKUP308234030`,
};
const body = ``;

$httpClient.get(
    {
      url: url,
      headers: headers,
      body: body, 
    },
    (error, response, data) => {
        jsonData = JSON.parse(data)
        console.log(jsonData)
        // $notification.post()
    })