
## 初始项目创建

创建项目，模板选择third person with starter content

## 添加puerts支持

<https://puerts.github.io/unreal/zhcn/install>

<https://github.com/Tencent/puerts/releases/download/Unreal_v1.0.2/puerts_v8.tgz>

- 解压`Plugins\Puerts`

- 修改 *.uproject

```json
	"Plugins": [
...
		{
			"Name": "Puerts",
			"Enabled": true
		}
	]
```

- 修改 *.Build.cs

```csharp
    PublicDependencyModuleNames.AddRange(new string[] { ....., "JsEnv" });
```

- 准备ts相关

参照puerts_unreal_demo创建UTsGameInstance

<https://github.com/chexiongsheng/puerts_unreal_demo/blob/master/Source/puerts_unreal_demo/TsGameInstance.cpp>

拷贝tsconfig.json, TsProj下相关内容，Plugins\EasyWebsockets

- 编译`Plugins\EasyWebsockets`

需要先disable live coding，然后在visual studio下编译，不然报错

UnrealBuildTool : error : Unhandled exception: System.UnauthorizedAccessException

直接在UE Editor通过ctrl + alt + F11编译也会报错，会报下面错误，然后editor就crash了

log suppression category was somehow declared twice with the same data

在Project Settings -> Project -> Maps & Modes 设置Game Instance为TsGameInstance

- 更新ue.d.ts

- 在visual studio code通过tsc:watch编译ts代码

<https://github.com/chexiongsheng/puerts_unreal_demo>

编译，在vscode上“Terminal -> Run Build Task”选tsc watch，修改代码后会自动编译

- 运行

使用puerts过滤，参考output log如下

```
Puerts: (0x00000813528EAFF0) before QuickStartMain
Puerts: (0x00000813528EAFF0) WebSocketFunctionLibrary.GetLogVerbosity before set,Warning
Puerts: (0x00000813528EAFF0) WebSocketFunctionLibrary.GetLogVerbosity after set,Verbose
Puerts: (0x00000813528EAFF0) QuickStartMain enter
Puerts: (0x00000813528EAFF0) QuickStartMain_Part_InitialSleep enter,2022-11-21T08:23:25.497Z
Puerts: (0x00000813528EAFF0) 0 before sleep,2022-11-21T08:23:25.497Z
Puerts: (0x00000813528EAFF0) before sleep,2022-11-21T08:23:25.497Z
LogLoad: Game class is 'puerts_ue_test_demoGameMode'
Puerts: (0x00000813528EAFF0) 0 timeout,2022-11-21T08:23:30.242Z
Puerts: (0x00000813528EAFF0) after sleep,2022-11-21T08:23:35.241Z
Puerts: (0x00000813528EAFF0) QuickStartMain_Part_InitialSleep leave,2022-11-21T08:23:35.242Z
Puerts: (0x00000813528EAFF0) QuickStartMain_Part_StompController enter,2022-11-21T08:23:35.243Z
Puerts: (0x00000813528EAFF0) StompController registerEndpoint appDestination /controller/ping
Puerts: (0x00000813528EAFF0) QuickStartMain_Part_StompController leave,2022-11-21T08:23:35.244Z
Puerts: (0x00000813528EAFF0) STOMP: Opening Web Socket...
Puerts: (0x00000813528EAFF0) QuickStartMain leave
Puerts: (0x00000813528EAFF0) STOMP: Web Socket Opened...
Puerts: (0x00000813528EAFF0) STOMP: >>> CONNECT
Puerts: (0x00000813528EAFF0) STOMP: Received data
Puerts: (0x00000813528EAFF0) STOMP: <<< CONNECTED
Puerts: (0x00000813528EAFF0) STOMP: connected to server RabbitMQ/3.10.10
Puerts: (0x00000813528EAFF0) STOMP: send PING every 10000ms
Puerts: (0x00000813528EAFF0) STOMP: check PONG every 10000ms
Puerts: (0x00000813528EAFF0) StompController onConnect Enter
```

## UE测试

在Content下创建AutoTest目录

从Content/ThirdPerson/Maps拷贝ThirdPersonMap到Content/AutoTest目录，重命名为TestFunctionalMap

在Project Settings -> Maps & Modes 设置Default Map为TestFunctionalMap

参照如下文档和视频搭建Level

<https://docs.unrealengine.com/5.0/en-US/quick-start-guide-for-blueprints-visual-scripting-in-unreal-engine/>

[Using Blueprint Interfaces to Reduce Coupling in Unreal Engine 4](https://www.youtube.com/watch?v=JkJLeG8cErc&list=PLL4s8QTahRc11XP1Zn21F0v4CVD3abVKI)

[Automated functional testing in UE4](https://www.youtube.com/watch?v=HscEt4As0_g&list=PLL4s8QTahRc11XP1Zn21F0v4CVD3abVKI)
