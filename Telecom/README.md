# 电信余量
可以关注我的[电报频道](https://t.me/CatStudyCase)小更新会在里面，反馈可直接联系我

```
目前支持 STASH QX 小火箭 LOON Surge等平台的流量跳点通知

有Node环境可以直接跑，自动版可以自己定期登录

手动版需要定期进去公众号或者App获取Token
```
---

## STASH使用方法

进入STASH覆写库安装请求体获取脚本以及余量脚本

#### 自动版：
在STASH中安装这个覆写（官方覆写库中已经上线）：

>[https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Stash_Auto.stoverride](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Stash_Auto.stoverride)

#### 手动版：
请在STASH覆写库中安装如下两个覆写：
![App Screenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/STASH.jpg)

同时需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.stash.stoverride)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)


## ShadowRocket使用方法
点击小火箭-配置-模块后安装

#### 自动版
> [https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket_Auto.Module](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket_Auto.Module)

#### 手动版
> [https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket.Module](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_ShadowRocket.Module)

![App Screenshots](https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Screenshots/Shadow.jpg)

需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)


## QX(圈叉)使用方法

#### 自动版与手动版都在仓库中

仓库添加方法：在QX右下角三条横线(构造请求)中，任务仓库添加如下任务(加号左边第三个)

电信余量:
> https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_QX_LocalTask.conf

获取Body安装方法:(手动版需要安装自动获取Body脚本：长按重写-右上角-粘贴如下链接(开启解析器))
> https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_QX.conf

需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

### Loon

> 仅供参考 以该 app 最新配置为准 自行配置

```
[Script]
enable = true
cron "*/5 * * * *" script-path=https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Cellular_Auto.js
```
需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

## Surge

```
[Script]
电信余量 = type=cron,cronexp=*/5 * * * *,timeout=30,script-path=https://raw.githubusercontent.com/QGCliveDavis/Module/main/Telecom/Tele_Cellular_Auto.js
```
需要[BoxJS](https://raw.githubusercontent.com/chavyleung/scripts/master/box/rewrite/boxjs.rewrite.surge.sgmodule)进行后续配置[一键订阅BoxJs](http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FQGCliveDavis%2FModule%2Fmain%2FTelecom%2FTele.json)

**若无法获取Body请检查Mitm开关与域名是否添加**

# BoxJs后续配置(自动版)
1. 输入营业厅账号与密码
2. 记得保存后可点击运行
3. BoxJS记得修改数据前要刷新页面

# BoxJs后续配置(手动版)
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
4. 如果你是自动版，择无需正则选包
5. 同时间只可以有一个设备在线，营业厅在线的时候推荐关闭脚本，否则会被脚本挤下去
6. 本脚本以iPhone 14作为登录设备，所以异地登录设备是14时不要担心

# 自定义通知数据
1. [套]=>套餐名 [时]=>两次查询间隔时间 [跳]=>周期内跳点 [免]=>周期内免流 
2. [通用]=>周期总共使用通用流量 [通剩]=>周期内剩余通用流量 [通总]=>通用总流量
3. [定用]=>周期总共使用定向流量 [定剩]=>周期内剩余定向流量 [定总]=>定向总流量
4. [今跳]=>今日跳点 [今免]=>今日免流 [话]=>话费余额
5. [总用]=>总共使用流量 [语剩]=>语音剩余 [语用]=>语音使用 [语总]=>语音总时长
 ```
例如: [套] /耗时：[时]-免[免] /跳[跳]
定向[定用] /剩余[通剩]
 如上表示：
    标题显示：套餐名与耗时，
    通知体显示：免,跳 
    换行显示：定向使用量与通用剩余量
 ```
***必须包含一个‘-’且只能有一个,不同数据必须以/分开,'-'前方为标题，后面为通知体,自行回车换行***

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

