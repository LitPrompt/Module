$httpClient.get("https://forge.speedtest.cn/api/location/info", function (error, response, data) {
    let jsonData  = JSON.parse(data);
    // let { country, province, city, ip } = dataObject;
    // let region = `地区：${country} ${province} ${city}`;
    let country = jsonData.country
    let province = jsonData.province
    let city = jsonData.city
    let ip = jsonData.ip
    // ip = `免流IP：${ip}`;
    body={
        title: "当前免流信息",
        content: `免流IP：${ip}\n运营商：${isp}\n地区：${country} ${province} ${city}`,
        backgroundColor: "#268F81",
        icon: "iphone.circle.fill",
    }
    $done(body)
})
