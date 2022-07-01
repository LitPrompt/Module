$httpClient.get("https://forge.speedtest.cn/api/location/info", function (error, response, data) {
    let dataObject = JSON.parse(data);
    let { country, province, isp, city, ip } = dataObject;
    isp = `运营商：${isp}`;
    ip = `免流IP：${ip}`;
    let region = `地区：${country} ${province} ${city}`;
    body={
        title: "当前免流信息",
        content: `${isp}\n${ip}\n${region}`,
        backgroundColor: "#268F81",
        icon: "personalhotspot",
    }
    $done(body)
})
