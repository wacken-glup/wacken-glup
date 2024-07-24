<script lang="ts">
import { RouterView } from 'vue-router'

import Navigation from './components/nav/Navigation.vue'
import LoginView from './views/LoginView.vue'

import RouteBasedEventDetailsDialog from "@/components/event/RouteBasedEventDetailsDialog.vue"
import RouteBasedMemberDetailsDialog from "@/components/member/RouteBasedMemberDetailsDialog.vue"

import AdvertisePWA from "@/components/AdvertisePWA.vue"

export default {
    mounted() {
        this.checkSystemTheme()
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if(this.$ctx.systemDarkMode.value) this.$ctx.darkMode.value = event.matches
        })

        setTimeout(() => {
            this.updateThemeColor()
        }, 50)
    },
    methods: {
        updateThemeColor() {
            let mode = ui("mode")
            let color = ((ui("theme") as any)[mode as any] as string).split("--surface-container:")[1].split(";")[0]
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
        },
        checkSystemTheme() {
            if(!this.$ctx.systemDarkMode.value) return
            this.$ctx.darkMode.value = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
    },
    watch: {
        "$ctx.systemDarkMode.value"() {
            this.checkSystemTheme()
        },
        "$ctx.darkMode.value"() {
            ui("mode", (this.$ctx.darkMode.value) ? "dark" : "light")
            this.updateThemeColor()
        }
    },
    components: { Navigation, LoginView, RouteBasedEventDetailsDialog, RouteBasedMemberDetailsDialog, AdvertisePWA }
}
</script>

<template>
    <main v-if="!$ctx.loaded.value" class="max responsive center-align middle-align">
        <progress style="max-width: 300px"></progress>
    </main>

    <template v-if="$ctx.loaded.value">
        <template v-if="$route.meta.requiresAuth === false || $ctx.currentUser.value != undefined">
            <Navigation v-if="$route.meta.hideNavigation !== true" />

            <RouterView />
        </template>

        <template v-if="$route.meta.requiresAuth !== false && $ctx.currentUser.value == undefined">
            <LoginView />
        </template>

        <RouteBasedEventDetailsDialog />
        <RouteBasedMemberDetailsDialog />

        <div class="overlay" :class="{ active: openLoginNeededDialog.value }" @click="openLoginNeededDialog.value = false"></div>

        <dialog :class="{ active: openLoginNeededDialog.value }">
            <h5>{{ $t("dialog.login-needed.title") }}</h5>
            <div>{{ $t("dialog.login-needed.message") }}</div>
            
            <div class="space"></div>

            <nav class="right-align no-space">
                <button class="no-elevate" @click="$router.push('/login'); openLoginNeededDialog.value = false">
                    {{ $t("common.signIn") }}
                </button>
            </nav>
        </dialog>
        
        <AdvertisePWA />
    </template>
</template>