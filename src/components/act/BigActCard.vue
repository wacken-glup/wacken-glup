<script lang="ts">
import type { PropType } from 'vue'
import { removeHTMLTags } from "@/Utils"

import BaseCardDataModel from "@/sdk/model/BaseCardDataModel"
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    data() {
        return {
            WoaEventModelWrapper
        }
    },
    props: {
        model: {
            type: Object as PropType<BaseCardDataModel>,
            required: true
        },
        notLazy: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        removeHTMLTags(str: string) {
            return removeHTMLTags(str)
        },
        openDialog() {
            this.$router.push({
                query: {
                    details: this.model.uid
                }
            })
        },
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
    components: { EventDetailsChips }
}
</script>

<template>
    <article v-if="model != undefined" class="no-padding" 
        :class="[ 
            ($client.space?.self?.isLiked(model.uid)) ? 'primary' 
                : (model.likerIds.length > 0 || model.suggestorIds.length > 0) ? 'secondary'
                : ''
        ]">
    
        <div class="absolute top right right padding white-text" style="z-index: 10">
            <button class="blur circle" @click="toggleSuggested()">
                <i :class="{ fill: $client.space?.self?.isSuggested(model.uid), 'primary-text': $client.space?.self?.isSuggested(model.uid) }">thumb_up</i>
            </button>

            <button class="blur circle" @click="toggleLike()">
                <i :class="{ fill: $client.space?.self?.isLiked(model.uid), 'primary-text': $client.space?.self?.isLiked(model.uid) }">favorite</i>
            </button>
        </div>

        <div @click="openDialog()" class="wave wave-big" style="cursor: pointer">
            <div>
                <img v-if="!notLazy" class="responsive large" v-lazy="{ src: model.cardThumbnailUrl() }">
                <img v-if="notLazy" class="responsive large" :src="model.cardThumbnailUrl()">

                <div v-if="model.suggestorIds.length > 0" class="absolute bottom left padding white-text rounded" style="z-index: 10; max-width: 50%; overflow: hidden">
                    <div class="blur small-padding" style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden;">
                        <template v-for="suggestorId of model.suggestorIds">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(suggestorId)?.color }-text` ]">
                                thumb_up
                            </i>
                        </template>
                    </div>
                </div>

                <div v-if="model.likerIds.length > 0" class="absolute bottom right padding white-text rounded" style="z-index: 10; max-width: 50%; overflow: hidden">
                    <div class="blur small-padding" style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden;">
                        <template v-for="likerId of model.likerIds">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(likerId)?.color }-text` ]">
                                favorite
                            </i>
                        </template>
                    </div>
                </div>
            </div>

            <div class="padding" style="padding-bottom: 0 !important">
                <h5 style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 3.6em; line-height: 1.2em;">
                    {{ model.cardTitle() }}
                </h5>
            </div>

            <template v-if="(model instanceof WoaEventModelWrapper)">
                <EventDetailsChips :event="model"></EventDetailsChips>
            </template>

            <div class="padding">
                <p style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 5em; line-height: 1.8em;">
                    {{ removeHTMLTags(model.cardDescription()) }}
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