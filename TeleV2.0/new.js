let notify_switch = $persistentStore.read("notice_switch");
let pack_switch = $persistentStore.read("auto_switch");
let Tele_body = $persistentStore.read("Tele_BD");
let Tele_value= $persistentStore.read("threshold")//跳点阈值
let bark_key=$persistentStore.read('bark_key')
let icon_url=$persistentStore.read('bark_icon')
let loginerror=$persistentStore.read('Bodyswitch')
let brond=$persistentStore.read("key_brond")

(async () => {
    let panel = {
        title: '电信余量',
        content: ``,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }

    let arrquery=``
    let Tele_body = $persistentStore.read("Tele_BD");
	let pack_switch = $persistentStore.read("auto_switch");

    await query(Tele_body).then(result=>{
        arrquery=query_all(result,packge_switch)//原始量数组
    }).catch(e=>{
        console.log(e)
    })

    if(brond==undefined){
        for(var i in data.RESULTDATASET){
            if(data.RESULTDATASET[i].OFFERTYPE==11){
            $persistentStore.write(data.RESULTDATASET[i].PRODUCTOFFNAME,'key_brond')
            }
    	}
    }

    panel['title'] = brond



})()

async function query(Tele_body){//余量原始数据
    return new Promise((resolve,reject)=>{
        $httpClient.post({
            url: 'https://czapp.bestpay.com.cn/payassistant-client?method=queryUserResource',
			headers: "",
    		body: Tele_body, // 请求体
        },(error,response,data)=>{
            if(error){
                reject(`网络请求错误❌，请检查`)
            }
            else{
                resolve(JSON.parse(data))
            }
        })
    })
}

function query_all(jsonData,packge_switch){//原始量累计
    let unlimitratabletotal=''
    let unlimitbalancetotal=''
    let unlimitusagetotal=''
    let limitratabletotal=''
    let limitbalancetotal=''
    let limitusagetotal=''
    var x = $persistentStore.read("limititems").split(' ');//通用正则选择
	var y = $persistentStore.read('unlimititems').split(' ');//定向正则选择

    if(notify_switch=='true'){
    for(var s in jsonData.RESULTDATASET){
        const k = jsonData.RESULTDATASET[s].RATABLERESOURCEID//获取包名id判断定向与通用
        if(k==3312000||k==331202||k==351100||k==3511000)//判断定向
		{
			unlimitratableAmount =jsonData.RESULTDATASET[s].RATABLEAMOUNT//单包定向总量
			unlimitbalanceAmount =jsonData.RESULTDATASET[s].BALANCEAMOUNT//单包定向余量
			unlimitusageAmount =jsonData.RESULTDATASET[s].USAGEAMOUNT//单包定向使用量
			unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
			unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
			unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
		}
		if(k==3311000||k==3321000||k==331100)//判断通用
		{
			limitratableAmount =jsonData.RESULTDATASET[s].RATABLEAMOUNT//通用总量
			limitbalanceAmount =jsonData.RESULTDATASET[s].BALANCEAMOUNT//通用余量
			limitusageAmount =jsonData.RESULTDATASET[s].USAGEAMOUNT//通用使用量
			limitratabletotal+=Number(limitratableAmount)//总量累加
			limitbalancetotal+=Number(limitbalanceAmount)//余量累加
			limitusagetotal+=Number(limitusageAmount)//使用累加
		}
    }
    }else{
        for(var j=0;j+1<=jsonData.RESULTDATASET.length;j++){
		for(var i=0;i+1<=x.length;i++){
			const limitRegExp=new RegExp(x[i])//正则判断是否包含算选包正则
			if(limitRegExp.test(jsonData.RESULTDATASET[j].PRODUCTOFFNAME+jsonData.RESULTDATASET[j].RATABLERESOURCENAME)){
				limitusageAmount=jsonData.RESULTDATASET[j].USAGEAMOUNT//特定通用使用量
				limitbalanceAmount=jsonData.RESULTDATASET[j].BALANCEAMOUNT
				limitratableAmount=jsonData.RESULTDATASET[j].RATABLEAMOUNT	
				limitratabletotal+=Number(limitratableAmount)//总量累加
				limitbalancetotal+=Number(limitbalanceAmount)//余量累加
				limitusagetotal+=Number(limitusageAmount)//使用累加
			}
		}

	}

	for(var k=0;k+1<=jsonData.RESULTDATASET.length;k++){
		for(var e=0;e+1<=y.length;e++){
			const unlimitRegExp=new RegExp(y[e])//正则判断是否包含算选包正则
			if(unlimitRegExp.test(jsonData.RESULTDATASET[k].PRODUCTOFFNAME+jsonData.RESULTDATASET[k].RATABLERESOURCENAME)){
				unlimitusageAmount=jsonData.RESULTDATASET[k].USAGEAMOUNT//特定定向使用量
				unlimitbalanceAmount=jsonData.RESULTDATASET[k].BALANCEAMOUNT
				unlimitratableAmount=jsonData.RESULTDATASET[k].RATABLEAMOUNT
				unlimitratabletotal+=Number(unlimitratableAmount)//总量累加
				unlimitbalancetotal+=Number(unlimitbalanceAmount)//余量累加
				unlimitusagetotal+=Number(unlimitusageAmount)//使用累加
			}

		}

	}
    }

    let queryinfo={unlimitall:unlimitratabletotal,unlimitleft:unlimitbalancetotal,unlimitusage:unlimitusagetotal,limitall:limitratabletotal,limitleft:limitbalancetotal,limitusage:limitusagetotal}
    return queryinfo
}