const cookieName = '中国电信'
const cookieKey = 'Tele_CK'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
  let cookie = $persistentStore.write(cookieVal, "cookieKey")
    if (cookie) {
        let msg = `${cookieName}`
            $notification.post(msg, 'Cookie写入成功', cookieVal)
            console.log(msg)
            console.log(cookieVal)
        }
    else{
        $notification.post( 'Cookie获取失败')
    }
    }

$done({})