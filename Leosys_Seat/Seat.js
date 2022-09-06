let userid_info=$persistentStore.read("userid_info").split(' ')try{let d=''$notification.post(seatinfo.room+'座位信息 总共:'+seatinfo.totalSeats,'正在使用中:'+seatinfo.inUse+' 剩余:'+seatinfo.free+' 已预约:'+seatinfo.reserved,'时间段内空余<'+d+'>'+`\n`+'不可用 <'+allfull+'>')}headers: headers,$httpClient.get({})let seat_stat=reservearr.statjsondata = JSON.parse(data);(error, response, data) => url: `https://leosys.cn/axhu/rest/v2/room/stats2/1/${time}`,else{resolve(objarr)}$httpClient.get(
     {
   url: `https://leosys.cn/axhu/rest/auth?username=${userid_info[0]}&password=${userid_info[1]}`,
   headers: {
      'token' : $persistentStore.read("LeoSys_Token"),
     'actCode' : `true`},
   body: '', 
 },(error,response,data)=>{
   tokendata = JSON.parse(data);
 $persistentStore.write(tokendata.data.token,"LeoSys_Token")
   })
  }
}