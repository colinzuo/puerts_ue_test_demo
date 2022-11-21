import * as UE from 'ue'

export class UEWebsocket {
  onclose: ((ev: any) => any) | null;
  onerror: ((ev: any) => any) | null;
  onmessage: ((ev: any) => any) | null;
  onopen: (() => any) | null;
  terminate?: (() => any) | null;

  /**
   * Returns a string that indicates how binary data from the socket is exposed to scripts:
   * We support only 'arraybuffer'.
   */
  binaryType: 'arraybuffer';

  /**
   * Returns the state of the socket connection.
   */
  readyState: number;

  url: string;
  protocols: string;
  _ueWebsocket: UE.WebSocket;
  traceOn: boolean = false;
  _traceTag = "UEWebsocket";

  constructor(url: string, protocols: string, bindRawMessage: boolean = true) {
    this.url = url;
    this.protocols = protocols;
    this._ueWebsocket = UE.WebSocketFunctionLibrary.CreateWebSocket(url, protocols);
    this.readyState = WebSocketReadyState.CLOSED;

    this._ueWebsocket.OnWebSocketConnected.Add(this.OnWebSocketConnected_Internal.bind(this));
    this._ueWebsocket.OnWebSocketConnectionError.Add(this.OnWebSocketConnectionError_Internal.bind(this));
    this._ueWebsocket.OnWebSocketClosed.Add(this.OnWebSocketClosed_Internal.bind(this));

    if (bindRawMessage) {
      this._ueWebsocket.OnWebSocketRawMessageReceived.Add(this.OnWebSocketRawMessageReceived_Internal.bind(this));
    } else {
      this._ueWebsocket.OnWebSocketMessageReceived.Add(this.OnWebSocketMessageReceived_Internal.bind(this));
    }
  }

  public connect(): void {
    if (this.readyState != WebSocketReadyState.CLOSED) {
        throw new Error(`State ${this.readyState} is invalid for connect`);
    }

    this.readyState = WebSocketReadyState.CONNECTING;
    this._ueWebsocket.Connect();
  }

  /**
   * Closes the connection.
   */
  public close(): void {
    this._ueWebsocket.Close();
  }

  /**
   * Transmits data using the connection. data can be a string.
   */
  public send(data: string | ArrayBuffer): void {
    if (typeof data === "string") {
      this._ueWebsocket.SendMessage(data);
    } else {
      this._ueWebsocket.SendRawMessage(data, true);
    }
  }

  public Clear(): void {
    this._ueWebsocket.OnWebSocketConnected.Clear();
    this._ueWebsocket.OnWebSocketConnectionError.Clear();
    this._ueWebsocket.OnWebSocketClosed.Clear();
    this._ueWebsocket.OnWebSocketMessageReceived.Clear();
  }

  OnWebSocketConnected_Internal(): void {
    if (this.traceOn) {
      console.log(`${this._traceTag} OnWebSocketConnected_Internal`);
    }

    this.readyState = WebSocketReadyState.OPEN;

    if (this.onopen) {
        this.onopen();
    }
  }

  OnWebSocketConnectionError_Internal(Error: string) {
    if (this.traceOn) {
      console.log(`${this._traceTag} OnWebSocketConnectionError_Internal`);
    }

    if (this.onerror) {
        this.onerror(Error);
    }
  }

  OnWebSocketClosed_Internal(StatusCode: number, Reason: string, bWasClean: boolean) {
    if (this.traceOn) {
      console.log(`${this._traceTag} OnWebSocketClosed_Internal`);
    }

    this.readyState = WebSocketReadyState.CLOSED;

    if (this.onclose) {
        this.onclose({
            code: StatusCode,
            reason: Reason,
            wasClean: bWasClean,
        });
    }
  }

  OnWebSocketMessageReceived_Internal(Message: string) {
    if (this.traceOn) {
      console.log(`${this._traceTag} OnWebSocketMessageReceived_Internal`);
    }

    if (this.onmessage) {
        this.onmessage({
            data: Message,
        });
    }
  }

  OnWebSocketRawMessageReceived_Internal(ArrayBuffer: ArrayBuffer, BytesRemaining: number) {
    if (this.traceOn) {
      console.log(`${this._traceTag} OnWebSocketRawMessageReceived_Internal`);
    }

    if (this.onmessage) {
        this.onmessage({
            data: ArrayBuffer,
            bytesRemaining: BytesRemaining,
        });
    }
  }
}

/**
 * Possible states for the Websocket
 */
 export enum WebSocketReadyState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED,
}
