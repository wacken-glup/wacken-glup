<script lang="ts">
import EventCard from "@/components/event/EventCard.vue"

import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import delay from "delay"

type ChartEntry = {
    index: number,
    entry: WoaEventModelWrapper
}

export default {
    data() {
        return {
            entries: [] as ChartEntry[]
        }
    },
    methods: {
        render() {
            let eventIdWeightMap = new Map<number, number>()
            for(let member of (this.$client.space?.members || [])) {
                for(let likeId of member.likes) {
                    eventIdWeightMap.set(likeId, (eventIdWeightMap.get(likeId) || 0) + 2)
                }

                for(let suggestId of member.suggestions) {
                    eventIdWeightMap.set(suggestId, (eventIdWeightMap.get(suggestId) || 0) + 1)
                }
            }

            let eventIds = []
            eventIds.push(... eventIdWeightMap.keys())
            eventIds.sort((a,b) => { return (eventIdWeightMap.get(b) || 0) - (eventIdWeightMap.get(a) || 0) })

            this.entries = []
            let index = 0
            for(let eventId of eventIds) {
                this.entries.push({
                    index: index,
                    entry: this.$client.container.eventByUid.value.get(eventId) as any
                })

                index ++
            }
        },
        check() {
            if(!this.$route.query.dialogMemberCharts) return
            
            (async() => {
                while(this.$client.space?.loaded != true) await delay(50)
                this.render()
            })()
        }
    },
    mounted() {
        this.check()
    },
    watch: {
        $route() {
            this.check()
        }
    },
    components: { EventCard }
}
</script>

<template>
    <div class="overlay" :class="{ active: $route.query.dialogMemberCharts }" @click="$router.back()"></div>

    <dialog :class="{ active: $route.query.dialogMemberCharts }" class="max-s no-padding">
        <header class="surface-container fixed" style="padding: 0 1rem">
            <nav>
                <button class="circle transparent" @click="$router.back()">
                   <i>close</i>
                </button>

                <h5 class="max">{{ $t("members.dialog.charts.title") }}</h5>
            </nav>
        </header>

        <div class="padding">
            <div class="space"></div>

            <template v-for="entry of entries">
                <EventCard :event="entry.entry">
                    <h6>{{ entry.index + 1 }}.</h6>
                </EventCard>
            </template>
        </div>
    </dialog>
</template>