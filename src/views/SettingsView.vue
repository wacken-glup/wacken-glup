<script lang="ts">
import delay from "delay"

import AppBar from "@/components/AppBar.vue"
import PrivacyPolicyLink from "@/components/PrivacyPolicyLink.vue"

export default {
    data() {
        return {
            loaded: false,

            openSpaceLeaveConfirmDialog: false,
            openSignOutConfirmDialog: false,
            openDeleteAccountConfirmDialog: false,
            openReauthenticateDialog: false,

            openShareInviteDialog: false,

            form: {
                name: "",
                nameTimeout: 0
            },

            inviteUrl: ""
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
        },
        async deleteAccount(force: Boolean = false) {
            if(!force) {
                this.openDeleteAccountConfirmDialog = true
                return
            }

            try {
                await this.$client.deleteAccount()
            }catch(e: any) {
                if(e.code == "auth/requires-recent-login") {
                    this.openReauthenticateDialog = true
                            
                    await this.$ctx.auth.signOut()
                    window.location.reload()
                    return
                }

                console.error(e)
            }
        },

        invite() {
            let shareData = this.$client.space!!.generateInvite(this.$t)
            console.info("share data", shareData)

            navigator?.share?.(shareData)

            // fallback
            this.inviteUrl = this.$client.space!!.generateInvite(this.$t).url
            this.openShareInviteDialog = true
        },
        async inviteReset() {
            await this.$client.space!!.resetInvite()
            this.inviteUrl = this.$client.space!!.generateInvite(this.$t).url
        },

        leaveSpace(force: Boolean = false) {
            if(!force) {
                this.openSpaceLeaveConfirmDialog = true
                return
            }

            this.$client.leaveSpace()
        }
    },
    mounted() {
        this.form.name = this.$client.space?.name || "";


        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)
            this.loaded = true
        })();
    },
    watch: {
        "form.name"() {
            if(this.$client.space?.name == this.form.name) return

            clearTimeout(this.form.nameTimeout)
            this.form.nameTimeout = setTimeout(() => {
                this.$client.space!!.updateName(this.form.name)
            }, 1000)
        },
        "$client.space"() {
            this.form.name = this.$client.space?.name || ""
            this.inviteUrl = this.$client.space!!.generateInvite(this.$t).url
        },
        "inviteUrl"() {
            let url = this.$client.space!!.generateInvite(this.$t).url
            if(this.inviteUrl != url) this.inviteUrl = url 
        }
    },
    components: { AppBar, PrivacyPolicyLink }
}
</script>

