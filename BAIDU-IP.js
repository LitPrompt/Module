
$httpClient.get("http://ip-api.com/json/", function (error, response, data) {
    let jsonData1 = JSON.parse(data)
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
