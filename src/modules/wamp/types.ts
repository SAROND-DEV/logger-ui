export enum WAMPType {
    WELCOME = 0,
    CALL = 2,
    CALL_RESULT = 3,
    CALL_ERROR = 4,
    SUBSCRIBE = 5,
    UNSUBSCRIBE = 6,
    EVENT = 8,
    HEARTBEAT = 20
}

export enum WampSocketSubscribeAction {
    ADD = 0,
    INIT = 3
}

export enum WampSocketSubscribeItemLevel {
    FATAL = 'FATAL',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    TRACE = 'TRACE'
}

export interface WampSocketOptions {
    baseURL: string
    protocols?: string | string[]
    timeout: number
    reconnectTimeout: number
    heartbeatTimeout: number
}

export interface WampSocketSubscribeData {
    Action: WampSocketSubscribeAction
    Items: WampSocketSubscribeItem[]
}

export interface WampSocketSubscribeItem {
    Timestamp: string
    Level: WampSocketSubscribeItemLevel
    Message: string
    Source: string
}

export interface WAMPLoggerLogin {
    Token: string
    Username: string
}

export interface WAMPLoggeLoginByToken extends WAMPLoggerLogin {}
