import { v4 as uuidv4 } from 'uuid'
import { WAMPType, type WampSocketOptions, type WampSocketSubscribeData } from './types'
import { CheckIfInitialized } from './decorators'

export class WampSocket {
    public socket!: WebSocket

    protected heartbeatCounter: number = 0
    protected _isInitialized = false
    protected heartbeatInterval!: NodeJS.Timeout
    protected options: WampSocketOptions
    protected isClose = false
    protected defaultOptions: Omit<WampSocketOptions, 'baseURL'> = {
        timeout: 1000,
        reconnectTimeout: 10000,
        heartbeatTimeout: 20000
    }

    public onReconnect: (...args: any) => void = () => ({})

    constructor(
        protected url: string | URL,
        options: Pick<WampSocketOptions, 'baseURL'> & Partial<WampSocketOptions>
    ) {
        this.options = Object.assign({}, this.defaultOptions, options)
    }

    public get isInitialized() {
        return this._isInitialized
    }

    /**
     * Инициализирует экземпляр, устанавливая соединение, если оно еще не инициализировано
     *
     * @throws Если экземпляр уже инициализирован, он выдает ошибку, чтобы предотвратить повторную инициализацию
     */
    public init() {
        if (this.isInitialized) {
            throw new Error('The instance has already been initialized.')
        }

        return this.connect().then(() => {
            this._isInitialized = true
        })
    }

    /**
     * Отправка сообщения с использованием формата WAMP (Web Application Messaging Protocol)
     *
     * @param method - Имя удаленной процедуры, которую необходимо вызвать
     * @param args - Массив аргументов для передачи вместе с вызовом
     * @returns Promise, который разрешается при получении ответа на определенный вызов или отклоняется по истечении таймаута
     */
    @CheckIfInitialized
    public send<T = any>(method: string, ...args: Array<string | number | boolean>): Promise<T> {
        const url = new URL(method, this.options.baseURL)
        const id = uuidv4()
        const timeout = setTimeout(() => {
            throw new Error('Timeout request message')
        }, this.options.timeout)

        this.socket.send(JSON.stringify([WAMPType.CALL, id, url, ...args]))
        return new Promise<any>((resolve) => {
            this.socket.addEventListener('message', ({ data }) => {
                const parsedData = JSON.parse(data)

                if (parsedData[1] === id) {
                    clearTimeout(timeout)
                    return resolve(parsedData[2])
                }
            })
        })
    }

    /**
     * Подписывается на тему и прослушивает сообщения
     *
     * @param method - Название темы, на которую нужно подписаться
     * @param callback - Функция обратного вызова, выполняемая при получении сообщения в подписанной теме
     * @returns unsubscribe(), при вызове которой вы отпишитесь от темы и перестанете слушать сообщения
     */
    @CheckIfInitialized
    public subscribe(method: string, callback: (data: WampSocketSubscribeData) => void) {
        const url = new URL(method, this.options.baseURL)
        const handlerCallback = ({ data }: MessageEvent<string>) => {
            const parsedData = JSON.parse(data)

            if (parsedData[1] === url.toString()) {
                callback(parsedData[2])
            }
        }

        this.socket.send(JSON.stringify([WAMPType.SUBSCRIBE, url]))
        this.socket.addEventListener('message', handlerCallback)

        return () => {
            this.socket.send(JSON.stringify([WAMPType.UNSUBSCRIBE, url]))
            this.socket.removeEventListener('message', handlerCallback)
        }
    }

    /**
     * Закрывает текущее соединение с сокетом.
     */
    public close() {
        clearInterval(this.heartbeatInterval)
        this.heartbeatCounter = 0
        this.isClose = true
        this.socket.close()
    }

    /**
     * Запуск ping/pong для поддержания активного соединения с сервером
     *
     */
    private heartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.socket.send(JSON.stringify([WAMPType.HEARTBEAT, this.heartbeatCounter++]))
        }, this.options.heartbeatTimeout)
    }

    /**
     * Инициирует соединение с сервером с помощью WebSocket
     */
    private connect() {
        this.isClose = false
        this.socket = new WebSocket(this.url, this.options.protocols)
        this.socket.addEventListener('close', () => {
            !this.isClose &&
                setTimeout(() => this.restoreConnection(), this.options.reconnectTimeout)
        })

        return new Promise<this>((resolve, reject) => {
            this.socket.addEventListener('message', (ev) => {
                this.handleErrorMessageData(ev)
                const parsedData = JSON.parse(ev.data)
                if (parsedData[0] === WAMPType.WELCOME) {
                    this.heartbeat()
                    return resolve(this)
                }

                return reject('Connection could not be established')
            })
        })
    }

    /**
     * Попытка восстановить соединение WebSocket
     *
     */
    private async restoreConnection() {
        this.close()
        await this.connect()
        this.onReconnect()
    }

    /**
     * Разбирает данные входящих сообщений WebSocket
     *
     * @throws Выбрасывает ошибку, если они содержат ошибку вызова WAMP
     */
    private handleErrorMessageData({ data }: MessageEvent<any>) {
        const parsedData = JSON.parse(data)
        if (parsedData[0] === WAMPType.CALL_ERROR) {
            throw new Error(parsedData)
        }
    }
}

export default WampSocket
