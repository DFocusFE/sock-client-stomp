import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

import {
  SocketOpts,
  CONNECT_STATE,
  BREAK_REASON,
  StateChangeCallback,
  BroadcastCallback,
  BroadcastCallbacks,
  SingleSubscribeCallback
} from './types'

export class SockClient {
  private _opts: SocketOpts
  private _state: CONNECT_STATE
  private _stateChangeCallbacks: Array<StateChangeCallback>
  private _broadcastCallbacks: BroadcastCallbacks
  private _singleSubscribeCallback: Array<SingleSubscribeCallback>
  private _subscriptions: Array<Stomp.Subscription>
  private _breakReason: BREAK_REASON
  private _socket: WebSocket
  private _stompClient: Stomp.Client

  constructor(opts: SocketOpts) {
    this._opts = opts
    this._state = CONNECT_STATE.DISCONNECTED

    this.validate()

    this._stateChangeCallbacks = []

    this._broadcastCallbacks = {}
    this._singleSubscribeCallback = []
    this._subscriptions = []

    this._breakReason = null
  }

  private validate() {
    ;['base', 'projectId', 'token'].forEach(key => {
      if (!this._opts[key]) {
        throw new Error(`${key} is missed in passed opts`)
      }
    })
  }

  public connect() {
    if (this._socket || this._stompClient) {
      throw new Error('You cannot call connect multiple times')
    }

    this.connectToWebsocket()
  }

  public disconnect() {
    try {
      this.changeState(CONNECT_STATE.DISCONNECTED)

      this._stateChangeCallbacks = []
      this._broadcastCallbacks = {}
      this._singleSubscribeCallback = []
      this._subscriptions = []

      const socket = this._socket
      this._socket = null
      this._stompClient = null

      socket.close()
    } catch (error) {
      console.warn('Closing ', error)
    }
  }

  public onStateChange(cb: StateChangeCallback) {
    if (!cb) {
      return
    }
    if (this._stateChangeCallbacks.every(c => c !== cb)) {
      this._stateChangeCallbacks.push(cb)
    }
  }

  private changeState(state: CONNECT_STATE) {
    this._state = state
    this._stateChangeCallbacks.forEach(cb => {
      cb(this._state)
    })

    if (state === CONNECT_STATE.CONNECTED) {
      this.startSubscribe()
    }
    if (state === CONNECT_STATE.DISCONNECTED) {
      this.endSubscribe()
    }
  }

  private startSubscribe() {
    const topics = Object.keys(this._broadcastCallbacks)

    topics.forEach(topic => {
      const subscription = this._stompClient.subscribe(
        `/topic/${this._opts.projectId}/${topic}`,
        arg => {
          this._broadcastCallbacks[topic].forEach(cb => {
            cb(arg)
          })
        }
      )
      this._subscriptions.push(subscription)
    })

    const subscription = this._stompClient.subscribe(
      `/user/queue/${this._opts.projectId}/`,
      arg => {
        this._singleSubscribeCallback.forEach(cb => {
          cb(arg)
        })
      }
    )
    this._subscriptions.push(subscription)
  }

  private endSubscribe() {
    this._subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  public subscribeBroadcast(topic: string, cb: BroadcastCallback) {
    if (!topic || !cb) {
      throw new Error('topic, cb cannot be undefined/null')
    }
    if (!this._broadcastCallbacks[topic]) {
      this._broadcastCallbacks[topic] = []
    }
    if (this._broadcastCallbacks[topic].every(c => c !== cb)) {
      this._broadcastCallbacks[topic].push(cb)
    }
  }

  public subscribeForCurrentUser(cb: SingleSubscribeCallback) {
    if (this._singleSubscribeCallback.every(c => c !== cb)) {
      this._singleSubscribeCallback.push(cb)
    }
  }

  private connectToWebsocket() {
    const { base } = this._opts
    this._socket = SockJS(base)
    this._stompClient = Stomp.over(this._socket)
    const { token, projectId } = this._opts

    this.changeState(CONNECT_STATE.CONNECTING)
    console.debug('Trying to connect to Websocket Server...')

    this._stompClient.connect(
      {
        token,
        projectId
      },
      () => {
        console.debug('Websocket connection established...')
        this.changeState(CONNECT_STATE.CONNECTED)
      },
      error => {
        this.changeState(CONNECT_STATE.DISCONNECTED)
        if (this._breakReason === BREAK_REASON.INVALID_TOKEN) {
          // error callback will be called twice, that's why we record _breakReason with first call
          // we should just leave the callback if _breakReason from last call exist and match invalid_token
          return
        }
        // quit here since token is checked as invalid by server
        // no need to re-connect with same arguments
        if (
          error &&
          error['headers'] &&
          error['headers']['message'] &&
          error['headers']['message'].includes('Failed to send message')
        ) {
          this.setBreakReason(BREAK_REASON.INVALID_TOKEN)
          return
        }

        this.reConnectWebSocket()
      }
    )
  }

  private reConnectWebSocket() {
    const { reconnect } = this._opts
    if (!reconnect) {
      return
    }

    const retryTimeout = reconnect.timeout || 30 * 1000

    console.debug(`Re-connecting websocket after ${retryTimeout / 1000} secs...`)

    // Call the websocket connect method
    setTimeout(() => {
      this.connectToWebsocket()
    }, retryTimeout)
  }

  private setBreakReason(reason: BREAK_REASON) {
    this._breakReason = reason

    // clear _breakReason in 2s
    setTimeout(() => {
      this._breakReason = null
    }, 2000)
  }
}

export {
  SocketOpts,
  CONNECT_STATE,
  BREAK_REASON,
  StateChangeCallback,
  BroadcastCallback,
  BroadcastCallbacks,
  SingleSubscribeCallback
} from './types'
