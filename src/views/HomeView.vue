<template>
    <div class="bg-gray-200">
        <div class="sticky top-0 left-0 bg-gray-200 flex px-12 py-4">
            <div class="w-48 mx-4">
                <label for="levels" class="block mb-2 text-sm font-medium text-gray-900">
                    Select level log
                </label>
                <select
                    v-model="level"
                    id="levels"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option selected>ALL</option>
                    <option v-for="(level, index) in levels" :key="index" :value="level">
                        {{ level }}
                    </option>
                </select>
            </div>

            <div class="w-80 mx-4">
                <label for="search" class="block mb-2 text-sm font-medium text-gray-900">
                    Search
                </label>
                <input
                    v-model="search"
                    type="text"
                    id="search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                />
            </div>

            <div class="flex items-center">
                <span>
                    Найдено элементов: {{ matchesTotal.length ? matchCurrent + 1 : 0 }} /
                    {{ matchesTotal.length }}
                </span>

                <div class="mx-4">
                    <span class="mx-2 cursor-pointer" @click="gotoNextMatch">Вперед</span>
                    <span class="mx-2 cursor-pointer" @click="gotoPrevMatch">Назад</span>
                </div>
            </div>
        </div>

        <div v-bind="containerProps" class="px-4">
            <div v-bind="wrapperProps">
                <div
                    v-for="(render, index) in renderHighlightText"
                    :key="index"
                    class="flex"
                    :class="itemLogClasses(render)"
                    v-html="render.html"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStorageLogs } from '../stores/storageLogs'
import { useVirtualList } from '@vueuse/core'
import { WampSocketSubscribeItemLevel, type WampSocketSubscribeItem } from '@/modules/wamp/types'
import { computed, ref, watch } from 'vue'

const search = ref('')
const matchCurrent = ref<number>(0)
const matchesTotal = ref<string[]>([])
const levels = Object.values(WampSocketSubscribeItemLevel)
const level = ref('ALL')
const storageLogs = useStorageLogs()
const logs = computed(() => {
    const wampSocketSubscribeItemLevel = level.value as WampSocketSubscribeItemLevel
    return levels.some((_level) => _level === wampSocketSubscribeItemLevel)
        ? storageLogs.filterLogsByLevel(wampSocketSubscribeItemLevel)
        : storageLogs.logs
})

watch(search, () => {
    matchesTotal.value = []
})

watch(matchesTotal, () => {
    matchCurrent.value = 0
})

const { list, containerProps, wrapperProps } = useVirtualList(logs, {
    itemHeight: 50
})

const itemLogClasses = (log: Pick<WampSocketSubscribeItem, 'Level'>) => ({
    'text-neutral-800': log.Level === WampSocketSubscribeItemLevel.DEBUG,
    'text-red-500': log.Level === WampSocketSubscribeItemLevel.ERROR,
    'text-red-800': log.Level === WampSocketSubscribeItemLevel.FATAL,
    'text-blue-500': log.Level === WampSocketSubscribeItemLevel.INFO,
    'text-cyan-600': log.Level === WampSocketSubscribeItemLevel.TRACE
})

const renderHighlightText = computed(() =>
    list.value.map((item) => ({
        html: highlightText(item.data),
        Level: item.data.Level
    }))
)

const highlightText = (item: WampSocketSubscribeItem) => {
    const render: string[] = []

    render.push(`<p class="w-48 mr-4">${highlightProperty(item.Timestamp)}</p>`)
    render.push(`<p class="w-12 mr-8">${highlightProperty(item.Level)}</p>`)
    render.push(`<p class="flex-1 mr-12">${highlightProperty(item.Message)}</p>`)
    render.push(`<p class="w-48 mr-4">${highlightProperty(item.Source)}</p>`)

    return render.join('')
}

const highlightProperty = (text: string) => {
    const startIndex = text.indexOf(search.value)
    if (startIndex === -1 || search.value === '') {
        return text
    }

    const endIndex = startIndex + search.value.length
    const html = `${text.slice(0, startIndex)}<span class="bg-yellow-300">${text.slice(startIndex, endIndex)}</span>${text.slice(endIndex)}`
    matchesTotal.value.push(html)

    return html
}

const gotoNextMatch = () => {
    if (matchCurrent.value + 1 < matchesTotal.value.length) {
        matchCurrent.value++
        scrollToCurrentMatch()
    }
}

const gotoPrevMatch = () => {
    if (matchCurrent.value > 0) {
        matchCurrent.value--
        scrollToCurrentMatch()
    }
}

const scrollToCurrentMatch = () => {
    const highlights = document.querySelectorAll('.bg-yellow-300')
    if (highlights.length > 0) {
        const element = highlights[matchCurrent.value]
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })

        highlights.forEach((el, index) => {
            el.style.backgroundColor = index === matchCurrent.value ? 'orange' : 'yellow'
        })
    }
}
</script>
