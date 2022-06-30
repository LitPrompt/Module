let url = "http://ip-api.com/json"

$httpClient.get(url, function (error, response, data) {
    let jsonData = JSON.parse(data)
    // let isp = jsonData.isp
    // let ip = jsonData.query

    body={
        title: "当前免流信息",
        content: `IP信息：${jsonData.query}\n运营商：${jsonData.isp}\n`,
        backgroundColor: "#663399",
        icon: "network",
    }
    $done(body)
})