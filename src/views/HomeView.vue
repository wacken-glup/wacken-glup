<script lang="ts">
import AppBar from "@/components/AppBar.vue"
import EventsTable from "@/components/table/EventsTable.vue"

import delay from "delay"

export default {
    data() {
        return {
            loaded: false
        }  
    },
    mounted() {
        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)
            this.loaded = true
        })()  
    },
    components: { AppBar, EventsTable }
}
</script>

<template>
    <AppBar :label="
        (loaded && $client.space?.name) ? $client.space?.name
            : $t('navigation.overview')
    " />

    <main class="responsive max">
        <EventsTable />
    </main>
</template>

<style>
.content {
    margin: 16px;
}
</style>