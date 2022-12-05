import { messageCallbackType, Client, IMessage, IPublishParams } from '../stompjs';

import { MessageUtil } from './message-util';

export interface IEndpointParams {
    appDestination: string;
    callback: messageCallbackType;
}

export class StompControllerConfig {
    public brokerURL: string;
    public login: string = "guest";
    public passcode: string = "guest";
    public controllerId: string;
}

const controllerEndpointPrefix = "/controller";

export let gStompController: StompController;

export class StompController {
    public brokerURL: string;
    public login: string;
    public passcode: string;
    public controllerId: string;

    public started: boolean = false;
    public stompClient: Client;

    private _traceTag: string = "StompController";
    private _endpoints: { [key: string]: IEndpointParams };

    constructor(conf: StompControllerConfig) {
        this._endpoints = {};

        this.configure(conf);

        this.registerEndpoint({
            appDestination: `${controllerEndpointPrefix}/ping`,
            callback: this.onPing.bind(this),
        });

        gStompController = this;
    }

    public registerEndpoint(params: IEndpointParams) {
        console.log(`${this._traceTag} registerEndpoint appDestination ${params.appDestination}`);

        this._endpoints[params.appDestination] = params;
    }

    public start() {
        if (this.started) {
            throw new Error("Already started?");
        }

        this.started = true;

        this.stompClient = new Client({
            brokerURL: this.brokerURL,
    
            connectHeaders: {
                login: this.login,
                passcode: this.passcode,
            },
    
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
    
            // Subscriptions should be done inside onConnect as those need to reinstated when the broker reconnects
            onConnect: (frame) => {
                console.log(`${this._traceTag} onConnect Enter`);
                
                // The return object has a method called `unsubscribe`
                const subscription = this.stompClient.subscribe(
                    `/topic/stomp-controller-${this.controllerId}`, this.onControllerMessage.bind(this));
            },
        });

        this.stompClient.activate();
    }

    public replyErrorIfNeeded(params: {inMessage: IMessage, errorMsg: string}) {
        const { inMessage } = params;

        if (!MessageUtil.okToReply(inMessage)) {
            return;
        }

        this.replyError(params);
    }

    public replyError(params: {inMessage: IMessage, errorMsg: string}) {
        const { inMessage, errorMsg } = params;

        this.sendMessage({
            inMessage,
            outMessage: {
                jsonBody: {
                    error: {
                        message: errorMsg
                    }
                }
            }
        });
    }

    public sendMessage(params: {inMessage?: IMessage, outMessage?: IPublishParams}) {
        let { inMessage, outMessage } = params;

        if (!outMessage) {
            outMessage = {};
        }

        if (inMessage) {
            outMessage.destination = inMessage.headers.replyDestination;

            outMessage.headers = outMessage.headers || {};
            
            if (inMessage.headers.replyAppDestination) {
                outMessage.headers.appDestination = inMessage.headers.replyAppDestination;
            }

            if (inMessage.headers.streamId) {
                outMessage.headers.streamId = inMessage.headers.streamId;
            }
        }

        this.stompClient.publish(outMessage);
    }

    //////////////////////// private //////////////////////////////////////
    private configure(conf: StompControllerConfig): void {
        // bulk assign all properties to this
        (Object as any).assign(this, conf);
    }

    private onControllerMessage(message: IMessage) {
        let appDestination = message.headers.appDestination;
        let errorMsg;

        if (!appDestination) {
            errorMsg = "message missing appDestination header";
            console.error(`${this._traceTag} ${errorMsg}`);

            this.replyErrorIfNeeded({
                inMessage: message,
                errorMsg,
            })

            return;
        }

        let endpoint = this._endpoints[appDestination];

        if (!endpoint) {
            errorMsg = `no endpoint registered at ${appDestination}`;
            console.error(`${this._traceTag} ${errorMsg}`);

            this.replyErrorIfNeeded({
                inMessage: message,
                errorMsg,
            })

            return;
        }

        endpoint.callback(message);
    }

    private onPing(inMessage: IMessage) {
        this.sendMessage({
            inMessage,
            outMessage: {
                jsonBody: {
                    timestamp: new Date().toISOString(),
                    controllerId: this.controllerId,
                }
            }
        });
    }
}