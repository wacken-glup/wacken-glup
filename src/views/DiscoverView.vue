<script lang="ts">
import AppBar from "@/components/AppBar.vue"
import SwiperCard from "@/components/swiper/SwiperCard.vue"

import BaseCardDataModel from "@/sdk/model/BaseCardDataModel"
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"
import type WoaBandModelWrapper from "@/sdk/model/WoaBandModelWrapper";
    
import { Swiper, SwiperSlide } from "swiper/vue"
import { Virtual } from "swiper/modules"
import 'swiper/css'

import delay from "delay"

export default {
    data() {
        return {
            loaded: false,
            openSwiperIntroductionDialog: false,
            openSwiperResetDialog: false,

            swiper: undefined as any,
            modules: [ Virtual ],

            actualCurrentSlideIndex: 300,
            currentSlideIndex: 300,            
            eventsStack: [] as BaseCardDataModel[],

            totalSize: 0,

            rightSwipes: [] as BaseCardDataModel[],
            leftSwipeIds: [] as string[],

            redOpacity: 0,
            greenOpacity: 0
        }
    },
    methods: {
        setSwiper(swiper: any) {
            this.swiper = swiper
            swiper.slideTo(this.currentSlideIndex, 0)
        },
        onActualSlideChange(newIndex: number) {
            this.swiper.disable()

            let swipedRight = newIndex < this.currentSlideIndex
            if(swipedRight) {
                console.info("added right swipe")

                this.rightSwipes.push(this.eventsStack[0])
                this.$client.space?.self?.toggleSuggested(this.eventsStack[0].uid)
            }else{
                this.leftSwipeIds.push(this.eventsStack[0].uid)
                this.updateLeftSwipes()
            }

            setTimeout(() => {
                this.eventsStack.shift()

                if(this.eventsStack.length == 0) {
                    this.swiper.remove()
                    console.info("destroy swiper");
                }else{
                    this.currentSlideIndex = newIndex
                    this.swiper.enable()
                }
            }, 50);
        },
        updateLeftSwipes() {
            if(this.$client.space?.self === undefined) return
            this.$client.space.self.changeLeftSwipeIds(this.leftSwipeIds)
        },
        resetLeftSwipes() {
            if(this.$client.space?.self === undefined) return
            this.$client.space.self.changeLeftSwipeIds([])

            setTimeout(() => {
                window.location.reload()
            }, 500)
        },
        dismissIntroduction() {
            this.openSwiperIntroductionDialog = false
            localStorage.setItem("discover.introducedSwiper", "true")
        },
        // fetches events from bands if available
        _convertBandIdsToEventIdsWhenAvailable(actId: string) {
            if(!actId.startsWith(`y${ this.$client.container.festival.value?.uid }-band`)) return [actId]

            let band = (this.$client.container.actByUidNonRef.get(actId) as (WoaBandModelWrapper | undefined))?.data
            if(band == undefined || band.artist.events.length == 0) return [actId]

            let eventIds = []
            for(let artistEvent of band.artist.events) {
                let eventActId = `y${ this.$client.container.festival.value?.uid }-event-${ artistEvent.uid }`

                let eventAct = this.$client.container.actByUidNonRef.get(eventActId)
                if(eventAct?.uid == undefined) return [actId]

                eventIds.push(eventAct.uid)
            }

            return eventIds
        }
    },
    mounted() {
        this.openSwiperIntroductionDialog = !(localStorage.getItem("discover.introducedSwiper"));

        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)

            if(this.$client.space?.self === undefined) return

            this.leftSwipeIds = JSON.parse(JSON.stringify(this.$client.space.self.leftSwipeIds));
            console.info("left swipes", this.leftSwipeIds);

            let leftSwipeEventIds = this.leftSwipeIds.flatMap(actId => {
                return this._convertBandIdsToEventIdsWhenAvailable(actId)  
            })
            
            let excludeIds = [ ...leftSwipeEventIds, ...this.leftSwipeIds, ...this.$client.space!!.self!!.likes, ...this.$client.space!!.self!!.suggestions ]
            

            this.eventsStack = [ ...this.$client.container.combinedActs.filter(a => a.isConcert()) ]
            this.totalSize = this.eventsStack.length
            this.eventsStack = this.eventsStack.filter(e => !excludeIds.includes(e.uid))

            let unixS = new Date().getTime() / 1000
            this.eventsStack = this.eventsStack.filter(e => (e instanceof WoaEventModelWrapper) ? e.end > unixS : true)
            this.eventsStack.sort((a,b) => (a instanceof WoaEventModelWrapper && b instanceof WoaEventModelWrapper) ? a.start - b.start : 0)
            
            this.loaded = true
        })()  
    },
    watch: {
        "swiper.animating"() {
            if(this.swiper.animating) return

            if(this.redOpacity != 0) this.redOpacity = 0
            if(this.greenOpacity != 0) this.greenOpacity = 0

            if(this.actualCurrentSlideIndex == this.swiper.activeIndex) return

            this.actualCurrentSlideIndex = this.swiper.activeIndex
            this.onActualSlideChange(this.swiper.activeIndex)
        },
        "swiper.translate"() {
            let totalWidth = (this.swiper.width + 50)
            let offset = this.swiper.translate % totalWidth

            if(offset != 0) {
                this.redOpacity = (this.swiper.swipeDirection != "prev") ? 1 : 0
                this.greenOpacity = (this.swiper.swipeDirection != "next") ? 1 : 0
            }
        }
    },
    components: { AppBar, Swiper, SwiperSlide, SwiperCard }
}
</script>

