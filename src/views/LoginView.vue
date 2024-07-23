<script lang="ts">
import LoginButtons from "@/components/login/LoginButtons.vue"
import PrivacyPolicyLink from "@/components/PrivacyPolicyLink.vue"

export default {
    data() {
        return {
            openSignOutConfirmDialog: false
        }
    },
    methods: {
        async signOut(force: Boolean = false) {
            if(!force && this.$ctx.currentUser.value?.isAnonymous) {
                this.openSignOutConfirmDialog = true
                return
            }

            await this.$ctx.auth.signOut()
            window.location.reload()
        }
    },
    components: { LoginButtons, PrivacyPolicyLink }
}
</script>

<template>
    <main class="responsive max">
        <template v-if="$ctx.currentUser.value == undefined">
            <div class="middle-align" style="height: 100%">
                <article class="large-padding center middle-align center-align">
                    <div class="large-padding">
                        <i class="extra">login</i>
                        <h5 class="center-align">{{ $t("common.signIn") }}</h5>
                        <p>{{ $t("login.signIn.message[0]") }}<br>{{ $t("login.signIn.message[1]") }}</p>
                        
                        <div class="space"></div>

                        <div class="center-align">
                            <LoginButtons />
                        </div>
                    </div>
                </article>
            </div>
        </template>

        <template v-if="$ctx.currentUser.value != undefined">
            <div class="middle-align" style="height: 100%">
                <article class="medium center middle-align center-align">
                    <div>
                        <i v-if="$ctx.currentUser.value.photoURL == null" class="extra">person</i>
                        <img v-if="$ctx.currentUser.value.photoURL != null" class="circle large" :src="$ctx.currentUser.value.photoURL" referrerpolicy="no-referrer">

                        <h5 class="center-align">{{ $t("common.greeting") }} {{ 
                            ($client.space?.self?.name) ||
                            (
                                ($ctx.currentUser.value.isAnonymous) ? $t("common.anon")
                                    : $ctx.currentUser.value.displayName
                            )
                        }}</h5>

                        <p>{{ $t("login.alreadyLoggedIn") }}</p>
                        <span class="link small-text">{{ 
                            $ctx.currentUser.value.email || $ctx.currentUser.value.uid 
                        }}</span>

                        <div class="space"></div>

                        <nav class="center-align">
                            <button class="large" @click="signOut()">
                                <i>logout</i>
                                <span>{{ $t("common.logOut") }}</span>
                            </button>
                        </nav>
                    </div>
                </article>
            </div>
        </template>
    </main>

    <PrivacyPolicyLink />

    <div class="overlay" :class="{ active: openSignOutConfirmDialog }" @click="openSignOutConfirmDialog = false"></div>

    <dialog class="error" :class="{ active: openSignOutConfirmDialog }">
        <h5>{{ $t("settings.dialog.anonLogOut.title") }}</h5>
        <div>{{ $t("settings.dialog.anonLogOut.message") }}</div>
        
        <nav class="right-align no-space">
            <button class="error transparent" @click="openSignOutConfirmDialog = false">
                {{ $t("common.abort") }}
            </button>
            
            <div class="space"></div>

            <button class="error-container no-elevate" @click="openSignOutConfirmDialog = false; signOut(true)">
                {{ $t("common.confirm") }}
            </button>
        </nav>
    </dialog>
</template>