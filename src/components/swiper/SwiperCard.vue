<script lang="ts">
import type { PropType } from 'vue'
import BaseCardDataModel from "@/sdk/model/BaseCardDataModel"

import ActDetailsDialogContent from "@/components/act/details/ActDetailsDialogContent.vue"

export default {
    props: {
        model: {
            type: Object as PropType<BaseCardDataModel>,
            required: true
        }
    },
    components: { ActDetailsDialogContent }
}
</script>

<template>
    <div style="overflow: scroll">
        <img class="responsive large absolute top right" :src="model.cardThumbnailUrl()">
        <img class="responsive large" style="opacity: 0" :src="model.cardThumbnailUrl() || '/'">

        <ActDetailsDialogContent :model="model" :lock-spotify="true" style="margin-top: -112px" />              
    </div>
</template>