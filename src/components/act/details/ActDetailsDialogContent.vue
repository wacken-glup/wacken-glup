<script lang="ts">
import type { PropType } from 'vue'

import BaseCardDataModel from "@/sdk/model/BaseCardDataModel"
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"
import WoaBandModelWrapper from "@/sdk/model/WoaBandModelWrapper"

import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        model: {
            type: Object as PropType<BaseCardDataModel>,
            required: true
        },
        lockSpotify: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            WoaEventModelWrapper,

            spotifyController: undefined as any,
            spotifyEmbedHtml: "",

            showSpotifyUnlock: false,
            spotifyLocked: true,
            
            smallScreen: false
        }  
    },
    methods: {
        update() {
            this.showSpotifyUnlock = false
            this.spotifyLocked = true

            this.smallScreen = window.matchMedia && window.matchMedia?.("screen and (max-width: 994px)")?.matches

            this.spotifyController?.destroy?.()

            /* rerender spotify embed container */
            this.spotifyEmbedHtml = ""
            setTimeout(() => {
                let id = crypto.randomUUID()
                this.spotifyEmbedHtml = `<div id="spotify-${ id }"></div>`

                setTimeout(() => {
                    /* implement spotify widget */
                    try {
                        let artistUri = ""
                        let albumUri = ""

                        if(this.model instanceof WoaEventModelWrapper) {
                            artistUri = this.model.data.artists[0]?.assets[0].spotifyartist
                            albumUri = this.model.data.artists[0]?.assets[0].spotifyalbum
                        }else if(this.model instanceof WoaBandModelWrapper) {
                            artistUri = this.model.data.spotifyartist
                            albumUri = this.model.data.spotifyalbum
                        }

                        if(artistUri.length > 2 || albumUri.length > 2) {
                            (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
                                const options = {
                                    uri: `spotify:${ (albumUri.length > 2) ? `album:${ albumUri }` : `artist:${ artistUri }` }`,
                                    height: (this.smallScreen) ? undefined : 180
                                };

                                IFrameAPI.createController(document.querySelector(`#spotify-${ id }`), options, (controller: any) => {
                                    this.spotifyController = controller
                                });

                                if(this.lockSpotify) {
                                    this.showSpotifyUnlock = true
                                    this.spotifyLocked = true
                                }
                            };
                        }
                    }catch(e) {
                        console.error(e)
                    }
                }, 50)
            }, 10)
        }
    },
    mounted() {
        this.update()  
    },
    watch: {
        model() {
            this.update()
        }
    },
    components: { EventDetailsChips }
}
</script>

<template>
    <article class="no-padding">
        <div class="padding" style="padding-bottom: 0 !important">
            <h5>
                {{ model.cardTitle() }}
            </h5>
        </div>

        <template v-if="(model instanceof WoaEventModelWrapper)">
            <EventDetailsChips :event="model"></EventDetailsChips>
        </template>

        <div class="space"></div>

        <template v-if="model.likerIds.length > 0">
            <div class="padding">
                <div class="middle-align">
                    <i class="fill">favorite</i>

                    <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.liked") }}</h6>
                </div>

                <div class="space"></div>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
                    <template v-for="memberId of model.likerIds">
                        <a class="chip no-border" :class="[ `${ $client.container.spaceMemberById.get(memberId)?.color }4` ]" :style="{ margin: 0, color: 'black' }">{{ $client.container.spaceMemberById.get(memberId)?.name }}</a>
                    </template>
                </div>
            </div>

            <div class="space"></div>
        </template>

        <template v-if="model.suggestorIds.length > 0">
            <div class="padding">
                <div class="middle-align">
                    <i class="fill">thumb_up</i>

                    <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.recommended") }}</h6>
                </div>

                <div class="space"></div>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
                    <template v-for="memberId of model.suggestorIds">
                        <a class="chip no-border" :class="[ `${ $client.container.spaceMemberById.get(memberId)?.color }4` ]" :style="{ margin: 0, color: 'black' }">{{ $client.container.spaceMemberById.get(memberId)?.name }}</a>
                    </template>
                </div>
            </div>

            <div class="space"></div>
        </template>

        <div class="padding">
            <div style="width: 100%" v-if="showSpotifyUnlock && spotifyLocked">
                <div class="absolute spotify-unlocker" :class="{ small: !smallScreen }" @click="spotifyLocked = false"></div>
            </div>
            
            <div v-html="spotifyEmbedHtml">

            </div>

            <div v-html="model.cardDescription()">

            </div>
        </div>
    </article>
</template>

<style lang="scss">
.spotify-unlocker {
    z-index: 10; 
    
    width: 100%; 
    height: 352px;

    opacity: 0.5;
    background-color: black;

    &.small {
        height: 152px !important;
    }
}
</style>