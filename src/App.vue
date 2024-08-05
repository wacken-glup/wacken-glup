<script lang="ts">
import { RouterView } from 'vue-router'

import Navigation from './components/nav/Navigation.vue'
import LoginView from './views/LoginView.vue'

import RouteBasedActDetailsDialog from "@/components/act/RouteBasedActDetailsDialog.vue"
import RouteBasedMemberDetailsDialog from "@/components/member/RouteBasedMemberDetailsDialog.vue"

import AdvertisePWA from "@/components/AdvertisePWA.vue"

export default {
    data() {
        return {
            offlineCheckInterval: 0,
            onlineAgain: false,

            toggleOfflineSnackbar: false
        }
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
        },
        checkOffline() {
            clearInterval(this.offlineCheckInterval)
            if(!this.$client.offline.value) return

            this.offlineCheckInterval = setInterval(async () => {
                try {
                    await fetch(`/${ crypto.randomUUID() }`, { signal: AbortSignal.timeout(3500) })
                    this.onlineAgain = true
                }catch(e) {
                    console.error(e)
                }
            }, 4000)
        },
        reloadPage() {
            window.location.reload()
        }
    },
    mounted() {
        this.$ctx.darkMode.value = (localStorage.getItem("darkMode") || "false") == "true"
        this.$ctx.systemDarkMode.value = (localStorage.getItem("systemDarkMode") || "true") == "true"
        
        this.checkSystemTheme()
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if(this.$ctx.systemDarkMode.value) this.$ctx.darkMode.value = event.matches
        })

        setTimeout(() => {
            this.updateThemeColor()
        }, 50)

        this.checkOffline()
    },
    watch: {
        "$ctx.systemDarkMode.value"() {
            this.checkSystemTheme()

            localStorage.setItem("systemDarkMode", this.$ctx.systemDarkMode.value+"")
        },
        "$ctx.darkMode.value"() {
            ui("mode", (this.$ctx.darkMode.value) ? "dark" : "light")
            this.updateThemeColor()

            localStorage.setItem("darkMode", this.$ctx.darkMode.value+"")
        },
        "$client.offline.value"() {
            this.checkOffline()
        },
        "showOfflineReadyToast.value"() {
            if(!this.showOfflineReadyToast.value) return

            setTimeout(() => {
                this.showOfflineReadyToast.value = false
            }, 4000)
        }
    },
    components: { Navigation, LoginView, RouteBasedActDetailsDialog, RouteBasedMemberDetailsDialog, AdvertisePWA }
}
</script>

<template>
    <main v-if="!$ctx.loaded.value" class="max responsive center-align middle-align flex column">
        <progress style="max-width: 300px"></progress>

        <div class="snackbar primary center-align error" :class="{ active: $ctx.showOfflineButton.value }" @click="$client.activateOfflineMode()">
            <i>offline_bolt</i>
            <div>{{ $t("app.offline.button.message") }}</div>
        </div>
    </main>

    <template v-if="$ctx.loaded.value">
        <template v-if="$route.meta.requiresAuth === false || $ctx.currentUser.value != undefined">
            <Navigation v-if="$route.meta.hideNavigation !== true" />

            <RouterView />
        </template>

        <template v-if="$route.meta.requiresAuth !== false && $ctx.currentUser.value == undefined">
            <LoginView />
        </template>

        <RouteBasedActDetailsDialog />
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

        <div class="snackbar green center-align" :class="{ active: $client.offline.value && onlineAgain }" @click="reloadPage()">
            <i>globe</i>
            <div>{{ $t("app.offline.onlineAgain.message") }}</div>
        </div>

        <div class="snackbar primary center-align error" :class="{ active: $client.offline.value && !onlineAgain && !toggleOfflineSnackbar }" @click="toggleOfflineSnackbar = true">
            <i>offline_bolt</i>
            <div>{{ $t("app.offline.message") }}</div>
        </div>
        <div class="snackbar primary center-align error top" :class="{ active: $client.offline.value && !onlineAgain && toggleOfflineSnackbar }" @click="toggleOfflineSnackbar = false">
            <i>offline_bolt</i>
            <div>{{ $t("app.offline.message") }}</div>
        </div>

        <div class="snackbar secondary center-align" :class="{ active: showOfflineReadyToast.value }" @click="showOfflineReadyToast.value = false">
            <i>offline_bolt</i>
            <div>{{ $t("app.offline.ready.message") }}</div>
        </div>
    </template>
</template>