import { WampSocket } from '.'
import { CheckIfInitialized } from './decorators'
import type { WAMPLoggeLoginByToken, WAMPLoggerLogin } from './types'

export class WAMPLogger extends WampSocket {
    /**
     * Попытка входа в систему пользователя с предоставленными учетными данными.
     *
     */
    @CheckIfInitialized
    public login(username: string, password: string) {
        const url = new URL('/login', this.options.baseURL)
        return super.send<WAMPLoggerLogin>(url.toString(), username, password).catch(() => {
            throw new Error('Failed to authorize by login')
        })
    }

    /**
     * Вход в систему пользователя
     *
     * @param token - Токен аутентификации для пользователя
     */
    @CheckIfInitialized
    public loginByToken(token: string) {
        const url = new URL('/loginByToken', this.options.baseURL)
        return super.send<WAMPLoggeLoginByToken>(url.toString(), token).catch(() => {
            throw new Error('Failed to authorize by token')
        })
    }

    /**
     * Выводит из системы пользователя
     *
     */
    @CheckIfInitialized
    public logout() {
        const url = new URL('/loginByToken', this.options.baseURL)
        return super.send<void>(url.toString())
    }
}

export default WAMPLogger
