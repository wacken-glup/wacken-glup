<script lang="ts">
import AppBar from "@/components/AppBar.vue"
import EventsTable from "@/components/table/EventsTable.vue"

import delay from "delay"

export default {
    data() {
        return {
            loaded: false,

            filteredStageIds: [] as number[],
            finalFilteredStageIds: [] as number[],

            save: false
        }  
    },
    methods: {
        toggleFilter(id: number) {
            if(this.filteredStageIds.includes(id)) {
                this.filteredStageIds = this.filteredStageIds.filter(mId => mId != id)
            }else{
                this.filteredStageIds.push(id)
            }
        },
        openStageSelectionDialog() {
            this.$router.push({
                query: {
                    dialogFilterStages: "true",
                    ... this.$route.query
                }
            })
        }
    },
    mounted() {
        if(localStorage.getItem("filterStages") != null) try {
            let filterStages = JSON.parse(localStorage.getItem("filterStages") || "")
            this.filteredStageIds = filterStages
            this.finalFilteredStageIds = filterStages
        }catch(e) {
            console.error(e)
        }

        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)
            this.loaded = true
        })()
    },
    beforeRouteUpdate(to, from) {
        if(from.query.dialogFilterStages && !to.query.dialogFilterStages) {
            console.info("closed filter stages dialog")

            this.finalFilteredStageIds = [ ...this.filteredStageIds ]
            if(this.save) localStorage.setItem("filterStages", JSON.stringify(this.finalFilteredStageIds))
        }
    },
    components: { AppBar, EventsTable }
}
</script>

<template>
    <AppBar :label="(loaded && $client.space?.name) 
        ? $client.space?.name
        : $t('navigation.overview')">

        <template v-slot:prepend v-if="$client.container.festival.value?.runningOrderActive">
            <button class="circle transparent" @click="openStageSelectionDialog()">
                <i>tune</i>
                <div class="badge" v-if="finalFilteredStageIds.length > 0">{{ finalFilteredStageIds.length }}</div>
            </button>
        </template>
    </AppBar>

    <main class="responsive max">
        <template v-if="$client.container.festival.value?.runningOrderActive">
            <EventsTable :filterStages="finalFilteredStageIds" />
        </template>

        <!-- show info when running order isn't available -->
        <template v-if="$client.container.festival.value?.runningOrderActive != true">
            <div class="middle-align center-align" style="height: 100%">
                <article class="medium middle-align center-align">
                    <div>
                        <i class="extra">tune</i>
                        <h5 class="center-align">{{ $t("home.runningOrderInactive.title") }}</h5>
                        <p class="center-align">{{ $t("home.runningOrderInactive.message")}}</p>

                        <div class="space"></div>
                        
                        <nav class="center-align">
                            <button @click="$router.push('/acts')">{{ $t("common.showActs") }}</button>
                        </nav>
                    </div>
                </article>
            </div>
        </template>
    </main>

    <div class="overlay" :class="{ active: $route.query.dialogFilterStages }" @click="$router.back()"></div>

    <dialog :class="{ active: $route.query.dialogFilterStages }">
        <h5>{{ $t("home.dialog.filterStages.title") }}</h5>
        
        <article>
            <template v-for="stage of $client.container.stages.value">
                <div class="space"></div>

                <div class="field middle-align" style="cursor: pointer; margin-block-end: 1rem" 
                    @click="toggleFilter(stage.uid)">

                    <nav>
                        <div class="max">
                            <h6>{{ stage.title }}</h6>
                        </div>

                        <label class="switch">
                            <input type="checkbox" :checked="!filteredStageIds.includes(stage.uid)" @click="toggleFilter(stage.uid)">
                            <span></span>
                        </label>
                    </nav>
                </div>
            </template>
        </article>

        <div class="space"></div>

        <div class="field middle-align" @click="save = !save">
            <nav>
                <div class="max">
                    <h6>{{ $t("home.dialog.filterStages.save.title") }}</h6>
                    <div>{{ $t("home.dialog.filterStages.save.description") }}</div>
                </div>

                <label class="switch">
                    <input type="checkbox" :checked="save" @click="save = !save">
                    <span></span>
                </label>
            </nav>
        </div>
        
        <div class="space"></div>

        <nav class="right-align no-space">
            <button class="no-elevate" @click="$router.back()">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>
</template>

<style>
.content {
    margin: 16px;
}
</style>