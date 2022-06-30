$httpClient.get("http://ip-api.com/json", function (error, response, data) {
    let isp = jsonData.isp
    let ip = jsonData.query
    $done({
        title: "当前免流信息",
        content: `IP信息：${ip}\n运营商：${isp}\n`,
        backgroundColor: "#663399",
        icon: "network",
    })
})