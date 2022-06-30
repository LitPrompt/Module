$httpClient.get("http://ip-api.com/json", function (error, response, data) {
    let jsonData = JSON.parse(data)
    let country = jsonData.country
    let city = jsonData.city
    let ip = jsonData.query
    body={
        title: "当前免流信息",
        content: `免流IP：${ip}\n地区：${country} - ${city}`,
        backgroundColor: "#268F81",
        icon: "pills.circle.fill",
    }
    $done(body)
})