<template>
    <div style="width: 100%">
        <div class="fixed red swipe-indicator" :style="{ opacity: redOpacity }"></div>
        <div class="fixed green swipe-indicator right" :style="{ opacity: greenOpacity }"></div>
    </div>

    <AppBar :label="$t('navigation.discover')" />

    <main class="responsive max discover-view-main" style="z-index: 1;">
        <p v-if="totalSize != 0" class="center-align"><b>{{ totalSize - eventsStack.length }} / {{ totalSize }}</b></p>

        <div class="round row center-align middle-align" style="height: 100%">
            <div class="absolute">
                <template v-if="eventsStack.length == 0 && loaded">
                    <article class="medium middle-align center-align">
                        <div>
                            <i class="extra">check</i>
                            <h5>{{ $t("swiper.done.title") }}</h5>
                            <p v-if="rightSwipes.length > 0">{{ $tc("swiper.done.message", rightSwipes.length) }}</p>      
                        
                            <div class="space"></div>
        
                            <nav class="center-align">
                                <button @click="openSwiperResetDialog = true">{{ $t("swiper.done.resetLeftSwipes") }}</button>
                            </nav>
                        </div>
                    </article>
                </template>
            </div>

            <div class="swiper-container" v-if="eventsStack.length != 0" ref="swipe-container">
                <Swiper :slides-per-view="1" :space-between="50" :modules="modules" :virtual="true" :navigation="true"
                    @swiper="setSwiper">

                    <template v-for="n in 600">
                        <SwiperSlide :virtual-index="n - 1">
                            <template v-if="eventsStack.length > 0 && n-1 > currentSlideIndex-2 && n-1 < currentSlideIndex+2">
                                <div class="round surface-container padding">
                                    <SwiperCard class="swiper-card" :model="eventsStack[(n-1 == currentSlideIndex) ? 0 : 1]" />
                                </div>
                            </template>
                        </SwiperSlide>
                    </template>
                </Swiper>
            </div>
        </div>
    </main>

    <div class="overlay" :class="{ active: openSwiperIntroductionDialog }" @click="openSwiperIntroductionDialog = false"></div>

    <dialog :class="{ active: openSwiperIntroductionDialog }">
        <h5>{{ $t("swiper.dialog.introduction.title") }}</h5>
        <div>{{ $t("swiper.dialog.introduction.message") }}</div>
        
        <div class="space"></div>

        <nav class="right-align no-space">
            <button class="no-elevate" @click="dismissIntroduction()">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>

    <dialog class="error" :class="{ active: openSwiperResetDialog }">
        <h5>{{ $t("swiper.dialog.reset.title") }}</h5>
        <div>{{ $t("swiper.dialog.reset.message") }}</div>
        
        <nav class="right-align no-space">
            <button class="error transparent" @click="openSwiperResetDialog = false">
                {{ $t("common.abort") }}
            </button>
            
            <div class="space"></div>

            <button class="error-container no-elevate" @click="openSwiperResetDialog = false; resetLeftSwipes();">
                {{ $t("common.confirm") }}
            </button>
        </nav>
    </dialog>
</template>

<style lang="scss">
@media only screen and (min-width: 601px) {
    .discover-view-main {
        .swiper-container {
            width: 50vw; 
            height: 50vh;

            .swiper-card {
                height: 50vh;
            }
        }
    }
}

@media only screen and (max-width: 601px) {
    .discover-view-main {
        width: 100%;

        .swiper-container {
            width: 90%; 
            height: 90%;

            .swiper-card {
                max-height: 65vh;
            }
        }
    }
}

.swipe-indicator.right {
    right: 0; 
}

.swipe-indicator {
    top: 0;

    width: 50%; 
    height: 100vh;

    transition: opacity .5s;
}
</style>
