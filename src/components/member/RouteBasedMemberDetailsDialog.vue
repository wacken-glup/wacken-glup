<script lang="ts">
import SpaceMember from '@/sdk/model/SpaceMember'

import MemberDetailsDialog from "@/components/member/MemberDetailsDialog.vue"

export default {
    data() {
        return {
            openDialog: false,
            selectedMember: undefined as SpaceMember | undefined
        }
    },
    methods: {
        update() {
            let detailsQuery = this.$route.query["member"]

            if(detailsQuery === undefined) {
                this.openDialog = false
            }else{
                let member = this.$client.space?.members.find(m => m.id == detailsQuery+"")
                this.selectedMember = member

                setTimeout(() => {
                    this.openDialog = true
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
    components: { MemberDetailsDialog }
}
</script>

<template>
    <MemberDetailsDialog v-if="selectedMember != undefined" :open="openDialog" :member="(selectedMember as any)"
            @dismiss="dismiss()" />
</template>