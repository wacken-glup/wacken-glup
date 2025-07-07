<script lang="ts">
import type { PropType } from "vue"

import type { WoaFestivalDay } from "@/sdk/model/WoaModels"
import WoaEventModelWrapper from "@/sdk/model/WoaEventModelWrapper"

import ActCard from "@/components/act/ActCard.vue"

type Column = {
    startOffset: number,
    label: String,
    eventEntryByRow: (WoaEventModelWrapper | null)[]
}

export default {
    props: {
        filterStages: {
            type: Object as PropType<number[]>,
            default: []
        }
    },
    data() {
        return {
            currentSec: 0,

            selectedDay: undefined as WoaFestivalDay | undefined,
            highlightedEventId: "",

            columns: [] as Column[],
            timeCells: [] as number[],

            dateWasChosen: false,

            menuActive: false
        }
    },
    methods: {
        selectDay(day: WoaFestivalDay) {
            this.selectedDay = day
            this.dateWasChosen = true

            ui("#events-table-day-selector")
        },
        render() {
            let timeCells: number[] = []

            for(let event of this.$client.container.events) {
                if(event.data.festivalday.uid !== this.selectedDay?.uid) continue
                if(event.end < this.currentSec && !this.dateWasChosen) continue

                if(!timeCells.includes(event.start)) timeCells.push(event.start)
                if(!timeCells.includes(event.end)) timeCells.push(event.end)
            } 

            timeCells.sort()

            this.timeCells = timeCells
            this.columns = []

            for(let stage of this.$client.container.stages.value) {
                if(this.filterStages.includes(stage.uid)) continue

                let column: Column = {
                    startOffset: 0,
                    label: stage.title,
                    eventEntryByRow: []
                }

                let events = this.$client.container.eventsByStageUid.value.get(stage.uid)
                if(events === undefined) continue
                
                events.sort((a,b) => { return a.start - b.start })

                let eventByStartTime = new Map<number, WoaEventModelWrapper>()
                for(let event of events) eventByStartTime.set(event.start, event)

                let eventByDuringTime = new Map<number, WoaEventModelWrapper>()

                let currentEvent: WoaEventModelWrapper | undefined = undefined
                for(let time of timeCells) {
                    /* add beginning event */
                    if(eventByStartTime.has(time)) {
                        currentEvent = eventByStartTime.get(time)!!
                        currentEvent.columnSpan = 0
                    }

                    /* remove currentEvent if ending */
                    if(currentEvent != undefined && currentEvent.end == time) 
                        currentEvent = undefined

                    if(currentEvent != undefined) {
                        currentEvent.columnSpan ++
                        eventByDuringTime.set(time, currentEvent)
                    }
                }

                let includesEvents = false
                for(let time of timeCells) {
                    if(eventByStartTime.has(time)) {
                        column.eventEntryByRow.push(eventByStartTime.get(time)!!)
                        includesEvents = true
                    }else if(!eventByDuringTime.has(time)) {
                        column.eventEntryByRow.push(null)
                    }
                }

                if(includesEvents) this.columns.push(column)
            }
        }
    },
    mounted() {
        let date = new Date()
        this.currentSec = date.getTime() / 1000

        if(this.$route.query.eventId || this.$route.query.dayId) {
            let festivalDayId = ( (this.$route.query.eventId) ? () => {
                let event = this.$client.container.eventByUid.value.get(this.$route.query.eventId+"")
                return event?.data.festivalday.uid
            } : () => {
                return parseInt(this.$route.query.dayId?.toString() || "")
            } )()

            this.selectedDay = this.$client.container.days.value.find(d => d.uid == festivalDayId)
            
            if(this.$route.query.eventId) {
                let event = this.$client.container.eventByUid.value.get(this.$route.query.eventId+"")

                setTimeout(() => {
                    let elem = document.querySelector(`#event-${ event?.uid }`)
                    elem?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center"
                    })

                    this.highlightedEventId = event?.uid || ""
                    setTimeout(() => {
                        this.highlightedEventId = ""
                    }, 2000)
                }, 500)
            }
        }else{
            for(let day of this.$client.container.days.value) {
                if(parseInt(day.end) < this.currentSec) continue

                this.selectedDay = day
                break
            }

            if(this.selectedDay === undefined)
                this.selectedDay = this.$client.container.days.value[this.$client.container.days.value.length-1]
        }

        this.render()
    },
    watch: {
        "selectedDay"() {
            this.render()
            
            this.$router.replace({
                query: {
                    dayId: this.selectedDay?.uid || -1
                }
            })
        },
        "filterStages"() {
            this.render()
        }
    },
    components: { ActCard }
}
</script>

<template>
    <button class="center responsive s" style="z-index: 10">
        <span>{{ $t(selectedDay?.title || "") }}</span>
        <i>arrow_drop_down</i>
        <menu id="events-table-day-selector">
            <template v-for="day of $client.container.days.value">
                <li @click="selectDay(day)">{{ $t(day.title) }}</li>
            </template>
        </menu>
    </button>

    <nav class="l m no-space center-align">
        <template v-for="index in $client.container.days.value.length">

            <button class="border" :class="[
                `${ (index == 1) ? 'left' 
                    : (index == $client.container.days.value.length) ? 'right'
                    : 'no' 
                }-round`,
                {
                    fill: selectedDay == $client.container.days.value[index - 1] 
                }
            ]" @click="selectDay($client.container.days.value[index - 1])">
                <span>{{ $t($client.container.days.value[index - 1].title).substring(0, 2) }}</span>
            </button>
        </template>
    </nav>

    <div class="space"></div>

    <div style="height: 100%">
        <table class="scroll events-table" style="display: block; height: 100%">
            <thead class="fixed">
                <tr class="surface">
                    <th v-for="time of timeCells" style="min-width: 150px">
                        {{ new Date(time * 1000).toLocaleTimeString("de", { hour: '2-digit', minute: '2-digit' }) }}
                    </th>
                </tr>
            </thead>

            <tbody>
                <template v-for="column of columns">
                    <tr>
                        <td style="position: sticky; left: 0; padding-bottom: 0">
                            <p class="primary-text bold" style="margin-bottom: 0">
                                {{ column.label }}
                            </p>
                        </td>

                        <td v-for="n in (timeCells.length - 1)"></td>
                    </tr>

                    <tr>
                        <template v-for="entry in column.eventEntryByRow">
                            <td v-if="entry != null" :colspan="entry.columnSpan" :id="`event-${ entry.uid }`"
                                class="surface" style="min-width: 300px; position: sticky; left: 0">

                                <ActCard 
                                    style="min-width: 300px; position: sticky; left: 0" 
                                    :model="entry" :highlighted="entry.uid == highlightedEventId">
                                </ActCard>
                            </td>

                            <td v-if="entry == null" class="surface">

                            </td>
                        </template>
                    </tr>
                </template>
            </tbody>

            <br><br><br>
        </table>
    </div>
</template>

<style>
table.events-table td + td { border-left: .0625rem solid var(--outline-variant) }
table.events-table td {
    padding: 0
}
</style>