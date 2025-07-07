<script lang="ts">
import { 
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth"

import PrivacyPolicyLink from "@/components/PrivacyPolicyLink.vue"

export default {
    data() {
        return {
            activePage: 0,

            formSignIn: {
                name: "",
                mail: "",
                password: "",

                error: null as string | null,
                loading: false
            },

            formSignUp: {
                name: "",
                mail: "",
                password: "",

                error: null as string | null,
                loading: false
            }
        }
    },
    methods: {
        forward() {
            console.info("callback", this.$route.query.callback+"")
            if(this.$route.query.callback == undefined) {
                window.location.href = "/"
            }else{
                window.location.href = this.$route.query.callback+""
            }
        },
        async signIn() {
            this.formSignIn.loading = true

            try {
                await signInWithEmailAndPassword(this.$ctx.auth, this.formSignIn.mail, this.formSignIn.password)
                this.forward()
            }catch(e: any) {
                this.formSignIn.error = e.code
            }

            this.formSignIn.loading = false
        },
        async signUp() {
            this.formSignUp.loading = true

            try {
                let user = await createUserWithEmailAndPassword(this.$ctx.auth, this.formSignUp.mail, this.formSignUp.password)
                await updateProfile(user.user, { displayName: this.formSignUp.name })

                this.forward()
            }catch(e: any) {
                this.formSignUp.error = e.code
            }

            this.formSignUp.loading = false
        }
    },
    components: { PrivacyPolicyLink }
}
</script>

<template>
    <main class="responsive max scroll">
        <template v-if="$ctx.currentUser.value != undefined && $route.query.callback === undefined">
            {{ $router.push("/login") }}
        </template>

        <template v-if="$ctx.currentUser.value == undefined">
            <div class="middle-align" style="height: 100%">
                <article class="large-padding center middle-align center-align">
                    <div class="large-padding">
                        <i class="extra">mail</i>
                        <h5 class="center-align">{{ $t("login.mail.title") }}</h5>
                        <p>{{ $t("login.mail.message[0]") }}<br>{{ $t("login.mail.message[1]") }}</p>

                        <div class="space"></div>

                        <nav class="tabbed">
                            <a :class="{ active: activePage == 0 }" @click="activePage = 0">
                                <i>login</i>
                                <span>{{ $t("common.signIn") }}</span>
                            </a>

                            <a :class="{ active: activePage == 1 }" @click="activePage = 1">
                                <i>draw</i>
                                <span>{{ $t("common.signUp") }}</span>
                            </a>
                        </nav>

                        <div class="space"></div>
                        <div class="space"></div>

                        <div class="page left center-align" :class="{ active: activePage == 0 }">
                            <form id="mail-signin-form" onsubmit="event.preventDefault()">
                                <div class="field label prefix border">
                                    <i>mail</i>
                                    <input type="mail" v-model="formSignIn.mail">
                                    <label>{{ $t("common.mailAddress") }}</label>
                                </div>

                                <div class="field label prefix border">
                                    <i>password</i>
                                    <input type="password" v-model="formSignIn.password">
                                    <label>{{ $t("common.password") }}</label>
                                </div>
                            </form>

                            <p v-if="formSignIn.error != null" class="error">{{ formSignIn.error }}</p>

                            <nav class="right-align">
                                <button form="mail-signin-form" @click="signIn()">
                                    <span>{{ $t("common.signIn") }}</span>
                                    <progress v-if="formSignIn.loading" class="max"></progress>
                                </button>
                            </nav>
                        </div>

                        <div class="page right center-align" :class="{ active: activePage == 1 }">
                            <form id="mail-signup-form" onsubmit="event.preventDefault()">
                                <div class="field label prefix border">
                                    <i>label</i>
                                    <input type="name" v-model="formSignUp.name">
                                    <label>{{ $t("common.name") }}</label>
                                </div>
                            
                                <div class="field label prefix border">
                                    <i>mail</i>
                                    <input type="mail" v-model="formSignUp.mail">
                                    <label>{{ $t("common.mailAddress") }}</label>
                                </div>

                                <div class="field label prefix border">
                                    <i>password</i>
                                    <input type="password" v-model="formSignUp.password">
                                    <label>{{ $t("common.password") }}</label>
                                </div>
                            </form>

                            <p v-if="formSignUp.error != null" class="error">{{ formSignUp.error }}</p>

                            <nav class="right-align">
                                <button form="mail-signup-form" @click="signUp()">
                                    <span>{{ $t("common.signUp") }}</span>
                                    <progress v-if="formSignUp.loading" class="max"></progress>
                                </button>
                            </nav>
                        </div>
                    </div>
                </article>
            </div>
        </template>
    </main>

    <PrivacyPolicyLink />
</template>