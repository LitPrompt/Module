$httpClient.get("https://forge.speedtest.cn/api/location/info", function (error, response, data) {
    let dataObject = JSON.parse(data);
    let { country, province, city, ip } = dataObject;
    let region = `地区：${country} ${province} ${city}`;
    ip = `免流IP：${ip}`;
    body={
        title: "当前免流信息",
        content: `${ip}\n${region}`,
        backgroundColor: "#268F81",
        icon: "iphone.circle.fill",
    }
    $done(body)
})
