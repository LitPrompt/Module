const $ = new Env(`电信余量`)
const headers = { "Accept": "application/json", "Content-Type": "application/json; charset\u003dUTF-8", "Connection": "Keep-Alive", "Accept-Encoding": "gzip", }


!(async () => {
    let panel = {
        title: '电信余量',
        content: ``,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }
    try {
        
        let Month0 = formatTime().month - 1
        let Month1 = formatTime().month
        if (Month1 == 1) { Month0 = 12 }
        if (Month0 <= 9) { Month0 = '0' + Month0 }
        if (Month1 <= 9) { Month1 = '0' + Month1 }

        

        let thishours = formatTime().hours
        let thisminutes = formatTime().minutes
        let Days = formatTime().day
        let lasthours = $.getdata('Tele_AutoCheck.hourstimeStore')
        let lastminutes = $.getdata('Tele_AutoCheck.minutestimeStore')
        let minutesused, isFirst, Login_info, Tokenexpired

        if (lasthours == undefined && lastminutes == undefined) isFirst = true
        if (lasthours == undefined) lasthours = thishours
        if (lastminutes == undefined) lastminutes = thisminutes
        let hoursused = thishours - lasthours
        let interval = $.getdata('Tele_AutoCheck.timeinterval')
        if (interval == undefined) {
            $.setdata($.toStr(5), 'Tele_AutoCheck.timeinterval')
            interval = '5'
        }

        if (hoursused >= 0) { minutesused = (thisminutes - lastminutes) + hoursused * 60 } //上次查询的时间大于等于当前查询的时间
        else if (hoursused < 0 && lasthours <= 23) { minutesused = (60 - lastminutes) + (23 - lasthours + thishours) * 60 + thisminutes }
        //**********

        let Timer_Notice = $.getdata('Tele_AutoCheck.notice_switch');
        if (Timer_Notice == undefined) {$.setdata($.toStr(false), 'Tele_AutoCheck.notice_switch');Timer_Notice = 'false'}

        let Tele_value = $.getdata('Tele_AutoCheck.threshold') //读取阈值

        if (Tele_value == undefined) { $.setdata($.toStr(0), 'Tele_AutoCheck.threshold'); Tele_value = '0' }
        
        let Tile_All = { Tile_Today: '', Tile_Month: '', Tile_Time: '' }

        let jsonData = await Query($.getjson('Tele_AutoCheck.querybody'))
        let Body = $.getjson("Tele_AutoCheck.Tele_BD")
        $.setjson(jsonData,'Tele_AutoCheck.packge_detail')
        if(Body==undefined||Body=='') {throw '请在Boxjs中设置请求体'}


        if(jsonData.status!='400'&&jsonData.headerInfos.code=='X201') Tokenexpired=true

        if(isFirst||Tokenexpired||jsonData.status=='400'||jsonData.status=='415') {

            let trylogin=await Login(Body)
            $.setjson(trylogin,'Tele_AutoCheck.logininfo')

            Login_info=$.getjson('Tele_AutoCheck.logininfo')

            if(trylogin.responseData!=undefined&&trylogin.responseData.resultCode=="3001") throw 'err1'
            if(isFirst) $.log('当前为初次使用，尝试获取Token')
            if(Tokenexpired) $.log('当前Token已过期，尝试获取Token')
            $.log(`\n`+JSON.stringify(trylogin))

            let fieldData=new Object()
        	fieldData.provinceCode=Login_info.responseData.data.loginSuccessResult.provinceCode
        	fieldData.cityCode=Login_info.responseData.data.loginSuccessResult.cityCode
        	fieldData.shopId='20002'
        	fieldData.isChinatelecom='0'
        	fieldData.account=Body.content.fieldData.phoneNum
			let content=new Object()
			content.fieldData=fieldData
        
        	let headerInfos=new Object()
    		headerInfos.clientType=Body.headerInfos.clientType
    		headerInfos.code='qryImportantData'
    		headerInfos.shopId='20002'
    		headerInfos.source='110003'
    		headerInfos.sourcePassword='Sid98s'
    		headerInfos.token=Login_info.responseData.data.loginSuccessResult.token
    		headerInfos.userLoginName=Body.headerInfos.userLoginName
  
			let querybody=new Object()
        	querybody.content=content
        	querybody.headerInfos=headerInfos
        
        	$.setjson(querybody,'Tele_AutoCheck.querybody')
        	jsonData = await Query($.getjson('Tele_AutoCheck.querybody'))

        }
       
        let ArrayQuery = Query_All(jsonData)

        let brond = $.getdata('Tele_AutoCheck.key_brond')
        if ($.getdata('Tele_AutoCheck.key_brond') == (undefined||'')) {
            brond = jsonData.responseData.data.balanceInfo.phoneBillBars[0].title
            $.setdata(brond, "Tele_AutoCheck.key_brond")
        }

        let limitThis = ArrayQuery.limitusage//通用使用量
        let unlimitThis = ArrayQuery.unlimitusage//定向使用量
        let limitLast = $.getdata("Tele_AutoCheck.limitStore") //将上次查询到的值读出来
        let unlimitLast = $.getdata("Tele_AutoCheck.unlimitStore") //将上次查询到的值读出来
        if (limitLast == undefined) limitLast = limitThis
        if (unlimitLast == undefined) unlimitLast = unlimitThis
        let limitChange = limitThis - limitLast
        let unlimitChange = unlimitThis - unlimitLast

        try {
            if (unlimitLast == '' || unlimitThis - unlimitLast < 0 || limitLast == '') throw 'err'
        } catch (e) {
            if (e == 'err') {
                $.setdata($.toStr(0), 'Tele_AutoCheck.limitStore')
                $.setdata($.toStr(0), 'Tele_AutoCheck.unlimitStore')
                title = "当前为初次查询或上次查询有误"
                body = '已将上次查询归0'
                body1 = '下次通知可能会有误，不用在意'
                Notice(title, body, body1)
            }
        }

        //***********

        let tile_date = $.getdata('Tele_AutoCheck.day')

        if (tile_date == '') { $.setdata($.toStr(Days), 'Tele_AutoCheck.day') }//初次
        let tile_unlimittoday = $.getdata('Tele_AutoCheck.unlimittoday')
        let tile_limittoday = $.getdata('Tele_AutoCheck.limittoday')
        if ((thishours == 0 && thisminutes == 0) || (tile_unlimittoday == '' || tile_limittoday == '') || tile_date != Days)//面板更新时间
        {
            $.setdata($.toStr(Days), 'Tele_AutoCheck.day')
            $.setdata($.toStr(ArrayQuery.unlimitusage), 'Tele_AutoCheck.unlimittoday')
            $.setdata($.toStr(ArrayQuery.limitusage), 'Tele_AutoCheck.limittoday')
        }
        let tile_unlimitTotal = ArrayQuery.unlimitusage - tile_unlimittoday//面板今日定向用量
        let tile_limitTotal = ArrayQuery.limitusage - tile_limittoday//面板今天通用用量
        let tile_unlimitUsageTotal = ArrayQuery.unlimitusage//面板本月定向使用量
        let tile_limitUsageTotal = ArrayQuery.limitusage//面板本月通用使用量

        if (thishours < 10) { tile_hour = '0' + thishours }
        else { tile_hour = thishours }
        if (thisminutes < 10) { tile_minute = '0' + thisminutes }
        else { tile_minute = thisminutes }

        Tile_All['Tile_Today'] = ToSize(tile_unlimitTotal, 1, 0, 1) + '/' + ToSize(tile_limitTotal, 1, 0, 1)
        Tile_All['Tile_Month'] = ToSize(tile_unlimitUsageTotal, 1, 0, 1) + '/' + ToSize(tile_limitUsageTotal, 1, 0, 1)
        Tile_All['Tile_Time'] = tile_hour + ':' + tile_minute

        let notice_body = $.getdata('Tele_AutoCheck.notice_body');
        if (notice_body == undefined) {
            notice_body = $.setdata("免/跳/总免/剩余", 'Tele_AutoCheck.notice_body')
            notice_body = $.getdata('Tele_AutoCheck.notice_body').split('/')
        } else { notice_body = $.getdata('Tele_AutoCheck.notice_body').split('/') }


        $.log(`\n` + '流量卡名：' + brond + `\n` + '[1]' + brond + '通用：已用' + ToSize(ArrayQuery.limitusage, 2, 0, 1) + `\n` + '[2]' + brond + '定向：已用' + ToSize(ArrayQuery.unlimitusage, 2, 0, 1) + `\n` + '剩余流量：' + `\n` + '通用剩余：' + ToSize(ArrayQuery.limitleft, 2, 0, 1) + ' 定向剩余：' + ToSize(ArrayQuery.unlimitleft, 2, 0, 1) + `\n` + '定时通知间隔：' + interval + ' 分钟 流量变化阈值：' + ToSize(Tele_value, 1, 1, 1))
        $.log("上次通用使用：" + ToSize(limitLast, 2, 0, 1) + " 当前通用使用：" + ToSize(limitThis, 2, 0, 1))
        $.log("上次定向使用：" + ToSize(unlimitLast, 2, 0, 1) + " 当前定向使用：" + ToSize(unlimitThis, 2, 0, 1))
        $.log("通用变化量：" + ToSize(limitChange, 2, 0, 1) + " 定向变化量：" + ToSize(unlimitChange, 2, 0, 1))



        if (Timer_Notice == "true") {
            $.log(`\n` + '当前为变化通知，变化阈值为：' + ToSize(Tele_value, 1, 0, 1))
            if (limitChange >= Tele_value) {
                $.setdata($.toStr(ArrayQuery.limitusage), "Tele_AutoCheck.limitStore")
                $.setdata($.toStr(ArrayQuery.unlimitusage), "Tele_AutoCheck.unlimitStore")
                $.setdata($.toStr(thishours), "Tele_AutoCheck.hourstimeStore")
                $.setdata($.toStr(thisminutes), "Tele_AutoCheck.minutestimeStore")
                title = brond + '  耗时:' + minutesused + '分钟'
                body = notice_body[0] + ToSize(unlimitChange, 2, 1, 1) + ' ' + notice_body[1] + ToSize(limitChange, 2, 1, 1)
                body1 = notice_body[2] + ToSize(ArrayQuery.unlimitusage, 2, 1, 1) + ' ' + notice_body[3] + ToSize(ArrayQuery.limitleft, 2, 1, 1)
                Notice(title, body, body1)
            }

        } else if (Timer_Notice == "false") {

            $.log(`\n` + '当前为定时通知，时间间隔为 ' + interval + ' 分钟')
            if (isFirst == true) $.log('首次使用：通知已发送！')
            if (minutesused > interval || isFirst == true) {

                $.setdata($.toStr(ArrayQuery.limitusage), "Tele_AutoCheck.limitStore")
                $.setdata($.toStr(ArrayQuery.unlimitusage), "Tele_AutoCheck.unlimitStore")
                $.setdata($.toStr(thishours), "Tele_AutoCheck.hourstimeStore")
                $.setdata($.toStr(thisminutes), "Tele_AutoCheck.minutestimeStore")
                title = brond + '  耗时:' + minutesused + '分钟'
                body = notice_body[0] + ToSize(unlimitChange, 2, 1, 1) + ' ' + notice_body[1] + ToSize(limitChange, 2, 1, 1)
                body1 = notice_body[2] + ToSize(ArrayQuery.unlimitusage, 2, 1, 1) + ' ' + notice_body[3] + ToSize(ArrayQuery.limitleft, 2, 1, 1)
                Notice(title, body, body1)
            }
        }

        panel['title'] = $.getdata('Tele_AutoCheck.key_brond')
        panel['content'] = '今日免流/跳点：' + Tile_All['Tile_Today'] + `\n` + '本月免流/跳点：' + Tile_All['Tile_Month'] + `\n` + '查询时间：' + Tile_All['Tile_Time']

    } catch (e) {
        if (e == 'err1') {
            title = "频繁登录已触发电信风控"
            body = '请稍后尝试登陆！！'
            body1 = ''
            Notice(title, body, body1)
        }else{
            $.log('错误：' + e)
        }

    }
    $.done(panel)

})()


