const bodyName = '中国电信'
const bodyVal = $request.body
const effective = bodyVal.indexOf("SESSIONKEY")

if (effective=="0") {
  let Tele_body = $persistentStore.write(bodyVal, "Tele_BD")
    if (Tele_body) {
        let msg = `${bodyName}`
            $notification.post(msg, 'Body写入成功',bodyVal )
            console.log(msg)
            console.log(bodyVal)
        }
    }

$done({})