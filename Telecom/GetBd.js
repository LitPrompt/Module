const $ = new Env(`Env for me`)

let loginerror=$.read('Bodyswitch')

const bodyName = '中国电信'
const bodyVal = $request.body
const effective = bodyVal.indexOf("BILLCYCLE")

if (effective=="0"&&loginerror==1) {
    $.write(bodyVal, "Tele_BD")
    let loginerror=0
    $.write(loginerror,'Bodyswitch')
    if (bodyVal) {
        let msg = `${bodyName}`
        title=msg
		    body='Body写入成功'
		    body1=bodyVal
		    Notice(title,body,body1)	

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
		Notice(title,body,body1)	
    }
}

function Notice(title,body,body1){
	let bark_title=title
	let bark_body=body
	let bark_body1=body1
    let bark_key=$.read('bark_key')
	let icon_url=$.read('bark_icon')
    if(bark_key)
    {
        let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}

	let bark_other=$.read('bark_add')
  	let effective=bark_icon.indexOf("?icon")
  	if((effective!=-1)&&bark_other){bark_other=`&${bark_other}`}
	else if((effective==-1)&&bark_other){bark_other=`?${bark_other}`}
	else{bark_other=''}
	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

	$.post({url})
    }else{$.notice(title,body,body1)}
	
}    

$done({})

function Env(name) {
  LN = typeof $loon != `undefined`
  SG_STH_SDR = typeof $httpClient != `undefined` && !LN
  QX = typeof $task != `undefined`
  read = (key) => {
    if (LN || SG_STH_SDR) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG_STH_SDR) return $persistentStore.write(String(key), val); 
    if (QX) return $prefs.setValueForKey(String(key), val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG_STH_SDR) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { 'open-url': url })
  }
  get = (url, cb) => {
    if (LN || SG_STH_SDR) {$httpClient.get(url, cb)}
    if (QX) {url.method = `GET`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG_STH_SDR) {$httpClient.post(url, cb)}
    if (QX) {url.method = `POST`; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  toObj = (str) => JSON.parse(str)
  toStr = (obj) => JSON.stringify(obj)
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { name, read, write, notice, get, post, toObj, toStr, log, done }
}