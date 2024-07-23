<script lang="ts">
import type { PropType } from 'vue'

import WoaEventModelWrapper from "../../sdk/model/WoaEventModelWrapper"

import EventDetailsChips from "@/components/event/EventDetailsChips.vue"

export default {
    props: {
        open: Boolean,
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: true
        }
    },
    data() {
        return {
            spotifyController: undefined as any,
            spotifyEmbedHtml: ""
        }  
    },
    methods: {
        update() {
            let smallScreen = window.matchMedia && window.matchMedia?.("screen and (max-width: 994px)")?.matches

            this.spotifyController?.destroy?.()

            /* rerender spotify embed container */
            this.spotifyEmbedHtml = ""
            setTimeout(() => {
                this.spotifyEmbedHtml = `<div id="event-details-dialog-spotify-widget"></div>`

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

                            IFrameAPI.createController(document.querySelector("#event-details-dialog-spotify-widget"), options, (controller: any) => {
                                this.spotifyController = controller
                            });
                        };
                    }
                }catch(e) {
                    console.error(e)
                }
            }, 1)

            console.info("now showing dialog", this.event.data)
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
    mounted() {
        this.update()  
    },
    watch: {
        event() {
            this.update()
        }
    },
    emits: [ "dismiss" ],
    components: { EventDetailsChips }
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

        <article class="no-padding" style="margin-top: -112px">
            
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
                <div v-html="spotifyEmbedHtml">

                </div>

                <div v-html="event.cardDescription()">

                </div>
            </div>
        </article>
    </dialog>
</template>