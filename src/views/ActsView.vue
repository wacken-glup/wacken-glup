<script lang="ts">
import AppBar from "@/components/AppBar.vue"
import BigActCard from "@/components/act/BigActCard.vue"

import delay from "delay"
import Fuse from "fuse.js"

import BaseCardDataModel from "@/sdk/model/BaseCardDataModel"
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

export default {
    data() {
        return {
            query: "",
            queryTimeout: 0,

            queryResults: undefined as BaseCardDataModel[] | undefined,
            resultsShown: 10,

            onlyConcerts: false,
            sortTime: false
        }
    },
    methods: {
        processQuery() {
            if(this.query.length < 2) {
                this.queryResults = [ ... this.$client.container.combinedActs ]
                if(this.sortTime) this.sortQueryResultsAfterTime()
                return
            }

            const fuse = new Fuse(this.$client.container.combinedActs, { keys: [ "_cardTitle" ], includeScore: true })
            
            this.queryResults = []
            for(let obj of fuse.search(this.query)) {
                if((obj.score || 0) > 0.5) continue
                this.queryResults.push(obj.item as any)
            }

            if(this.sortTime) this.sortQueryResultsAfterTime()
        },
        sortQueryResultsAfterTime() {
            let unixS = new Date().getTime() / 1000

            this.queryResults = this.queryResults?.filter(m => (m instanceof WoaEventModelWrapper) ? m.end > unixS : true)
            this.queryResults?.sort((a,b) => (a instanceof WoaEventModelWrapper && b instanceof WoaEventModelWrapper) ? a.start - b.start : 0)
        },
        async showMore() {
            if(this.resultsShown > (this.queryResults?.length || Infinity)) return
            this.resultsShown = this.resultsShown + 10
            
            await delay(50)
            this.mountObserver()
        },
        async mountObserver() {
            while(true) {
                await delay(50)
                if(this.$refs["grid-end"] === undefined) continue

                let end = (this.$refs["grid-end"] as any)[0]
                const observer = new IntersectionObserver((entries) => {
                    let entry = entries[0]
                    if(entry.isIntersecting) this.showMore()
                })

                observer.observe(end)
                break
            }
        }
    },
    mounted() {
        this.processQuery()

        this.mountObserver()
    },
    watch: {
        query() {
            clearTimeout(this.queryTimeout)

            this.queryTimeout = setTimeout(() => {
                this.processQuery()
            }, 1000)
        },
        sortTime() {
            this.processQuery()
        }
    },
    components: { AppBar, BigActCard }
}
</script>

<template>
    <AppBar :label="$t('navigation.acts')">
        <template v-slot:prepend>
            <button class="circle transparent" @click="$router.push('/swiper')">
                <i>swipe</i>
            </button>
        </template>
    </AppBar>

    <main class="responsive max">
        <div class="field large prefix round fill">
            <i class="front">search</i>
            <input class="search" :placeholder="$t('acts.search.placeholder')" v-model="query">
        </div>

        <div class="field prefix middle-align" @click="onlyConcerts = !onlyConcerts">
            <nav>
                <i>headphones</i>

                <div class="max">
                    <h6>{{ $t("acts.filter.onlyConcerts.label") }}</h6>
                    <div>{{ $t("acts.filter.onlyConcerts.description") }}</div>
                </div>
                
                <label class="switch">
                    <input type="checkbox" v-model="onlyConcerts" @click="onlyConcerts = !onlyConcerts">
                    <span></span>
                </label>
            </nav>
        </div>

        <div class="field prefix middle-align" @click="sortTime = !sortTime">
            <nav>
                <i>schedule</i>

                <div class="max">
                    <h6>{{ $t("acts.filter.sortTime.label") }}</h6>
                    <div>{{ $t("acts.filter.sortTime.description") }}</div>
                </div>
                
                <label class="switch">
                    <input type="checkbox" v-model="sortTime" @click="sortTime = !sortTime">
                    <span></span>
                </label>
            </nav>
        </div>

        <div class="flex right-align">
            <span style="margin-right: 16px">{{ $tc("acts.results", queryResults?.length || 0) }}</span>
        </div>

        <div class="grid">
            <template v-for="index in queryResults?.length">
                <template v-if="index < resultsShown">
                    <div v-if="!onlyConcerts || queryResults!![index-1]!!.isConcert()" class="s12 m6 l4">
                        <BigActCard :model="queryResults!![index-1]!!" />
                    </div>

                    <span v-if="index == resultsShown - 4" ref="grid-end"></span>
                </template>
            </template>
        </div>
    </main>
</template>

<style>
.search::placeholder {
    color: var(--on-surface)
}
</style>