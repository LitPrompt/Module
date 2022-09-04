let loginerror=$persistentStore.read('Bodyswitch')
let bark_key=$persistentStore.read('bark_key')
let icon_url=$persistentStore.read('bark_icon')

const bodyName = '中国电信'
const bodyVal = $request.body
const effective = bodyVal.indexOf("BILLCYCLE")

if (effective=="0"&&loginerror==1) {
    $persistentStore.write(bodyVal, "Tele_BD")
    let loginerror=0
    $persistentStore.write(loginerror,'Bodyswitch')
    if (bodyVal) {
        let msg = `${bodyName}`
        title=msg
		body='Body写入成功'
		body1=bodyVal
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}	

            console.log(msg)
            console.log(bodyVal)
        }
    }
else{
    if(loginerror==0){console.log('当前Body有效，无需获取')}
    else{
        title='当前操作'
		body='请点击已用流量'
		body1=''
		if(bark_key){bark_notice(title,body,body1)}
		else{$notification.post(title,body,body1)}	
    }
}

function bark_notice(title,body,body1){
	let bark_title=title
	let bark_body=body
	let bark_body1=body1
	
	let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}
	
	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}`
	
	$httpClient.get({url})
}

$done({})
