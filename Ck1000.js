const cookieName = '中国电信'
const cookieVal = $request.headers['Cookie']
const effective = cookieVal.indexOf("SSON")

if (effective==0) {
  let cookie = $persistentStore.write(cookieVal, "Tele_CK")
    if (cookie) {
        let msg = `${cookieName}`
            $notification.post(msg, 'Cookie写入成功',cookieVal )
            console.log(msg)
            console.log(cookieVal)
        }
    }

$done({})