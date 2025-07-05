<script lang="ts">
import delay from "delay"

import AppBar from "@/components/AppBar.vue"
import RouteBasedMemberChartsDialog from "@/components/member/RouteBasedMemberChartsDialog.vue"

import SpaceMember from "@/sdk/model/SpaceMember"

export default {
    data() {
        return {
            loaded: false,

            openDeleteMemberConfirmDialog: false,
            currentMember: undefined as SpaceMember | undefined
        }
    },
    methods: {
        deleteMember(member: SpaceMember, force: Boolean = false) {
            if(!force) {
                this.currentMember = member as any
                this.openDeleteMemberConfirmDialog = true
                return
            }

            member.delete()
            this.$client.space!!.members = this.$client.space!!.members.filter(d => d.id != member.id) as any
        },
        openDialog(member: SpaceMember) {
            this.$router.push({
                query: {
                    member: member.id
                }
            })
        },
        openMemberChartsDialog() {
            this.$router.push({
                query: {
                    dialogMemberCharts: "true",
                    ... this.$route.query
                }
            })
        }
    },
    mounted() {
        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)
            this.loaded = true
        })()  
    },
    components: { AppBar, RouteBasedMemberChartsDialog }
}
</script>

<template>
    <AppBar :label="$t('navigation.members')">
        <template v-slot:prepend>
            <button class="circle transparent" @click="openMemberChartsDialog()">
                <i>stars</i>
            </button>
        </template>
    </AppBar>

    <main class="responsive scroll" v-if="loaded">
        <div class="middle-align center-align" style="height: 100%">
            <div v-if="$client.space != null" class="center-align" style="
                display: flex; flex-direction: row; flex-wrap: wrap; gap: 24px;
                align-self: safe center">
                
                <div v-for="member of ($client.space.members as any as SpaceMember[])">
                    <article class="medium middle-align wave wave-medium" @click="openDialog(member)" style="cursor: pointer">
                        <div style="padding: 40px">
                            <i class="extra" :class="[ `${ member.color }-text` ]">person</i>
                            <h5 class="center-align">{{ member.name }}</h5>

                            <span class="link small-text">{{ $tc("common.likes", member.likes.length) }} {{ $t("common.and") }} {{ $tc("common.recommendations", member.suggestions.length) }}</span>
                            <span v-if="!isNaN(member.calculateTasteMatch($client.space.self!!))" class="link small-text"><br>{{ $t("members.tasteMatch", { n: `${ member.calculateTasteMatch($client.space.self!!).toLocaleString(undefined, { maximumFractionDigits: 2 }) }%` }) }}</span>

                            <template v-if="$client.space.self?.isOwner() && !member.isOwner()">
                                <div class="space"></div>

                                <nav class="center-align">
                                    <button style="z-index: 10" class="large error" @click="(e) => { e.stopPropagation(); deleteMember(member) }">
                                        <i>delete</i>
                                        <span>{{ $t("common.delete") }}</span>
                                    </button>
                                </nav>
                            </template>
                        </div>
                    </article>
                </div>
            </div>
        </div>

        <div class="overlay" :class="{ active: openDeleteMemberConfirmDialog }" @click="openDeleteMemberConfirmDialog = false"></div>

        <dialog class="error" :class="{ active: openDeleteMemberConfirmDialog }">
            <h5>{{ $t("members.dialog.removeMember.title") }}</h5>
            <div>{{ $t("members.dialog.removeMember.message") }}</div>
            
            <nav class="right-align no-space">
                <button class="error transparent" @click="openDeleteMemberConfirmDialog = false">
                    {{ $t("common.abort") }}
                </button>
                
                <div class="space"></div>

                <button class="error-container no-elevate" @click="openDeleteMemberConfirmDialog = false; deleteMember(currentMember as any, true)">
                    {{ $t("common.confirm") }}
                </button>
            </nav>
        </dialog>
    </main>

    <RouteBasedMemberChartsDialog />
</template>

<style>
:is(.wave-medium):is(:focus-visible, :hover)::after {
    background-size: 18000% !important;
}
</style>