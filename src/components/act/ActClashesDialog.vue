<script lang="ts">
import type WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"; 
import type { Clash } from "@/sdk/model/Clash"
import BigActCard from "@/components/act/BigActCard.vue"

export default {
    props: {
        open: Boolean
    },
    data() {
        return {
            clashes: [] = [] as Clash[],
            groupClashes: true
        }
    },
    methods: {
        render() {
            if(!this.$client.space?.self) {
                this.$emit("dismiss")
                return
            }

            const clashes: Clash[] = []

            this.$client.container.eventsByDayUid.value.forEach(events => {
                var relevantEvents: WoaEventModelWrapper[] = []
                if(this.groupClashes) {
                    relevantEvents = events.filter(e => (e.likerIds.length > 0 || e.suggestorIds.length > 0))
                }else{
                    relevantEvents = events.filter(e => (this.$client.space?.self?.isSuggested(e.uid) || this.$client.space?.self?.isSuggested(e.uid)))
                }

                const alreadyFound: string[] = []
                relevantEvents.forEach(event => {
                    if(alreadyFound.includes(event.uid)) return

                    let currentClash = []
                    relevantEvents.forEach(otherEvent => {
                        if(event.uid == otherEvent.uid) return
                        if(alreadyFound.includes(otherEvent.uid)) return

                        if(event.start >= otherEvent.start) {
                            if(event.start <= otherEvent.end) {
                                currentClash.push(otherEvent)
                            }
                        }else if(event.start <= otherEvent.start) {
                            if(event.end >= otherEvent.start) {
                                currentClash.push(otherEvent)
                            }
                        }
                    })

                    if(currentClash.length > 0) {
                        currentClash.push(event)
                        clashes.push({
                            day: event.data.festivalday.title,
                            events: currentClash
                        })

                        currentClash.forEach(event => {
                            alreadyFound.push(event.uid)
                        })
                    }
                })
            })

            this.clashes = clashes
        }
    },
    watch: {
        open() {
            this.groupClashes = localStorage.getItem("groupClashes") != "false"
            this.render()
        },
        groupClashes() {
            localStorage.setItem("groupClashes", this.groupClashes+"")
            this.render()
        }
    },
    emits: [ "dismiss" ],
    components: { BigActCard }
}
</script>

<template>
    <div class="overlay" :class="{ active: open }" @click="$emit('dismiss')"></div>

    <dialog :class="{ active: open }" class="max-s">
        <header class="blur" style="border-radius: 1.75rem; position: sticky; top: 0; z-index: 100;">
            <nav>
                <div class="small-space"></div>

                <button class="circle transparent" @click="$emit('dismiss')">
                   <i>close</i>
                </button>

                <h5 class="max">{{ $t("common.clashes") }}</h5>
            </nav>
        </header>

        <div class="field prefix middle-align" @click="groupClashes = !groupClashes">
            <nav>
                <i>group</i>

                <div class="max">
                    <h6>{{ $t("clashes.groupClashes.label") }}</h6>
                    <div>{{ $t("clashes.groupClashes.description") }}</div>
                </div>
                
                <label class="switch">
                    <input type="checkbox" v-model="groupClashes" @click="groupClashes = !groupClashes">
                    <span></span>
                </label>
            </nav>
        </div>

        <p style="text-align: center;">{{ $t("clashes.numberOfClashes") }} <b>{{ clashes.length }}</b></p>

        <div v-for="(clash, index) in clashes">
            <article class="round">
                <nav>
                    <h5 class="max link">#{{ index+1 }}</h5>
                    <h5>{{ clash.day }}</h5>
                </nav>
                
                <div class="grid">
                    <div v-for="model in clash.events" class="s12 m6 l6">
                        <BigActCard
                            :model="model">
                        </BigActCard>
                    </div>
                </div>
            </article>

            <br />
        </div>
    </dialog>
</template>