import { WampSocket } from '.'
import type { WAMPLoggeLoginByToken, WAMPLoggerLogin } from './types'

export class WAMPLogger extends WampSocket {
    /**
     * Попытка входа в систему пользователя с предоставленными учетными данными.
     *
     */
    public login(username: string, password: string) {
        const url = new URL('/login', this.options.baseURL)
        return super.send<WAMPLoggerLogin>(url.toString(), username, password)
    }

    /**
     * Вход в систему пользователя
     *
     * @param token - Токен аутентификации для пользователя
     */
    public loginByToken(token: string) {
        const url = new URL('/loginByToken', this.options.baseURL)
        return super.send<WAMPLoggeLoginByToken>(url.toString(), token)
    }

    /**
     * Выводит из системы пользователя
     *
     */
    public logout() {
        const url = new URL('/loginByToken', this.options.baseURL)
        return super.send<void>(url.toString())
    }
}

export default WAMPLogger
