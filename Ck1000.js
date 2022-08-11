const cookieName = '中国电信'
const cookieKey = 'Tele_CK'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
  let cookie = $persistentStore.write(cookieVal, "Tele_CK")
    if (cookie) {
        let msg = `${cookieName}`
            $notification.post(msg, 'Cookie写入成功', )
            console.log(msg)
            console.log(cookieVal)
        }
    }

$done({})