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
        </div>

        <div v-bind="containerProps" class="overflow-auto p-2">
            <div v-bind="wrapperProps">
                <div v-for="{ index, data } in list" :key="index" class="mb-1">
                    <div
                        class="flex"
                        :class="{
                            'text-neutral-800': data.Level === WampSocketSubscribeItemLevel.DEBUG,
                            'text-red-500': data.Level === WampSocketSubscribeItemLevel.ERROR,
                            'text-red-800': data.Level === WampSocketSubscribeItemLevel.FATAL,
                            'text-blue-500': data.Level === WampSocketSubscribeItemLevel.INFO,
                            'text-cyan-600': data.Level === WampSocketSubscribeItemLevel.TRACE
                        }"
                    >
                        <Highlighter
                            class="min-w-16 mr-4"
                            highlightClassName="highlight"
                            :searchWords="[search]"
                            :autoEscape="true"
                            :textToHighlight="data.Timestamp"
                        />

                        <Highlighter
                            class="min-w-16 mr-4"
                            highlightClassName="highlight"
                            :searchWords="[search]"
                            :autoEscape="true"
                            :textToHighlight="data.Level"
                        />

                        <Highlighter
                            class="min-w-16 mr-4"
                            highlightClassName="highlight"
                            :searchWords="[search]"
                            :autoEscape="true"
                            :textToHighlight="data.Message"
                        />

                        <Highlighter
                            class="min-w-16 mr-4"
                            highlightClassName="highlight"
                            :searchWords="[search]"
                            :autoEscape="true"
                            :textToHighlight="data.Source"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStorageLogs } from '../stores/storageLogs'
import { useVirtualList } from '@vueuse/core'
import { WampSocketSubscribeItemLevel } from '@/modules/wamp/types'
import { computed, ref } from 'vue'
import Highlighter from 'vue-highlight-words'

const search = ref('')
const levels = Object.values(WampSocketSubscribeItemLevel)
const level = ref('ALL')
const storageLogs = useStorageLogs()
const logs = computed(() => {
    const wampSocketSubscribeItemLevel = level.value as WampSocketSubscribeItemLevel
    return levels.some((_level) => _level === wampSocketSubscribeItemLevel)
        ? storageLogs.filterLogsByLevel(wampSocketSubscribeItemLevel)
        : storageLogs.logs
})

const { list, containerProps, wrapperProps } = useVirtualList(logs, {
    itemHeight: 50
})
</script>
