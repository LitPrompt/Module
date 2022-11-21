const width = 7
const h = 46
const w = new ListWidget()// 
// const PhoneBillIcon = 'https://raw.githubusercontent.com/QGCliveDavis/Module/main/Asset/PhoneBill.png'
// const PhoneIcon = 'https://raw.githubusercontent.com/QGCliveDavis/Module/main/Asset/Phone.png'
const DynamicText = Color.dynamic(new Color('#111111'), new Color('#ffffff'))
w.backgroundColor = Color.dynamic(new Color('#ffffff'), new Color('#1c1c1e'))

!(async () => {
  let Wsize=-1
  if(!hasdata('LimitVal')) setdata('LimitVal', '')
  if(!hasdata('unLimitVal')) setdata('unLimitVal', '')

  if (config.runsInApp) {
    let al = new Alert()
    al.title = '余量信息'
    al.message = '请在相关设置选择数据来源'
    al.addAction('更新脚本')
    al.addAction('相关设置')
    al.addAction('预览组件')
    al.addAction('刷新桌面小组件')
    al.addCancelAction('取消')


    let UserCh = await al.presentSheet()
    if (UserCh == -1) {}
    if (UserCh == 0) {await AsyncJs()}
    if (UserCh == 1) {//相关设置
      let a1 = new Alert()
      a1.title = '相关设置'
      a1.message='间距与数据相关设置'
      a1.addAction('数据来源')
      a1.addAction('自定义使用量')
      a1.addAction('组件间距设置')
      a1.addCancelAction('取消')
      let ch=await a1.presentAlert()
      if(ch==0){
        let a2=new Alert()
        a2.title = '数据来源'
        //a1.addAction('从营业厅获取')
        a2.addAction('从BoxJS获取-电信')
        a2.addAction('从BoxJS获取-联通')
        a2.addCancelAction('取消')
        let ch=await a2.presentAlert()
        if(ch==-1) {no.schedule()}
        //else if(ch==0) setdata('isData', '1')
        if(ch==0) setdata('isData','2')
        if(ch==1) setdata('isData', '3')

      }
      if(ch==1){
        let a2=new Alert()
        a2.message=`通用与定向数据自定义\n不填写为默认空\n单位GB`
        a2.addTextField('通用总量',getdata('LimitVal'))
        a2.addTextField('定向总量',getdata('unLimitVal'))
        a2.addAction('确认')
        a2.addCancelAction('取消')
        await a2.presentAlert()
        let val=a2.textFieldValue(0)
        let val1=a2.textFieldValue(1)
        setdata('LimitVal', String(val))
        setdata('unLimitVal', String(val1))

      }
      if(ch==2){
	    let a2=new Alert() 
	    a2.title='图像位置设置'
	    a2.message=`组件间隔默认50，柱状图间隔默认10\n柱状图单次减少量为0.1`
	    a2.addTextField('组件间隔',getdata('Space'))
	    a2.addTextField('柱状图间隔',getdata('KSize'))
	    a2.addAction('确认')
	    a2.addCancelAction('取消')
        await a2.presentAlert()
        let Space = a2.textFieldValue(0)
        let KSize = a2.textFieldValue(1)
        setdata('Space', String(Space))
        setdata('KSize', String(KSize))
      }
    }
    if (UserCh == 2) {
      let a1 = new Alert()
      a1.title = '预览类型'
      a1.addAction('小组件')
      a1.addAction('中等组件')
      a1.addCancelAction('取消')
      Wsize = await a1.presentAlert()
    }
    if(UserCh==3){}
  }


  let Hours = new Date().getHours(); //获取小时	
  let Minutes = new Date().getMinutes();

  if (!hasdata('Hours')) setdata('Hours', String(Hours))

  Hours == 00 ? LastTime = 47 : LastTime = Hours + 24 - 1


  for (Hours == 0 ? i = 1 : i = 0; i <= 23 && (!hasdata(String(i)) || Hours == 0); i++) {//数据初始化
    let First = { unlimitchange: 40, limitchange: 0 }
    setdata(String(i), JSON.stringify(First))
  }
  for (i = 24; i <= 47 && !hasdata(String(i)); i++) {//数据初始化	
    let First = { unlimitusage: 0, limitusage: 0 }
    setdata(String(i), JSON.stringify(First))
  }

  let isData=getdata('isData')
  if(isData=='1') console.log('营业厅登录')
  if(isData=='2'||isData=='3') Query=Query_All(await BoxJsData())


  if (getdata('Hours') != String(Hours)) {
    setdata('Hours', String(Hours))
    setdata(String(Hours + 24), JSON.stringify(Query))//将就数据存入24-47中	
  }

  let LastLimit = getobjdata(String(LastTime)).limitusage
  let LastUnlimit = getobjdata(String(LastTime)).unlimitusage
  let Change = {
    unlimitchange: Query.unlimitusage - LastUnlimit,
    limitchange: Query.limitusage - LastLimit
  }
  setdata(String(Hours), JSON.stringify(Change))//将变化量存入0~23中


  let a = 0
  while (a != 48) {
    console.log(String(a) + JSON.stringify(getobjdata(String(a))))
    a++
  }

  if (config.widgetFamily == 'small' || Wsize == 0) {
    getsmallwidget(Query.limitall, Query.limitusage, "数据流量-通用")
    getsmallwidget(Query.unlimitall, Query.unlimitusage, "数据流量-定向")
    if (Wsize == 0) { w.presentSmall() }

  }

  if (config.widgetFamily == 'medium' || Wsize == 1) {

    getmediumwidget(Query, "数据流量-通用", "数据流量-定向")
    if (Wsize == 1) { w.presentMedium() }

  }

  Script.setWidget(w)
  Script.complete()  

})()

