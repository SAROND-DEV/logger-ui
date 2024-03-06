import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { WampSocketSubscribeItem, WampSocketSubscribeItemLevel } from '@/modules/wamp/types'
import WAMPLogger from '@/modules/wamp/logger'

export const useStorageLogs = defineStore('storageLogs', () => {
    const logs = ref<WampSocketSubscribeItem[]>([])
    const token = ref('')
    const lazyLoading = ref(true)

    const logger = new WAMPLogger('ws://test.enter-systems.ru/', { baseURL: 'http://enter.local' })
    logger.addEventListener('open', async () => {
        const user = token.value
            ? await logger.loginByToken(token.value)
            : await logger.login('enter', 'A505a')

        token.value = user.Token

        logger.subscribe('/subscription/logs/list', (data) => {
            lazyLoading.value = true
            logs.value.push(...data.Items)
            lazyLoading.value = false
        })
    })

    const filterLogsByLevel = (level?: WampSocketSubscribeItemLevel) =>
        logs.value.filter((log) => !level || log.Level === level)

    return { logs, lazyLoading, filterLogsByLevel }
})
