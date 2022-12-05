import * as UE from 'ue'
import {$ref, $unref, $set, argv, on, toManualReleaseDelegate, releaseManualReleaseDelegate, blueprint} from 'puerts';

import { UTF8TextDecoder, UTF8TextEncoder } from './text-encoding';
import { UEWebsocket } from './websocket';
import { FrameImpl, Client } from './stompjs';
import { gStompController, StompController, StompControllerConfig } from './stomp-controller';

let gameInstance = argv.getByName("GameInstance") as UE.GameInstance;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function displayIncomingMessage(user, message) {
    console.log(`user ${user}: ${message}`);
}

function getWorld() {
    let world = gameInstance.GetWorld();
    return world;
}

// debugger;
console.log("before QuickStartMain");

console.log("WebSocketFunctionLibrary.GetLogVerbosity before set", UE.WebSocketFunctionLibrary.GetLogVerbosity());

// Error, Warning, Log, Verbose
UE.WebSocketFunctionLibrary.SetLogVerbosity("Warning");

console.log("WebSocketFunctionLibrary.GetLogVerbosity after set", UE.WebSocketFunctionLibrary.GetLogVerbosity());

async function QuickStartMain_Part_InitialSleep() {
    console.log("QuickStartMain_Part_InitialSleep enter", new Date().toISOString());

    console.log("0 before sleep", new Date().toISOString());
    setTimeout(() => {
        console.log("0 timeout", new Date().toISOString());
    }, 5000);

    // 刚启动时候setTimeout设计的timer会比预期提前timeout，感觉
    // 像是timer起始点并没有和new Date获取一致
    console.log("before sleep", new Date().toISOString());
    await sleep(10000);
    console.log("after sleep", new Date().toISOString());

    console.log("QuickStartMain_Part_InitialSleep leave", new Date().toISOString());
}

async function QuickStartMain_Part_TextEncoding() {
    console.log("QuickStartMain_Part_TextEncoding enter", new Date().toISOString());    

    ////////////////    UTF8TextEncoder UTF8TextDecoder    ////////////////////////////////
    let testStr1 = "我的中国心";

    let testStr1Encoded = (new UTF8TextEncoder()).encode(testStr1);
    let testStr1Decoded = (new UTF8TextDecoder()).decode(testStr1Encoded);

    console.log(`testStr1Encoded ${testStr1Encoded}`);
    console.log(`testStr1Decoded ${testStr1Decoded}`);

    console.log("QuickStartMain_Part_TextEncoding leave", new Date().toISOString());
}

async function QuickStartMain_Part_UEWebsocket() {
    console.log("QuickStartMain_Part_UEWebsocket enter", new Date().toISOString());

    let websocket = new UEWebsocket("ws://172.16.23.70:15674/ws", "v12.stomp");

    websocket.onclose = (event) => {
        const closeStr = JSON.stringify(event);
        console.log(`websocket.onclose: ${closeStr}`);
    };

    websocket.onerror = (event) => {
        console.log(`websocket.onerror: ${event}`);
    };

    websocket.onmessage = (event) => {
        let message: string;

        if (typeof event.data == "string") {
            message = event.data;
        } else {
            message = new UTF8TextDecoder().decode(event.data);
        }

        console.log(`websocket.onmessage: message ${message}`);
    };

    websocket.onopen = () => {
        console.log("websocket.onopen");

        let command = "CONNECT";
        let headers = {
            'login': 'guest',
            'passcode': 'guest',
            'accept-version': '1.0,1.1,1.2',
            'heart-beat': '20000,20000',
        };

        let connectFrame = new FrameImpl({
            command,
            headers,
        });
        let message = connectFrame.serialize();

        console.log(`to send message: ${connectFrame}`);

        let encodedMessage: Uint8Array = new UTF8TextEncoder().encode(message);

        console.log(`encodedMessage length ${encodedMessage.length}`);

        websocket.send(encodedMessage);
    };

    websocket.connect();

    console.log("before sleep", new Date().toISOString());
    await sleep(30000);
    console.log("after sleep", new Date().toISOString());

    console.log("QuickStartMain_Part_UEWebsocket leave", new Date().toISOString());
}

async function QuickStartMain_Part_Stompjs() {
    console.log("QuickStartMain_Part_Stompjs enter", new Date().toISOString());

    let stompClient = new Client({
        "brokerURL": "ws://172.16.23.70:15674/ws",

        connectHeaders: {
            login: "guest",
            passcode: "guest"
        },

        debug: function (str) {
            console.log('STOMP: ' + str);
        },

        // Subscriptions should be done inside onConnect as those need to reinstated when the broker reconnects
        onConnect: function (frame) {
            console.log('onConnect Enter');
            
            // The return object has a method called `unsubscribe`
            const subscription = stompClient.subscribe(
            '/topic/chat', function (message) {
                const payload = JSON.parse(message.body);
                displayIncomingMessage(payload.user, payload.message);
            });
        },
    });

    stompClient.activate();

    console.log("before sleep", new Date().toISOString());
    await sleep(30000);
    console.log("after sleep", new Date().toISOString());

    console.log("QuickStartMain_Part_Stompjs leave", new Date().toISOString());
}

async function QuickStartMain_Part_StompController() {
    console.log("QuickStartMain_Part_StompController enter", new Date().toISOString());

    let controllerConfig = new StompControllerConfig();
    controllerConfig.brokerURL = "ws://172.16.23.70:15674/ws";
    controllerConfig.controllerId = "colinzuo-desktop-ue";

    let stompController = new StompController(controllerConfig);

    gStompController.start();

    gStompController.registerEndpoint({
        appDestination: "/level/getCurrentLevelName",
        callback: (inMessage) => {
            let world = getWorld();

            let levelName = UE.GameplayStatics.GetCurrentLevelName(world);

            gStompController.sendMessage({
                inMessage,
                outMessage: {
                    jsonBody: {
                        levelName,
                    }
                }
            })
        }
    });

    gStompController.registerEndpoint({
        appDestination: "/level/open",
        callback: (inMessage) => {
            let json_body = JSON.parse(inMessage.body);

            console.log(`to open level ${json_body.levelName}`);

            let world = getWorld();

            UE.GameplayStatics.OpenLevel(world, json_body.levelName);

            gStompController.sendMessage({
                inMessage,
            })
        }
    });

    console.log("QuickStartMain_Part_StompController leave", new Date().toISOString());
}

async function QuickStartMain() {
    console.log("QuickStartMain enter");

    await QuickStartMain_Part_InitialSleep();

    // await QuickStartMain_Part_TextEncoding();

    // await QuickStartMain_Part_UEWebsocket();

    // await QuickStartMain_Part_Stompjs();

    await QuickStartMain_Part_StompController();

    console.log("QuickStartMain leave");
}

QuickStartMain();
