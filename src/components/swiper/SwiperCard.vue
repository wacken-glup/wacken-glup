<script lang="ts">
import type { PropType } from 'vue'
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import EventDetailsDialogContent from "@/components/event/details/EventDetailsDialogContent.vue"

export default {
    props: {
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        }
    },
    components: { EventDetailsDialogContent }
}
</script>

<template>
    <div style="overflow: scroll">    
        <img class="responsive large absolute top right" :src="event.cardThumbnailUrl()">
        <img class="responsive large" style="opacity: 0" :src="event.cardThumbnailUrl() || '/'">

        <EventDetailsDialogContent :event="event" :lock-spotify="true" style="margin-top: -112px" />              
    </div>
</template>