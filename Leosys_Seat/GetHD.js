
/* *
[MITM]
hostname=czapp.bestpay.com.cn

[rewrite_local]
^https?:\/\/czapp\.bestpay\.com\.cn url script-request-body https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/GetBd.js
* */

const $ = new Env('利昂请求头获取');
const effective = $request.url.indexOf("searchSeats")

!(async () => {await GetBody();})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function GetBody() {

    if ($request.headers&&effective) {
      $.write(JSON.stringify($request.headers), "Tele_HD")
      title='图书馆'
      body='请求头写入成功'
      body1=JSON.stringify($request.url)+`\n`+JSON.stringify($request.headers)
      $.notice(title,body,body1)
      console.log('请求头：'+body1+`\n`+'请求Url：'+JSON.stringify($request.url)+`\n\n`)
    }
}

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