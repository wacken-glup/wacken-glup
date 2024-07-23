<script lang="ts">
import type WoaEventModelWrapper from '@/sdk/model/WoaEventModelWrapper'

import EventDetailsDialog from "@/components/event/EventDetailsDialog.vue"

export default {
    data() {
        return {
            openEventDetailsDialog: false,
            selectedEvent: undefined as WoaEventModelWrapper | undefined
        }
    },
    methods: {
        update() {
            let detailsQuery = this.$route.query["details"]

            if(detailsQuery === undefined) {
                this.openEventDetailsDialog = false
            }else{
                let event = this.$client.container.eventByUid.value.get(parseInt(detailsQuery+""))
                if(event !== undefined) this.selectedEvent = event

                setTimeout(() => {
                    this.openEventDetailsDialog = true
                }, 50);
            }
        },
        dismiss() {
            this.$router.back()
        }
    },
    mounted() {
        this.update()
    },
    watch: {
        $route() {
            this.update()
        }
    },
    components: { EventDetailsDialog }
}
</script>

<template>
    <EventDetailsDialog v-if="selectedEvent != undefined" :open="openEventDetailsDialog" :event="selectedEvent"
            @dismiss="dismiss()" />
</template>