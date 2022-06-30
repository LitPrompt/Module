var ip=data
$httpClient.get("https://api.my-ip.io", function (error, response, data) {})
$httpClient.get(`http://ip-api.com/json/${ip}`, function (error, response, data1) {

    let jsonData1 = JSON.parse(data1)
    let city2 = jsonData1.city
    let ip2 = jsonData1.query

    body={
        title: "当前免流信息",
        content: `免流IP：${ip2}\n地区：${city2}`,
        backgroundColor: "#663399",
        icon: "network",
    }
    $done(body)
})