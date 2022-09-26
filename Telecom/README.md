# 电信余量
可以关注我的[电报频道](https://t.me/CatStudyCase)小更新会在里面，反馈可直接联系我

```
目前支持 STASH QX 小火箭 

等平台的流量跳点通知
```
---

### STASH使用方法

进入STASH覆写库安装请求体获取脚本以及余量脚本

同时需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.stash.stoverride)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

![App Screenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/STASH.jpg)

### 小火箭使用方法
点击小火箭-配置-模块后安装如下链接

> [https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket.Module](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket.Module)

需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

![App Screenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/Shadow.jpg)

### QX(圈叉)使用方法
长按重写-右上角-粘贴如下链接(开启解析器)

获取Body:
> https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_QX.conf

在QX右下角三条横线(构造请求)中，任务仓库添加如下任务(是加号左边第三个)

电信余量:
>https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_QX_LocalTask.conf

需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

**若无法获取Body请检查Mitm开关与域名是否添加**


# BoxJs后续配置
BoxJs中请求体(Body)获取方法：
1. 方式一:进入翼支付，打开手机充值
2. 方式二:微信打开中国电信5G会员，点击头像旁边的剩余流量
3. 当提示获取到body后即可，在BoxJS中可以查看到获取到的body
![BoxjsScreenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/Boxjsminiprc.jpg)
![BoxjsScreenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/Boxjsyzf.jpg)

***注意事项：***
1. 初次使用流量免流与跳点可能错误
2. 对于筛选流量包，如果剩余数据与定向不正确，则说明表达式可能筛选了其他的包，请输入更精准的包名
3. 如果你之前使用的是自动选包，更换手动选包后跳点与免流信息在初次查询可能有错误，不用在意

# 修改定时任务
### STASH
STASH覆写库中默认为5分钟查询一次
如有需要可按照如下图修改（修改后记得关闭覆写）

![AppScreenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/CRON.jpg)

### 小火箭
修改模块中Cron后面即可

![App Screenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/Shadowcron.jpg)


### QX
在配置中修改Cron定时任务即可



# Bark部分参数设置
### Bark的Key(使用Bark通知时需要填写)
```
https://api.day.app/xxxxxxxxxxxx/附加参数
```

| Bark服务器地址 | 描述     |
| :------:  | :----: |
| `https://api.day.app/xxxx/`| 从Bark复制出来粘贴到Boxjs中即可|

### 自定义Bark通知图标
```
可以去一些矢量图网找一些自定义图标

此处提供一个图标
```
> https://raw.githubusercontent.com/QGCliveDavis/Module/main/Asset/China_Telecom.png

### Bark附加参数(非必须)
|Bark附加属性|值|描述|
|:----:|:----:|:----:|
|level|active|系统会立即亮屏通知|
||timeSensitive|时效性通知，可在专注模式下提醒|
||passive|仅在通知栏中显示，不提醒|
||||
|sound|minute|更多可在Bark中查看|
||alarm|更多可在Bark中查看|
||paymentsuccess|更多可在Bark中查看|
||||
|isArchive|1|自动保存消息|
||其他|不保存消息|
|...|...|...|
**填写示例**
> level=timeSensitive&isArchive=1&sound=glass
```
表示<时效性通知><保存消息><通知铃声为Glass>
```

