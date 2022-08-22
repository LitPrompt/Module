const bodyName = '中国电信'
const bodyVal = $request.body
const effective = bodyVal.indexOf("SESSIONKEY")

if (effective=="0") {
    $persistentStore.write(bodyVal, "Tele_BD")
    if (bodyVal) {
        let msg = `${bodyName}`
            $notification.post(msg, 'Body写入成功',bodyVal )
            console.log(msg)
            console.log(bodyVal)
        }
    }

$done({})