async function AsyncJs(){
  let fm = FileManager.local();
  if (fm.isFileStoredIniCloud(module.filename)) {
    fm = FileManager.iCloud();
  }
  const url = 'https://raw.githubusercontent.com/QGCliveDavis/Module/main/Scriptable/Telecom_Script.js';
  const request = new Request(url);
  try {
    const code = await request.loadString();
    fm.writeString(module.filename, code);
    const alert = new Alert();
    alert.message = '代码已更新,关闭生效。';
    alert.addAction('确定');
    alert.presentAlert();
  } catch (e) {
    console.error(e);
  }
}

async function isLogin() {
  console.log("登录环节")
  const a = new Alert()
  a.title = '请输入营业厅账号密码';
  a.addTextField('账号');
  a.addSecureTextField('密码')
  a.addAction('确认')
  a.addCancelAction('取消')
  await a.presentAlert()
  let Name = a.textFieldValue(0)
  let Pw = a.textFieldValue(1)

}

function getmediumwidget(Query,str,str1) {
  if(!hasdata('Space'))setdata('Space', '50')
  if(!hasdata('KSize'))setdata('KSize', '10')
  let m =Number(getdata('Space'))//整体间隔位置
  let total = Query.limitall
  let haveGone = Query.limitusage
  let total1 = Query.unlimitall
  let haveGone1 = Query.unlimitusage

  w.addSpacer(8)
  let text = w.addStack()
  text.addSpacer(2)
  w.addSpacer(4)
  const titlew = text.addText(str)
  text.addSpacer(52 + m + width)
  const titlew1 = text.addText(str1)
  titlew.textColor = DynamicText
  titlew.font = Font.boldSystemFont(10)
  titlew1.textColor = DynamicText
  titlew1.font = Font.boldSystemFont(10)

  let row = w.addStack()
  row.layoutHorizontally()
  row.addSpacer(2)//整体位置

  const iconImg = row.addImage(creatProgress(total, haveGone))
  iconImg.imageSize = new Size(width, h)
  row.addSpacer(10)//图片与文字距离
  let column = row.addStack()
  column.layoutVertically()
  column.addSpacer(0)//字体上下
  const usageText = column.addText(String(ToSize(haveGone, 1, 1, 1)))
  const totalText = column.addText(String(ToSize(total, 1, 0, 1)) + '(' + (haveGone / total * 100).toFixed(1) + '%)')
  usageText.font = Font.mediumMonospacedSystemFont(h / 2)
  totalText.font = Font.mediumRoundedSystemFont(h / 3)
  usageText.textColor = DynamicText
  totalText.textColor = DynamicText

  row.addSpacer(m)

  const iconImg1 = row.addImage(creatProgress(total1, haveGone1))
  iconImg1.imageSize = new Size(width, h)
  row.addSpacer(10)//图片与文字距离
  let column1 = row.addStack()
  column1.layoutVertically()
  column1.addSpacer(0)//字体上下
  const usageText1 = column1.addText(String(ToSize(haveGone1, 1, 1, 1)))
  const totalText1 = column1.addText(String(ToSize(total1, 1, 0, 1)) + '(' + (haveGone1 / total1 * 100).toFixed(1) + '%)')
  usageText1.font = Font.mediumMonospacedSystemFont(h / 2)
  totalText1.font = Font.mediumRoundedSystemFont(h / 3)
  usageText1.textColor = DynamicText
  totalText1.textColor = DynamicText


  w.addSpacer(10)

//   let rowphone = w.addStack()
//   rowphone.layoutHorizontally()
//   rowphone.addSpacer(10)
// 
//   let PhoneBill = rowphone.addText(Query.VoiceBill+ '元')
//   PhoneBill.font = Font.mediumRoundedSystemFont(10)
//   PhoneBill.textColor = DynamicText
// 
//   rowphone.addSpacer(10)
// 
//   let PhoneVoice = rowphone.addText(Query.VoiceDataBill + '分钟')
//   PhoneVoice.font = Font.mediumRoundedSystemFont(10)
//   PhoneVoice.textColor = DynamicText
// 
// 
  w.addSpacer(15)


  let row2 = w.addStack()
  row2.layoutHorizontally()
  row2.addSpacer(0)//整体位置

  let Width = Number(getdata('KSize'))//k线宽度

  let H = 35// 
  let D = 2

  const iconImg00 = row2.addImage(creatProgressDay(getobjdata('0').limitchange, getobjdata('0').unlimitchange, 0))
  iconImg00.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg01 = row2.addImage(creatProgressDay(getobjdata('1').limitchange, getobjdata('1').unlimitchange, 1))
  iconImg01.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg02 = row2.addImage(creatProgressDay(getobjdata('2').limitchange, getobjdata('2').unlimitchange, 2))
  iconImg02.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg03 = row2.addImage(creatProgressDay(getobjdata('3').limitchange, getobjdata('3').unlimitchange, 3))
  iconImg03.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg04 = row2.addImage(creatProgressDay(getobjdata('4').limitchange, getobjdata('4').unlimitchange, 4))
  iconImg04.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg05 = row2.addImage(creatProgressDay(getobjdata('5').limitchange, getobjdata('5').unlimitchange, 5))
  iconImg05.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg06 = row2.addImage(creatProgressDay(getobjdata('6').limitchange, getobjdata('6').unlimitchange, 6))
  iconImg06.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg07 = row2.addImage(creatProgressDay(getobjdata('7').limitchange, getobjdata('7').unlimitchange, 7))
  iconImg07.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg08 = row2.addImage(creatProgressDay(getobjdata('8').limitchange, getobjdata('8').unlimitchange, 8))
  iconImg08.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg09 = row2.addImage(creatProgressDay(getobjdata('9').limitchange, getobjdata('9').unlimitchange, 9))
  iconImg09.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg10 = row2.addImage(creatProgressDay(getobjdata('10').limitchange, getobjdata('10').unlimitchange, 10))
  iconImg10.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg11 = row2.addImage(creatProgressDay(getobjdata('11').limitchange, getobjdata('11').unlimitchange, 11))
  iconImg11.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg12 = row2.addImage(creatProgressDay(getobjdata('12').limitchange, getobjdata('12').unlimitchange, 12))
  iconImg12.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg13 = row2.addImage(creatProgressDay(getobjdata('13').limitchange, getobjdata('13').unlimitchange, 13))
  iconImg13.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg14 = row2.addImage(creatProgressDay(getobjdata('14').limitchange, getobjdata('14').unlimitchange, 14))
  iconImg14.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg15 = row2.addImage(creatProgressDay(getobjdata('15').limitchange, getobjdata('15').unlimitchange, 15))
  iconImg15.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg16 = row2.addImage(creatProgressDay(getobjdata('16').limitchange, getobjdata('16').unlimitchange, 16))
  iconImg16.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg17 = row2.addImage(creatProgressDay(getobjdata('17').limitchange, getobjdata('17').unlimitchange, 17))
  iconImg17.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg18 = row2.addImage(creatProgressDay(getobjdata('18').limitchange, getobjdata('18').unlimitchange, 18))
  iconImg18.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg19 = row2.addImage(creatProgressDay(getobjdata('19').limitchange, getobjdata('19').unlimitchange, 19))
  iconImg19.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg20 = row2.addImage(creatProgressDay(getobjdata('20').limitchange, getobjdata('20').unlimitchange, 20))
  iconImg20.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg21 = row2.addImage(creatProgressDay(getobjdata('21').limitchange, getobjdata('21').unlimitchange, 21))
  iconImg21.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg22 = row2.addImage(creatProgressDay(getobjdata('22').limitchange, getobjdata('22').unlimitchange, 22))
  iconImg22.imageSize = new Size(Width, H)
  row2.addSpacer(D)
  const iconImg23 = row2.addImage(creatProgressDay(getobjdata('23').limitchange, getobjdata('23').unlimitchange, 23))
  iconImg23.imageSize = new Size(Width, H)


  w.addSpacer(2)
  let row3 = w.addStack()
  row3.layoutHorizontally()


  let date0 = row3.addText('00')
  date0.font = Font.mediumRoundedSystemFont(8)
  date0.textColor = DynamicText
  row3.addSpacer((Width+D/7)*6)//整体位置

  let date6 = row3.addText('06')
  date6.font = Font.mediumRoundedSystemFont(8)
  date6.textColor = DynamicText
  row3.addSpacer((Width+D/7)*6)//整体位置

  let date12 = row3.addText('12')
  date12.font = Font.mediumRoundedSystemFont(8)
  date12.textColor = DynamicText
  row3.addSpacer((Width+D/7)*6)//整体位置

  let date18 = row3.addText('18')
  date18.font = Font.mediumRoundedSystemFont(8)
  date18.textColor = DynamicText
  row3.addSpacer((Width+D/7)*5)//整体位置

  let date23 = row3.addText('23')
  date23.font = Font.mediumRoundedSystemFont(8)
  date23.textColor = DynamicText


}


