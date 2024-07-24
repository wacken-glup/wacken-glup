<script lang="ts">
import type { PropType } from 'vue'

import EventCard from "@/components/event/EventCard.vue"

import SpaceMember from "@/sdk/model/SpaceMember"

export default {
    props: {
        open: Boolean,
        member: {
            type: Object as PropType<SpaceMember>,
            required: true
        }
    },
    methods: {
        update() {
            
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
    components: { EventCard }
}
</script>

<template>
    <div class="overlay" :class="{ active: open }" @click="$emit('dismiss')"></div>

    <dialog :class="{ active: open }" class="max-s no-padding">
        <header class="surface-container fixed" style="padding: 0 1rem">
            <nav>
                <button class="circle transparent" @click="$emit('dismiss')">
                   <i>close</i>
                </button>

                <h5 class="max">{{ member.name }}</h5>
            </nav>
        </header>

        <div class="padding">
            <div class="middle-align">
                <i class="fill">favorite</i>

                <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.liked") }}</h6>
            </div>

            <div class="space"></div>

            <template v-for="id of member.likes">
                <EventCard :event="$client.container.eventByUid.value.get(id)" />
            </template>

            <div class="large-space"></div>

            <div class="middle-align">
                <i class="fill">thumb_up</i>

                <h6 style="margin-block-start: 0; margin-left: 1rem">{{ $t("common.recommended") }}</h6>
            </div>

            <div class="space"></div>

            <template v-for="id of member.suggestions">
                <EventCard :event="$client.container.eventByUid.value.get(id)" />
            </template>
        </div>
    </dialog>
</template>