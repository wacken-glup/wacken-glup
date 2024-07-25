<script lang="ts">
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import SwiperCard from "@/components/swiper/SwiperCard.vue"

import { Swiper, SwiperSlide } from "swiper/vue"
import { Virtual } from "swiper/modules"
import 'swiper/css'

import delay from "delay"

export default {
    data() {
        return {
            loaded: false,
            openSwiperIntroductionDialog: true,

            swiper: undefined as any,
            modules: [ Virtual ],

            actualCurrentSlideIndex: 300,
            currentSlideIndex: 300,            
            eventsStack: [] as WoaEventModelWrapper[],

            rightSwipes: [] as WoaEventModelWrapper[],
            leftSwipeIds: [] as number[],

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
                this.$client.space?.self?.toggleSuggested(this.eventsStack[0].data.uid)
            }else{
                this.leftSwipeIds.push(this.eventsStack[0].data.uid)
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
            localStorage.setItem("leftSwipeIds", JSON.stringify(this.leftSwipeIds))
        }
    },
    mounted() {
        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)

            this.leftSwipeIds = JSON.parse(localStorage.getItem("leftSwipeIds") || "[]");
            console.info("left swipes", this.leftSwipeIds);
            
            let excludeIds = [ ... this.leftSwipeIds, ...this.$client.space!!.self!!.likes, ...this.$client.space!!.self!!.suggestions ]
            
            this.eventsStack = [ ...this.$client.container.events ]
            this.eventsStack = this.eventsStack.filter(e => !excludeIds.includes(e.data.uid))
            
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
    components: { Swiper, SwiperSlide, SwiperCard }
}
</script>

<template>
    <div style="width: 100%">
        <div class="absolute red swipe-indicator" :style="{ opacity: redOpacity }"></div>
        <div class="absolute green swipe-indicator right" :style="{ opacity: greenOpacity }"></div>
    </div>

    <main class="responsive max swiper-view-main" style="z-index: 1;">
        <div class="round row center-align middle-align" style="height: 100%">
            <div class="absolute">
                <template v-if="eventsStack.length == 0 && loaded">
                    <article class="medium middle-align center-align">
                        <div>
                            <i class="extra">check</i>
                            <h5>{{ $t("swiper.done.title") }}</h5>
                            <p v-if="rightSwipes.length > 0">{{ $tc("swiper.done.message", rightSwipes.length) }}</p>                        
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
                                    <SwiperCard class="swiper-card" :event="eventsStack[(n-1 == currentSlideIndex) ? 0 : 1]" />
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
            <button class="no-elevate" @click="openSwiperIntroductionDialog = false">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>
</template>

<style lang="scss">
@media only screen and (min-width: 601px) {
    .swiper-view-main {
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
    .swiper-view-main {
        .swiper-container {
            width: 90%; 
            height: 85vh;

            .swiper-card {
                height: 80vh;
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