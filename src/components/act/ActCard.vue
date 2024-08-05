<script lang="ts">
import type { PropType } from 'vue'

import BaseCardDataModel from "../../sdk/model/BaseCardDataModel"

export default {
    props: {
        model: {
            type: Object as PropType<BaseCardDataModel>,
            required: false
        },
        highlighted: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        openDialog() {
            this.$router.push({
                query: {
                    details: this.model?.uid
                }
            })
        }
    }
}
</script>

<template>
    <a v-if="model !== undefined" class="row padding" 
        :class="
        [
            `${ 
                (highlighted) ? 'tertiary'
                    : ($client.space?.self?.isLiked(model.uid)) ? 'primary' 
                        : (model.likerIds.length > 0 || model.suggestorIds.length > 0) ? ($ctx.darkMode.value) ? 'surface-variant' : 'secondary' 
                        : 'surface-container' 
            }`
        ]"  
        @click="openDialog()">

        <slot></slot>
        <img class="round" v-lazy="{ src: model.cardThumbnailUrl() }">

        <div class="max">
            <h6 class="small" style="display: block; text-overflow: ellipsis; word-wrap: break-word; overflow: hidden; max-height: 2.4em; line-height: 1.2em;">
                {{ model.cardTitle() }}
            </h6>

            <div>
                <div style="display: flex; flex-direction: row; flex-wrap: nowrap; overflow: hidden; gap: 4px">
                    <template v-for="likerId of model.likerIds">
                        <div class="surface-container round">
                            <i class="fill" :style="{ scale: 0.7 }" :class="[ `${ $client.container.spaceMemberById.get(likerId)?.color }-text` ]">
                                favorite
                            </i>
                        </div>
                    </template>
                    
                    <template v-for="suggestorId of model.suggestorIds">
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