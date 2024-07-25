<script lang="ts">
import type { PropType } from 'vue'

import WoaEventModelWrapper from "../../sdk/model/WoaEventModelWrapper"

import EventDetailsDialogContent from "./details/EventDetailsDialogContent.vue"
import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        open: Boolean,
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        }
    },
    methods: {
        toggleSuggested() {
            if(this.$ctx.currentUser.value === undefined) {
                this.openLoginNeededDialog.value = true
                return
            }

            this.$client.space?.self?.toggleSuggested(this.event.data.uid)
        },
        toggleLike() {
            if(this.$ctx.currentUser.value === undefined) {
                this.openLoginNeededDialog.value = true
                return
            }

            this.$client.space?.self?.toggleLike(this.event.data.uid)
        }
    },
    emits: [ "dismiss" ],
    components: { EventDetailsDialogContent, EventDetailsChips }
}
</script>

<template>
    <div class="overlay" :class="{ active: open }" @click="$emit('dismiss')"></div>

    <dialog :class="{ active: open }" class="max-s">
        <img class="responsive large absolute top right" :src="event.cardThumbnailUrl()">

        <header class="blur" style="border-radius: 1.75rem; position: sticky; top: 0; z-index: 100;">
            <nav>
                <div class="small-space"></div>

                <button class="circle transparent" @click="$emit('dismiss')">
                   <i>close</i>
                </button>

                <h5 class="max">{{ $t("common.details") }}</h5>

                <button class="transparent circle" @click="toggleSuggested()">
                    <i class="ignore-hover-fill" :class="{ fill: $client.space?.self?.isSuggested(event.data.uid), 'primary-text': $client.space?.self?.isSuggested(event.data.uid) }">thumb_up</i>
                </button>

                <button class="transparent circle" @click="toggleLike()">
                    <i class="ignore-hover-fill" :class="{ fill: $client.space?.self?.isLiked(event.data.uid), 'primary-text': $client.space?.self?.isLiked(event.data.uid) }">favorite</i>
                </button>

                <div class="small-space"></div>
            </nav>
        </header>
        
        <img class="responsive large" style="opacity: 0" :src="event.cardThumbnailUrl() || '/'">

        <EventDetailsDialogContent :event="event" style="margin-top: -112px" />
    </dialog>
</template>