let loginerror=$persistentStore.read('Bodyswitch')

const bodyName = '中国电信'
const bodyVal = $request.body
const effective = bodyVal.indexOf("BILLCYCLE")

if (effective=="0"&&loginerror==1) {
    $persistentStore.write(String(bodyVal), "Tele_BD")
    let loginerror=0
    $persistentStore.write(String(loginerror),'Bodyswitch')
    if (bodyVal) {
        let msg = `${bodyName}`
            $notification.post(msg, 'Body写入成功',bodyVal )
            console.log(msg)
            console.log(bodyVal)
        }
    }
else{
    if(loginerror==0){console.log('当前Body有效，无需获取')}
    else($notification.post("请点击已用流量","" ,""))
}

$done({})