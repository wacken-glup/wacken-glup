<script lang="ts">
import type { PropType } from 'vue'

import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        },
        lockSpotify: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            spotifyController: undefined as any,
            spotifyEmbedHtml: "",

            showSpotifyUnlock: false,
            spotifyLocked: true
        }  
    },
    methods: {
        update() {
            this.showSpotifyUnlock = false
            this.spotifyLocked = true

            let smallScreen = window.matchMedia && window.matchMedia?.("screen and (max-width: 994px)")?.matches

            this.spotifyController?.destroy?.()

            /* rerender spotify embed container */
            this.spotifyEmbedHtml = ""
            setTimeout(() => {
                let id = crypto.randomUUID()
                this.spotifyEmbedHtml = `<div id="event-details-spotify-widget-${ id }"></div>`

                /* implement spotify widget */
                try {
                    let artistUri = this.event.data.artists[0]?.assets[0].spotifyartist;
                    let albumUri = this.event.data.artists[0]?.assets[0].spotifyalbum;

                    if(artistUri.length > 2 || albumUri.length > 2) {
                        (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
                            const options = {
                                uri: `spotify:${ (albumUri.length > 2) ? `album:${ albumUri }` : `artist:${ artistUri }` }`,
                                height: (smallScreen) ? undefined : 180
                            };

                            IFrameAPI.createController(document.querySelector(`#event-details-spotify-widget-${ id }`), options, (controller: any) => {
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
            }, 1)
        }
    },
    mounted() {
        this.update()  
    },
    watch: {
        event() {
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
                {{ event.cardTitle() }}
            </h5>
        </div>

        <EventDetailsChips :event="event"></EventDetailsChips>

        <div class="space"></div>

        <template v-if="($client.space?.getLikersForId(event.data.uid).length || 0) > 0">
            <div class="padding">
                <div class="middle-align">
                    <i class="fill">favorite</i>

                    <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.liked") }}</h6>
                </div>

                <div class="space"></div>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
                    <template v-for="member of $client.space?.getLikersForId(event.data.uid)">
                        <a class="chip no-border" :class="[ `${ member.color }4` ]" :style="{ margin: 0, color: 'black' }">{{ member.name }}</a>
                    </template>
                </div>
            </div>

            <div class="space"></div>
        </template>

        <template v-if="($client.space?.getSuggestorsForId(event.data.uid).length || 0) > 0">
            <div class="padding">
                <div class="middle-align">
                    <i class="fill">thumb_up</i>

                    <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.recommended") }}</h6>
                </div>

                <div class="space"></div>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
                    <template v-for="member of $client.space?.getSuggestorsForId(event.data.uid)">
                        <a class="chip no-border" :class="[ `${ member.color }4` ]" :style="{ margin: 0, color: 'black' }">{{ member.name }}</a>
                    </template>
                </div>
            </div>

            <div class="space"></div>
        </template>

        <div class="padding">
            <div style="width: 100%" v-if="showSpotifyUnlock && spotifyLocked">
                <div class="absolute spotify-unlocker" @click="spotifyLocked = false"></div>
            </div>
            
            <div v-html="spotifyEmbedHtml">

            </div>

            <div v-html="event.cardDescription()">

            </div>
        </div>
    </article>
</template>

<style>
.spotify-unlocker {
    z-index: 10; 
    
    width: 100%; 
    height: 352px;

    opacity: 0.5;
    background-color: black;
}
</style>