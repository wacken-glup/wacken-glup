<script lang="ts">
import type { PropType } from 'vue'

import WoaEventModelWrapper from "../../sdk/model/WoaEventModelWrapper"

export default {
    props: {
        event: {
            type: Object as PropType<WoaEventModelWrapper>,
            required: false
        }
    },
    methods: {
        openDialog() {
            this.$router.push({
                query: {
                    details: this.event?.data.uid
                }
            })
        }
    }
}
</script>

<template>
    <a v-if="event !== undefined" class="row padding" 
        :class="
        [
            `${ 
                ($client.space?.self?.isLiked(event.data.uid)) ? 'primary' 
                    : (event.likerIds.length > 0) ? 'surface-variant' 
                    : (event.suggestorIds.length > 0) ? 'surface-variant' 
                    : 'surface-container' 
            }`
        ]"  
        @click="openDialog()">

        <img class="round" v-lazy="{ src: event.cardThumbnailUrl() }">
        <div class="max">
            <h6 class="small" style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 2.4em; line-height: 1.2em;">
                {{ event.cardTitle() }}
            </h6>

            <div>
                <div style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden; gap: 4px">
                    <template v-for="likerId of event.likerIds">
                        <div class="surface-container round">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(likerId)?.color }-text` ]">
                                favorite
                            </i>
                        </div>
                    </template>
                    
                    <template v-for="suggestorId of event.suggestorIds">
                        <div class="surface-container round">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(suggestorId)?.color }-text` ]">
                                thumb_up
                            </i>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </a>
</template>