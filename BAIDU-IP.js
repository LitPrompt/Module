var getip=$httpClient.get('https://api.my-ip.io', function (error, response, data) {
    let query=data
    return query
    })
    
let url=`http://ip-api.com/json/${getip}`

$httpClient.get(url, function (error, response, data1) {
    let jsonData1 = JSON.parse(data1)
    let city1 = jsonData1.city
    let ip1 = jsonData1.query

    body={
        title: "当前免流信息",
        content: `免流IP：${ip1}\n地区：${city1}`,
        backgroundColor: "#663399",
        icon: "network",
    }
    $done(body)
})
