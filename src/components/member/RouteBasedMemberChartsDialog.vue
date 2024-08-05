<script lang="ts">
import ActCard from "@/components/act/ActCard.vue"

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
            let actIdWeightMap = new Map<string, number>()
            for(let member of (this.$client.space?.members || [])) {
                for(let likeId of member.likes) {
                    actIdWeightMap.set(likeId, (actIdWeightMap.get(likeId) || 0) + 2)
                }

                for(let suggestId of member.suggestions) {
                    actIdWeightMap.set(suggestId, (actIdWeightMap.get(suggestId) || 0) + 1)
                }
            }

            let eventIds = []
            eventIds.push(... actIdWeightMap.keys())
            eventIds.sort((a,b) => { return (actIdWeightMap.get(b) || 0) - (actIdWeightMap.get(a) || 0) })

            this.entries = []
            let index = 0
            for(let eventId of eventIds) {
                this.entries.push({
                    index: index,
                    entry: this.$client.container.actByUid.value.get(eventId) as any
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
    components: { ActCard }
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
                <ActCard :model="entry.entry">
                    <h6>{{ entry.index + 1 }}.</h6>
                </ActCard>
            </template>
        </div>
    </dialog>
</template>