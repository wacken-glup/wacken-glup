<script lang="ts">
import type { PropType } from 'vue'

import BaseCardDataModel from "../../sdk/model/BaseCardDataModel"

import ActDetailsDialogContent from "./details/ActDetailsDialogContent.vue"
import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        open: Boolean,
        model: {
            type: Object as PropType<BaseCardDataModel>,
            required: true
        }
    },
    methods: {
        toggleSuggested() {
            if(this.$ctx.currentUser.value === undefined) {
                this.openLoginNeededDialog.value = true
                return
            }

            this.$client.space?.self?.toggleSuggested(this.model.uid)
        },
        toggleLike() {
            if(this.$ctx.currentUser.value === undefined) {
                this.openLoginNeededDialog.value = true
                return
            }

            this.$client.space?.self?.toggleLike(this.model.uid)
        }
    },
    emits: [ "dismiss" ],
    components: { ActDetailsDialogContent, EventDetailsChips }
}
</script>

<template>
    <div class="overlay" :class="{ active: open }" @click="$emit('dismiss')"></div>

    <dialog :class="{ active: open }" class="max-s">
        <img class="responsive large absolute top right" :src="model.cardThumbnailUrl()">

        <header class="blur" style="border-radius: 1.75rem; position: sticky; top: 0; z-index: 100;">
            <nav>
                <div class="small-space"></div>

                <button class="circle transparent" @click="$emit('dismiss')">
                   <i>close</i>
                </button>

                <h5 class="max">{{ $t("common.details") }}</h5>

                <button class="transparent circle" @click="toggleSuggested()">
                    <i class="ignore-hover-fill" :class="{ fill: $client.space?.self?.isSuggested(model.uid), 'primary-text': $client.space?.self?.isSuggested(model.uid) }">thumb_up</i>
                </button>

                <button class="transparent circle" @click="toggleLike()">
                    <i class="ignore-hover-fill" :class="{ fill: $client.space?.self?.isLiked(model.uid), 'primary-text': $client.space?.self?.isLiked(model.uid) }">favorite</i>
                </button>

                <div class="small-space"></div>
            </nav>
        </header>
        
        <img class="responsive large" style="opacity: 0" :src="model.cardThumbnailUrl() || '/'">

        <ActDetailsDialogContent :model="model" style="margin-top: -112px" />
    </dialog>
</template>