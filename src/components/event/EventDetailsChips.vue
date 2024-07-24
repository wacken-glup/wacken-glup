<script lang="ts">
import type { PropType } from 'vue'

import WoaEventModelWrapper from "../../sdk/model/WoaEventModelWrapper"

export default {
    props: {
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        }
    },
    methods: {
        showOnTimetable() {
            this.$router.push({
                path: "/",
                query: {
                    eventId: this.event.data.uid.toString()
                }
            })
        }
    }
}
</script>

<template>
    <nav class="scroll hide-scrollbar" style="z-index: 10">
        <div></div>
        
        <a class="chip fill">{{ event.data.stage.title }}</a>
        <a class="chip fill">{{ $t(event.data.performance.title) }}</a>
        <a class="chip fill" @click="e => { e.stopPropagation(); showOnTimetable() }">{{ $t(event.data.festivalday.title) }}</a>
        <a class="chip fill" @click="e => { e.stopPropagation(); showOnTimetable() }">
            {{ new Date(parseInt(event.data.start) * 1000).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" }) }}
            {{ $t("common.until") }}
            {{ new Date(parseInt(event.data.end) * 1000).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" }) }}
        </a>
    </nav>
</template>