import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { WampSocketSubscribeItem, WampSocketSubscribeItemLevel } from '@/modules/wamp/types'
import WAMPLogger from '@/modules/wamp/logger'

export const useStorageLogs = defineStore('storageLogs', () => {
    const hashLogs = ref<Set<WampSocketSubscribeItem>>(new Set())
    const logs = computed(() => Array.from(hashLogs.value))
    const token = ref('')
    const lazyLoading = ref(true)

    /**
     * Хардкод для теста, заменить на process.env
     */
    const login = 'enter'
    const password = 'A505a'

    const logger = new WAMPLogger('ws://test.enter-systems.ru/', { baseURL: 'http://enter.local' })
    const authenticateAndSubscribeToLogs = async () => {
        const user = token.value
            ? await logger.loginByToken(token.value).catch(() => logger.login(login, password))
            : await logger.login(login, password)

        token.value = user.Token

        logger.subscribe('/subscription/logs/list', (data) => {
            lazyLoading.value = true
            data.Items.forEach((item) => hashLogs.value.add(item))
            lazyLoading.value = false
        })
    }

    logger.init().then(authenticateAndSubscribeToLogs)
    logger.onReconnect = authenticateAndSubscribeToLogs

    const filterLogsByLevel = (level?: WampSocketSubscribeItemLevel) =>
        Array.from(logs.value).filter((log) => !level || log.Level === level)

    return { logs, lazyLoading, filterLogsByLevel }
})
