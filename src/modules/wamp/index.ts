import { v4 as uuidv4 } from 'uuid'
import { WAMPType, type WampSocketOptions, type WampSocketSubscribeData } from './types'

export class WampSocket extends WebSocket {
    protected heartbeatCounter: number = 0

    constructor(
        url: string,
        protected options: WampSocketOptions
    ) {
        super(url, options.protocols)
        super.addEventListener('open', () => this.heartbeat.bind(this))
        super.addEventListener('message', ({ data }) => {
            const parsedData = JSON.parse(data)
            if (parsedData[0] === WAMPType.CALL_ERROR) {
                console.error('Error request server: ', parsedData)
            }
        })
    }

    /**
     * Отправка сообщения с использованием формата WAMP (Web Application Messaging Protocol)
     *
     * @param method - Имя удаленной процедуры, которую необходимо вызвать
     * @param args - Массив аргументов для передачи вместе с вызовом
     * @returns Обещание, которое разрешается при получении ответа на определенный вызов или отклоняется по истечении таймаута
     */
    public send<T = any>(method: string, ...args: Array<string | number | boolean>): Promise<T> {
        const url = new URL(method, this.options.baseURL)
        const id = uuidv4()
        super.send(JSON.stringify([WAMPType.CALL, id, url, ...args]))
        return new Promise<any>((resolve, reject) => {
            super.addEventListener('message', ({ data }) => {
                const parsedData = JSON.parse(data)
                const timeout = setTimeout(() => {
                    reject('Timeout request message')
                }, this.options.timeout ?? 1000)

                if (parsedData[1] === id) {
                    clearTimeout(timeout)
                    return resolve(parsedData[2])
                }
            })
        })
    }

    /**
     * Подписывается на тему и прослушивает сообщения.
     *
     * @param method - Название темы, на которую нужно подписаться.
     * @param callback - Функция обратного вызова, выполняемая при получении сообщения в подписанной теме.
     * @returns Функция, при вызове которой вы отпишитесь от темы и перестанете слушать сообщения.
     */
    public subscribe(method: string, callback: (data: WampSocketSubscribeData) => void) {
        const url = new URL(method, this.options.baseURL)
        const handlerCallback = ({ data }: MessageEvent<string>) => {
            const parsedData = JSON.parse(data)

            if (parsedData[1] === url.toString()) {
                callback(parsedData[2])
            }
        }

        super.send(JSON.stringify([WAMPType.SUBSCRIBE, url]))
        super.addEventListener('message', handlerCallback)

        return () => {
            super.send(JSON.stringify([WAMPType.UNSUBSCRIBE, url]))
            super.removeEventListener('message', handlerCallback)
        }
    }

    /**
     * Запуск ping/pong для поддержания активного соединения с сервером.
     *
     */
    private heartbeat() {
        setTimeout(() => {
            super.send(JSON.stringify([WAMPType.HEARTBEAT, this.heartbeatCounter++]))
        }, 20000)
    }
}

export default WampSocket