<template>
    <AppBar :label="$t('navigation.settings')" />

    <main class="responsive max">
        <template v-if="$ctx.currentUser.value != undefined">
            <div class="center-align" style="height: 100%; display: flex; flex-direction: column;">
                <article class="medium center middle-align center-align" style="min-width: 300px">
                    <div>
                        <i v-if="$ctx.currentUser.value.photoURL == null" :class="[ `${ $client.space?.self?.color }-text` ]" class="extra">person</i>
                        <img v-if="$ctx.currentUser.value.photoURL != null" class="circle large" :src="$ctx.currentUser.value.photoURL" referrerpolicy="no-referrer">

                        <h5 class="center-align">{{ $t("common.greeting") }} {{ 
                            ($client.space?.self?.name) ||
                            (
                                ($ctx.currentUser.value.isAnonymous) ? $t("common.anon")
                                    : $ctx.currentUser.value.displayName
                            )
                        }}
                        </h5>

                        <span class="link small-text">{{ 
                            $ctx.currentUser.value.email || $ctx.currentUser.value.uid 
                        }}</span>

                        <div class="space"></div>

                        <nav class="center-align">
                            <button class="large" @click="signOut()">
                                <i>logout</i>
                                <span>{{ $t("common.logOut") }}</span>
                            </button>

                            <button class="large error" @click="deleteAccount()">
                                <i>delete</i>
                                <span>{{ $t("common.delete") }}</span>
                            </button>
                        </nav>
                    </div>
                </article>

                <article v-if="loaded && $client.space?.self?.isOwner()" class="medium center middle-align center-align">
                    <div>
                        <i class="extra">tune</i>
                        <h5 class="center-align">{{ $t("settings.spaceSettings.title") }}</h5>

                        <div class="field label prefix border">
                            <i>label</i>
                            <input type="name" v-model="form.name">
                            <label>{{ $t("common.name") }}</label>
                        </div>
                        
                        <nav class="center-align">
                            <button class="large" @click="invite()">
                                <i>share</i>
                                <span>{{ $t("common.invite") }}</span>
                            </button>

                            <button class="circle large error" @click="inviteReset()">
                                <i>restore</i>
                            </button>
                        </nav>
                    </div>
                </article>

                <article v-if="!$client.space?.self?.isOwner() && $client.space !== undefined" class="medium center middle-align center-align">
                    <div>
                        <i class="extra">groups</i>
                        <h5 class="center-align">Space » {{ $client.space.name }} «</h5>

                        <nav class="center-align">
                            <button class="large" @click="invite()">
                                <i>share</i>
                                <span>{{ $t("common.invite") }}</span>
                            </button>

                            <button class="large error" @click="leaveSpace()">
                                <i>logout</i>
                                <span>{{ $t("common.leave") }}</span>
                            </button>
                        </nav>
                    </div>
                </article>
            </div>
        </template>
    </main>

    <PrivacyPolicyLink />

    <div class="overlay" :class="{ active: openSpaceLeaveConfirmDialog }" @click="openSpaceLeaveConfirmDialog = false"></div>

    <dialog class="error" :class="{ active: openSpaceLeaveConfirmDialog }">
        <h5>{{ $t("settings.dialog.leaveSpace.title") }}</h5>
        <div>{{ $t("settings.dialog.leaveSpace.message") }}</div>
        
        <nav class="right-align no-space">
            <button class="error transparent" @click="openSpaceLeaveConfirmDialog = false">
                {{ $t("common.abort") }}
            </button>
            
            <div class="space"></div>

            <button class="error-container no-elevate" @click="openSpaceLeaveConfirmDialog = false; leaveSpace(true)">
                {{ $t("common.confirm") }}
            </button>
        </nav>
    </dialog>

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

    <div class="overlay" :class="{ active: openDeleteAccountConfirmDialog }" @click="openDeleteAccountConfirmDialog = false"></div>

    <dialog class="error" :class="{ active: openDeleteAccountConfirmDialog }">
        <h5>{{ $t("settings.dialog.deleteAccount.title") }}</h5>
        <div>{{ $t("settings.dialog.deleteAccount.message") }}</div>
        
        <nav class="right-align no-space">
            <button class="error transparent" @click="openDeleteAccountConfirmDialog = false">
                {{ $t("common.abort") }}
            </button>
            
            <div class="space"></div>

            <button class="error-container no-elevate" @click="openDeleteAccountConfirmDialog = false; deleteAccount(true)">
                {{ $t("common.confirm") }}
            </button>
        </nav>
    </dialog>

    <div class="overlay" :class="{ active: openReauthenticateDialog }" @click="openReauthenticateDialog = false"></div>

    <dialog class="error" :class="{ active: openReauthenticateDialog }">
        <h5>{{ $t("settings.dialog.relogin.title") }}</h5>
        <div>{{ $t("settings.dialog.relogin.message") }}</div>
        
        <nav class="right-align no-space">
            <button class="error-container no-elevate" @click="openReauthenticateDialog = false">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>

    <div class="overlay" :class="{ active: openShareInviteDialog }" @click="openShareInviteDialog = false"></div>

    <dialog :class="{ active: openShareInviteDialog }">
        <h5>{{ $t("settings.dialog.invitationLink.title") }}</h5>
        <div>{{ $t("settings.dialog.invitationLink.message") }}</div>
        
        <div class="space"></div>

        <div class="field label prefix border">
            <i>link</i>
            <input type="text" v-model="inviteUrl">
            <label>{{ $t("common.invitationLink") }}</label>
        </div>

        <vue-qrcode v-if="inviteUrl.length > 5" class="center" :value="inviteUrl" :options="{ width: 250 }" />

        <nav class="right-align no-space">
            <button class="no-elevate" @click="openShareInviteDialog = false">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>
</template>