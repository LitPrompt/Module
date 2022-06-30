$httpClient.get("http://ip-api.com/json", function (error, response, data) {
    let jsonData = JSON.parse(data)
    let city = jsonData.city
    let ip = jsonData.query

    body={
        title: "当前免流信息",
        content: `免流IP：${ip}\n地区：${country} - ${city}`,
        backgroundColor: "#0C9DFA",
        icon: "globe.asia.australia.fill",
    }
    $done(body)
})
