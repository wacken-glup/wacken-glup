<script lang="ts">
import type BaseCardDataModel from '@/sdk/model/BaseCardDataModel'

import ActDetailsDialog from "@/components/act/ActDetailsDialog.vue"

export default {
    data() {
        return {
            openActDetailsDialog: false,
            selectedAct: undefined as BaseCardDataModel | undefined
        }
    },
    methods: {
        update() {
            let detailsQuery = this.$route.query["details"]

            if(detailsQuery === undefined) {
                this.openActDetailsDialog = false
            }else{
                let act = this.$client.container.actByUid.value.get(detailsQuery+"")
                if(act !== undefined) this.selectedAct = act
                
                setTimeout(() => {
                    this.openActDetailsDialog = true
                }, 50);
            }
        },
        dismiss() {
            this.$router.back()
        }
    },
    mounted() {
        this.update()
    },
    watch: {
        $route() {
            this.update()
        }
    },
    components: { ActDetailsDialog }
}
</script>

<template>
    <ActDetailsDialog v-if="selectedAct != undefined" :open="openActDetailsDialog" :model="selectedAct"
            @dismiss="dismiss()" />
</template>