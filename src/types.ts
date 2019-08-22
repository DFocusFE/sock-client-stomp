import Stomp from 'stompjs'

export enum CONNECT_STATE {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}

export enum BREAK_REASON {
  INVALID_TOKEN
}

interface RetryOpts {
  /**
   * milliseconds for next re-connect
   */
  timeout?: number
}

export interface SocketOpts {
  base: string
  projectId: string
  token: string

  reconnect?: RetryOpts | false
}

export interface StateChangeCallback {
  (state: CONNECT_STATE): void
}

interface SockMessage extends Stomp.Message {
  body: string
  command: string
}

export interface BroadcastCallback {
  (message: SockMessage): void
}

export interface BroadcastCallbacks {
  [topic: string]: Array<BroadcastCallback>
}

export interface SingleSubscribeCallback {
  (message: SockMessage): void
}
