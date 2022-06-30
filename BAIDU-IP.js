$httpClient.get("http://ip-api.com/json", function (error, response, data) {
    $done({
        title: "当前免流信息",
        content: `IP信息：${jsonData.query}\n运营商：${jsonData.isp}\n`,
        backgroundColor: "#663399",
        icon: "network",
    })
})