function getsmallwidget(total, haveGone, str) {

  w.addSpacer(2)
  const titlew = w.addText(str)
  titlew.textColor = DynamicText
  titlew.font = Font.boldSystemFont(10)
  w.addSpacer(3)

  let row = w.addStack()
  row.layoutHorizontally()
  row.addSpacer(0)//整体位置

  const iconImg = row.addImage(creatProgress(total, haveGone))
  iconImg.imageSize = new Size(width, h)
  row.addSpacer(5)//图片与文字距离

  let column = row.addStack()
  column.layoutVertically()
  column.addSpacer(0)//字体上下

  const usageText = column.addText(String(ToSize(haveGone, 1, 1, 1)))
  const totalText = column.addText(String(ToSize(total, 1, 0, 1)) + '(' + (haveGone / total * 100).toFixed(1) + '%)')
  usageText.font = Font.mediumMonospacedSystemFont(h / 2)
  totalText.font = Font.mediumRoundedSystemFont(h / 3)
  usageText.textColor = DynamicText
  totalText.textColor = DynamicText
  w.addSpacer(5)

}

function creatProgressDay(limit, unlimit, t) {

  //   let NowUsageUnlimit=getobjdata(String(Hours)).unlimitchange
  //   let NowUsageLimit=getobjdata(String(Hours)).limitchange
  //   let All=NowUsageLimit+NowUsageUnlimit
  let All = limit + unlimit
  if (All >= 0 && All <= 10240) ThereShold = 10240//10MB
  if (All > 10240 && All <= 102400) ThereShold = 102400//100MB
  if (All > 102400 && All <= 512000) ThereShold = 512000//500MB
  if (All > 512000 && All <= 1048576) ThereShold = 1048576//1GB
  if (All > 1048576 && All <= 5242880) ThereShold = 5242880//5GB
  if (All > 5242880 && All <= 20971520) ThereShold = 20971520//20GB
  if (All > 20971520) ThereShold = 1048576000//100GB

  limit = h * limit / ThereShold
  unlimit = h * unlimit / ThereShold

  if (t == 0 || t == 6 || t == 12 || t == 18 || t == 23) Width = 0.3
  else Width = 0.1

  const context = new DrawContext()//创建图形画布
  context.size = new Size(width, h)
  context.opaque = false
  context.respectScreenScale = true

  context.setFillColor(new Color("#cccccc"))
  const pathline = new Path()//总数
  pathline.addRoundedRect(new Rect(3, 0, Width, h), 0, 0)
  //(左右偏移，上下偏移，宽度，高度)
  context.addPath(pathline)
  context.fillPath()

  context.setFillColor(new Color("#fe708b"))
  const path = new Path()//总数
  path.addRoundedRect(new Rect(0, h - unlimit, width, -limit), 0, 0)
  //(左右偏移，上下偏移，宽度，高度)
  context.addPath(path)
  context.fillPath()

  context.setFillColor(new Color("#8676ff"))
  const path1 = new Path()//百分比
  path1.addRoundedRect(new Rect(0, h, width, -unlimit), 0, 0)
  context.addPath(path1)
  context.fillPath()

  return context.getImage()
}

