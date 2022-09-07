

!(async () => {
    let panel = {
        title: '电信余量',
        content: ``,
        backgroundColor: "#0099FF",
        icon: "dial.max.fill",
    }

    let Tele_body = $persistentStore.read("Tele_BD");

    let arrquery=`` //数据量数组型
    await query(Tele_body).then(result=>{

        arrquery=query_all(result)//原始量数组

    }).catch(e=>{
    
        if(e="010040"){
            title="Body错误或已过期❌（也可能是电信的问题）"
            body='请尝试重新抓取Body(不抓没得用了！)'
            body1="覆写获取到Body后可以不用关闭覆写"
            if(bark_key){bark_notice(title,body,body1)}
            else{$notification.post(title,body,body1)}	
            let loginerror=1
            $persistentStore.write(loginerror,'Bodyswitch')
        }else{
            console.log(e)
        }

    }).finally(() => {
        $done(panel)
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
        }, function (error,response,data){
            jsondata=JSON.parse(data)
            if(error){
                reject('网络请求错误❌，请检查')
                return
            }
            if(response.status !== 200){
                reject('网络相应错误❌，请检查')
                return
            }
            if(jsondata.RESPONSECODE=="010040"){
                console.log(jsondata.RESPONSECONTENT)
                reject(jsondata.RESPONSECODE)//010040
                return
            }
            if(jsondata.RESPONSECODE=="000000"){
                resolve(jsondata)
                return
            }
            
        })
    })
}

function query_all(jsonData){//原始量累计
    let unlimitratabletotal=0
    let unlimitbalancetotal=0
    let unlimitusagetotal=0
    let limitratabletotal=0
    let limitbalancetotal=0
    let limitusagetotal=0

    let x = $persistentStore.read("limititems").split(' ');//通用正则选择
	let y = $persistentStore.read('unlimititems').split(' ');//定向正则选择
	let packge_switch = $persistentStore.read("auto_switch");//自动选包开关

    if(packge_switch=='true'){
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

function bark_notice(title,body,body1){
	let bark_title=title
	let bark_body=body
	let bark_body1=body1

	let bark_icon
	if(icon_url){bark_icon=`?icon=${icon_url}`}
	else {bark_icon=''}

	let bark_other=$persistentStore.read('bark_add')
  	let effective=bark_icon.indexOf("?icon")
  	if((effective!=-1)&&bark_other){bark_other=`&${bark_other}`}
	else if((effective==-1)&&bark_other){bark_other=`?${bark_other}`}
	else{bark_other=''}
	let url =`${bark_key}${encodeURIComponent(bark_title)}/${encodeURIComponent(bark_body)}${encodeURIComponent('\n')}${encodeURIComponent(bark_body1)}${bark_icon}${bark_other}`

	$httpClient.get({url})
}

function kbytesToSize(kbytes) {//字节转换
    if (kbytes === 0) return "0B";
    let k = 1024;
    sizes = ["KB", "MB", "GB", "TB"];
    let i = Math.floor(Math.log(kbytes) / Math.log(k));//获取指数
    return (kbytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime() {
    let dateObj = $script.startTime//获取时间
	let Minutes = dateObj.getMinutes();//获取分钟
  	let Hours = dateObj.getHours(); //获取小时
    let Dates = dateObj.getDate(); //获取日期天
	let Month = dateObj.getMonth()+1//获取日期月
	let Year = dateObj.getFullYear()//获取日期年
    let objtime={year: Year, month: Month, day:Dates, hours:Hours, minutes:Minutes}
    return objtime
}