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

function getActorWithTag(world, tagName: string) {
    let outActors = $ref<UE.TArray<UE.Actor>>();
    UE.GameplayStatics.GetAllActorsWithTag(world, tagName, outActors)
    let outActorsValue = $unref(outActors);

    if (outActorsValue.Num()) {
        return outActorsValue.Get(0);
    } else {
        return null;
    }
}

async function waitActorReachLocation(actor: UE.Actor, targetLocation: UE.Vector, timeoutMs = 10_000) {
    let finalTime = Date.now() + timeoutMs;

    while (Date.now() < finalTime) {
        let curLocation = actor.K2_GetActorLocation();
        let distance = curLocation.op_Subtraction(targetLocation).Size2D();

        if (distance < 50) {
            return true;
        }

        await sleep(1000);
    }

    return false;
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

    // ???????????????setTimeout?????????timer??????????????????timeout?????????
    // ??????timer?????????????????????new Date????????????
    console.log("before sleep", new Date().toISOString());
    await sleep(10000);
    console.log("after sleep", new Date().toISOString());

    console.log("QuickStartMain_Part_InitialSleep leave", new Date().toISOString());
}

async function QuickStartMain_Part_TextEncoding() {
    console.log("QuickStartMain_Part_TextEncoding enter", new Date().toISOString());    

    ////////////////    UTF8TextEncoder UTF8TextDecoder    ////////////////////////////////
    let testStr1 = "???????????????";

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

    gStompController.registerEndpoint({
        appDestination: "/test/run/case_0001_BP_GoodSwitch",
        callback: async (inMessage) => {
            let world = getWorld();

            try {
                let goodSwitchActor = getActorWithTag(world, "GoodSwitch");

                if (!goodSwitchActor) {
                    throw new Error("not found goodSwitchActor")
                }

                let ceilingLightActor = getActorWithTag(world, "CeilingLight") as UE.Game.AutoTest.BP_CustomCeilingLight.BP_CustomCeilingLight_C;

                if (!ceilingLightActor) {
                    throw new Error("not found ceilingLightActor")
                }

                let isLightVisible = ceilingLightActor.PointLight1.IsVisible();

                console.log("isLightVisible", isLightVisible);

                let playerController = UE.GameplayStatics.GetPlayerController(world, 0);
                let targetLocation = goodSwitchActor.K2_GetActorLocation();

                console.log("player location", playerController.Pawn.K2_GetActorLocation().ToString());
                console.log("target location", targetLocation.ToString());

                let startDistance = playerController.Pawn.K2_GetActorLocation().op_Subtraction(targetLocation).Size2D();

                console.log(`startDistance ${startDistance}`);

                // UE.AIBlueprintHelperLibrary.SimpleMoveToLocation(playerController, targetLocation);
                UE.AIBlueprintHelperLibrary.SimpleMoveToActor(playerController, goodSwitchActor);

                let reached = await waitActorReachLocation(playerController.Pawn, targetLocation, 10_000);

                console.log("player location", playerController.Pawn.K2_GetActorLocation().ToString());
                console.log("target location", targetLocation.ToString());

                if (!reached) {
                    throw new Error("timeout, not reach goodSwitchActor")
                }

                isLightVisible = ceilingLightActor.PointLight1.IsVisible();

                console.log("isLightVisible", isLightVisible);

                if (!isLightVisible) {
                    throw new Error("light is not turned on");
                }
    
                gStompController.sendMessage({
                    inMessage,
                })
            } catch (error) {
                gStompController.sendMessage({
                    inMessage,
                    outMessage: {
                        jsonBody: {
                            error: {
                                message: error.toString(),
                            },
                        }
                    }
                })
            }
        }
    });

    gStompController.registerEndpoint({
        appDestination: "/test/run/case_0002_BP_BadSwitch",
        callback: async (inMessage) => {
            let world = getWorld();

            try {
                let badSwitchActor = getActorWithTag(world, "BadSwitch");

                if (!badSwitchActor) {
                    throw new Error("not found badSwitchActor")
                }

                let ceilingLightActor = getActorWithTag(world, "CeilingLight") as UE.Game.AutoTest.BP_CustomCeilingLight.BP_CustomCeilingLight_C;

                if (!ceilingLightActor) {
                    throw new Error("not found ceilingLightActor")
                }

                let isLightVisible = ceilingLightActor.PointLight1.IsVisible();

                console.log("isLightVisible", isLightVisible);

                let playerController = UE.GameplayStatics.GetPlayerController(world, 0);
                let targetLocation = badSwitchActor.K2_GetActorLocation();

                console.log("player location", playerController.Pawn.K2_GetActorLocation().ToString());
                console.log("target location", targetLocation.ToString());

                let startDistance = playerController.Pawn.K2_GetActorLocation().op_Subtraction(targetLocation).Size2D();

                console.log(`startDistance ${startDistance}`);

                // UE.AIBlueprintHelperLibrary.SimpleMoveToLocation(playerController, targetLocation);
                UE.AIBlueprintHelperLibrary.SimpleMoveToActor(playerController, badSwitchActor);

                let reached = await waitActorReachLocation(playerController.Pawn, targetLocation, 10_000);

                console.log("player location", playerController.Pawn.K2_GetActorLocation().ToString());
                console.log("target location", targetLocation.ToString());

                if (!reached) {
                    throw new Error("timeout, not reach badSwitchActor")
                }

                isLightVisible = ceilingLightActor.PointLight1.IsVisible();

                console.log("isLightVisible", isLightVisible);

                if (!isLightVisible) {
                    throw new Error("light is not turned on");
                }
    
                gStompController.sendMessage({
                    inMessage,
                })
            } catch (error) {
                gStompController.sendMessage({
                    inMessage,
                    outMessage: {
                        jsonBody: {
                            error: {
                                message: error.toString(),
                            },
                        }
                    }
                })
            }
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