function creatProgress(total, havegone) {
  const context = new DrawContext()//创建图形画布
  context.size = new Size(width, h)
  context.opaque = false
  context.respectScreenScale = true

  context.setFillColor(new Color("#4d4d4d"))
  const path = new Path()//总数
  path.addRoundedRect(new Rect(0, 0, width, h), 3, 3)
  context.addPath(path)
  context.fillPath()

  context.setFillColor(new Color("#1785ff"))
  const path1 = new Path()//百分比
  path1.addRoundedRect(new Rect(0, h, width, -h * (total - havegone) / total), 3, 3)
  context.addPath(path1)
  context.fillPath()

  return context.getImage()
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

async function BoxJsData() {
  console.log('BoxJS获取数据')
  let url = 'http://boxjs.com/query/boxdata'
  let data = null
  try {
    let req = new Request(url)
    data = await (req.loadJSON())
    if(getdata('isData')==2){
      jsonData = JSON.parse(data['datas']['Tele_AutoCheck.packge_detail'])}
    if(getdata('isData')=='3'){
      jsonData=JSON.parse(data['datas']['@xream.10010.detail'])
    }
  } catch (e) { }
  return jsonData
}

async function getImage(url) {
  const request = new Request(url);
  const image = await request.loadImage();
  return image
}

function setdata(Key, Val) {
  Keychain.set(Key, Val)
  return true
}

function getdata(Key) { return Keychain.get(Key) }

function getobjdata(Key) { return JSON.parse(Keychain.get(Key)) }

function hasdata(Key) { return Keychain.contains(Key) }

function rmdata(Key) { Keychain.remove(Key)
  return true
}

function Query_All(jsonData) {//原始量

  let SetVal = Number(getdata('LimitVal'))
  let SetVal1=Number(getdata('unLimitVal'))

  if(getdata('isData')=='2'){
  if (SetVal != '') SetVal *= 1048576
  UnlimitInfo = jsonData.responseData.data.flowInfo.specialAmount
  LimitInfo = jsonData.responseData.data.flowInfo.commonFlow

  unlimitbalancetotal = Number(UnlimitInfo.balance)
  unlimitusagetotal = Number(UnlimitInfo.used)
  unlimitratabletotal = unlimitbalancetotal + unlimitusagetotal

  limitbalancetotal = Number(LimitInfo.balance)
  limitusagetotal = Number(LimitInfo.used)
  limitratabletotal = limitbalancetotal + limitusagetotal

  if (SetVal != '' && SetVal - limitratabletotal < 0) {
    limitusagetotal = SetVal - limitbalancetotal
    unlimitusagetotal = unlimitusagetotal + limitratabletotal - SetVal
    limitratabletotal = SetVal
    unlimitratabletotal = limitratabletotal - SetVal + unlimitbalancetotal + unlimitusagetotal
  }
  if (SetVal != '' && SetVal - limitratabletotal > 0) {
    limitbalancetotal = SetVal - limitusagetotal
    limitratabletotal = SetVal
  }

  PhoneBill= jsonData.responseData.data.balanceInfo.indexBalanceDataInfo.balance
  DataBill= jsonData.responseData.data.voiceInfo.voiceDataInfo.balance
  }
  if(getdata('isData')=='3') {
    unlimitratabletotal=SetVal1*1048579
    unlimitusagetotal=(jsonData.freeFlow)*1024
    unlimitbalancetotal=unlimitratabletotal-unlimitusagetotal

    limitratabletotal=SetVal*1048576
    limitusagetotal=(jsonData.sum-jsonData.freeFlow)*1024
    limitbalancetotal=limitratabletotal-limitusagetotal
    PhoneBill=''
    DataBill=''
  }

  let queryinfo = { unlimitall: unlimitratabletotal, unlimitleft: unlimitbalancetotal, unlimitusage: unlimitusagetotal, limitall: limitratabletotal, limitleft: limitbalancetotal, limitusage: limitusagetotal ,VoiceBill: PhoneBill ,VoiceDataBill: DataBill}

  return queryinfo
}