function Query_All(jsonData) {//原始量

    UnlimitInfo = jsonData.responseData.data.flowInfo.specialAmount
    LimitInfo = jsonData.responseData.data.flowInfo.commonFlow

    unlimitbalancetotal = Number(UnlimitInfo.balance)
    unlimitusagetotal = Number(UnlimitInfo.used)
    unlimitratabletotal = unlimitbalancetotal + unlimitusagetotal

    limitbalancetotal = Number(LimitInfo.balance)
    limitusagetotal = Number(LimitInfo.used)
    limitratabletotal = limitbalancetotal + limitusagetotal

    let queryinfo = { unlimitall: unlimitratabletotal, unlimitleft: unlimitbalancetotal, unlimitusage: unlimitusagetotal, limitall: limitratabletotal, limitleft: limitbalancetotal, limitusage: limitusagetotal }
    return queryinfo
}

function Notice(title, body, body1) {
    let bark_title = title
    let bark_body = body
    let bark_body1 = body1
    let bark_key = $.getdata('Tele_AutoCheck.bark_key')
    let icon_url = $.getdata('Tele_AutoCheck.bark_icon')
    if (bark_key) {
        let bark_icon
        if (icon_url) { bark_icon = `?icon=${icon_url}` }
        else { bark_icon = '' }

        let bark_other = $.getdata('Tele_AutoCheck.bark_add')
        let effective = bark_icon.indexOf("?icon")
        if ((effective != -1) && bark_other) { bark_other = `&${bark_other}` }
        else if ((effective == -1) && bark_other) { bark_other = `?${bark_other}` }
        else { bark_other = '' }
        let url = `${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

        $.post({ url })
    } else { $.msg(title, body, body1) }

}



function ToSize(kbyte, s, l, t) {//字节转换s保留位数l是否空格t是否单位
    let kbytes, i
    if (kbyte < 1024) { kbytes = kbyte / 1024 }
    else { kbytes = kbyte }
    let k = 1024;
    sizes = ["MB", "MB", "GB", "TB"];
    if (kbyte != 0) { i = Math.floor(Math.log(kbyte) / Math.log(k)); }//获取指数
    else { i = 0 }
    if (kbyte == 0) s = 0
    if (l == 1 && t == 1) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + " " + sizes[i];
    } else if (l == 1 && t == 0) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + " ";
    } else if (l == 0 & t == 1) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + sizes[i];
    } else {
        return (kbytes / Math.pow(k, i)).toFixed(s);
    }
}


function formatTime() {
    let dateObj = new Date()//获取时间
    let Minutes = dateObj.getMinutes();//获取分钟
    let Hours = dateObj.getHours(); //获取小时
    let Dates = dateObj.getDate(); //获取日期天
    let Month = dateObj.getMonth() + 1//获取日期月
    let Year = dateObj.getFullYear()//获取日期年
    let objtime = { year: Year, month: Month, day: Dates, hours: Hours, minutes: Minutes }
    return objtime
}



async function Login(login_body) {//登录
    return new Promise((resolve, reject) => {
        $.post({
            url: 'https://appgologin.189.cn:9031/login/client/userLoginNormal',
            headers: headers,
            body: JSON.stringify(login_body)// 请求体
        }, function (error, response, data) { resolve(JSON.parse(data)) })
    })
}

async function Query(token) {//余量原始数据
    return new Promise((resolve, reject) => {
        $.post({
            url: 'https://appfuwu.189.cn:9021/query/qryImportantData',
            headers: headers,
            body: JSON.stringify(token) // 请求体
        }, function (error, response, data) { resolve(JSON.parse(data)) })
    })
}




function Notice(title, body, body1) {
    let bark_title = title
    let bark_body = body
    let bark_body1 = body1
    let bark_key = $.getdata('Tele_AutoCheck.bark_key')
    let icon_url = $.getdata('Tele_AutoCheck.bark_icon')
    if (bark_key) {
        let bark_icon
        if (icon_url) { bark_icon = `?icon=${icon_url}` }
        else { bark_icon = '' }

        let bark_other = $.getdata('Tele_AutoCheck.bark_add')
        let effective = bark_icon.indexOf("?icon")
        if ((effective != -1) && bark_other) { bark_other = `&${bark_other}` }
        else if ((effective == -1) && bark_other) { bark_other = `?${bark_other}` }
        else { bark_other = '' }
        let url = `${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

        $.post({ url })
    } else { $.msg(title, body, body1) }

}



function ToSize(kbyte, s, l, t) {//字节转换s保留位数l是否空格t是否单位
    let kbytes, i
    if (kbyte < 1024) { kbytes = kbyte / 1024 }
    else { kbytes = kbyte }
    let k = 1024;
    sizes = ["MB", "MB", "GB", "TB"];
    if (kbyte != 0) { i = Math.floor(Math.log(kbyte) / Math.log(k)); }//获取指数
    else { i = 0 }
    if (kbyte == 0) s = 0
    if (l == 1 && t == 1) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + " " + sizes[i];
    } else if (l == 1 && t == 0) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + " ";
    } else if (l == 0 & t == 1) {
        return (kbytes / Math.pow(k, i)).toFixed(s) + sizes[i];
    } else {
        return (kbytes / Math.pow(k, i)).toFixed(s);
    }
}


function formatTime() {
    let dateObj = new Date()//获取时间
    let Minutes = dateObj.getMinutes();//获取分钟
    let Hours = dateObj.getHours(); //获取小时
    let Dates = dateObj.getDate(); //获取日期天
    let Month = dateObj.getMonth() + 1//获取日期月
    let Year = dateObj.getFullYear()//获取日期年
    let objtime = { year: Year, month: Month, day: Dates, hours: Hours, minutes: Minutes }
    return objtime
}


function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: i, statusCode: r, headers: o, rawBody: h }, s.decode(h, this.encoding)) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: s, statusCode: r, headers: o, rawBody: h }, i.decode(h, this.encoding)) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
