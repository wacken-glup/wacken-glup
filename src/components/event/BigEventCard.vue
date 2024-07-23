<script lang="ts">
import type { PropType } from 'vue'
import { removeHTMLTags } from "@/Utils"

import WoaEventModelWrapper from "../../sdk/model/WoaEventModelWrapper"

import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        }
    },
    methods: {
        removeHTMLTags(str: string) {
            return removeHTMLTags(str)
        },
        openDialog() {
            this.$router.push({
                query: {
                    details: this.event.data.uid
                }
            })
        },
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
    components: { EventDetailsChips }
}
</script>

<template>
    <article v-if="event != undefined" class="no-padding" :class="{ secondary: event.likerIds.length > 0 || event.suggestorIds.length > 0 }">
        <div class="absolute top right right padding white-text" style="z-index: 10">
            <button class="blur circle" @click="toggleSuggested()">
                <i :class="{ fill: $client.space?.self?.isSuggested(event.data.uid), 'primary-text': $client.space?.self?.isSuggested(event.data.uid) }">thumb_up</i>
            </button>

            <button class="blur circle" @click="toggleLike()">
                <i :class="{ fill: $client.space?.self?.isLiked(event.data.uid), 'primary-text': $client.space?.self?.isLiked(event.data.uid) }">favorite</i>
            </button>
        </div>

        <div @click="openDialog()" class="wave wave-big" style="cursor: pointer">
            <div>
                <img class="responsive large" v-lazy="{ src: event.cardThumbnailUrl() }">

                <div v-if="event.suggestorIds.length > 0" class="absolute bottom left padding white-text rounded" style="z-index: 10; max-width: 50%; overflow: hidden">
                    <div class="blur small-padding" style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden;">
                        <template v-for="suggestorId of event.suggestorIds">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(suggestorId)?.color }-text` ]">
                                thumb_up
                            </i>
                        </template>
                    </div>
                </div>

                <div v-if="event.likerIds.length > 0" class="absolute bottom right padding white-text rounded" style="z-index: 10; max-width: 50%; overflow: hidden">
                    <div class="blur small-padding" style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden;">
                        <template v-for="likerId of event.likerIds">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(likerId)?.color }-text` ]">
                                favorite
                            </i>
                        </template>
                    </div>
                </div>
            </div>

            <div class="padding" style="padding-bottom: 0 !important">
                <h5 style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 3.6em; line-height: 1.2em;">
                    {{ event.cardTitle() }}
                </h5>
            </div>

            <EventDetailsChips :event="event"></EventDetailsChips>

            <div class="padding">
                <p style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 5em; line-height: 1.8em;">
                    {{ removeHTMLTags(event.cardDescription()) }}
                </p>
            </div>
        </div>
    </article>
</template>

<style>
:is(.wave-big):is(:focus-visible, :hover)::after {
    background-size: 30000% !important;
}
</style>