const cookieName = '中国电信'
const cookieKey = 'Tele_CK'
// const cookie_te = $persistentStore.read("Tele_CK")

$httpClient.get('https://e.dlife.cn/wap/loginInfo.do', (error, response, data) => {
    jsonData = JSON.parse(data)
    console.log(data)
    if (jsonData.result==10000) 
    {
        $notification.post( '登录成功开始获取cookie')
        const cookieVal = $request.headers['Cookie']
        let cookie = $persistentStore.write(cookieVal, "Tele_CK")
        if (cookie) 
        {
            let msg = `${cookieName}`
                $notification.post(msg, 'Cookie写入成功', cookieVal)
                console.log(msg)
                console.log(cookieVal)
        }
        else
        {$notification.post( 'Cookie获取失败')}
    }
}
)



$done({})