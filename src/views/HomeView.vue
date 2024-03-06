<template>
    <div v-bind="containerProps" class="overflow-auto p-2 bg-gray-500/5 rounded">
        <div v-bind="wrapperProps">
            <div v-for="{ index, data } in list" :key="index" class="mb-1">
                <div class="flex">
                    <div class="min-w-16 mr-4">{{ data.Timestamp }}</div>
                    <div class="min-w-16 mr-4">{{ data.Level }}</div>
                    <div class="min-w-16 mr-4">{{ data.Message }}</div>
                    <div class="min-w-16 mr-4">{{ data.Source }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStorageLogs } from '../stores/storageLogs'
import { useVirtualList } from '@vueuse/core'

const storageLogs = useStorageLogs()
const { list, containerProps, wrapperProps } = useVirtualList(storageLogs.logs, {
    itemHeight: 50
})
</script>
