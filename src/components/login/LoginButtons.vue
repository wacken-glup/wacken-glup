<script lang="ts">
import { 
    GoogleAuthProvider, signInWithPopup, signInAnonymously 
} from "firebase/auth"

export default {
    props: {
        hideAnon: {
            type: Boolean,
            default: false
        },
        reload: Boolean
    },
    methods: {
        googleAuth() {
            signInWithPopup(this.$ctx.auth, new GoogleAuthProvider())
                .then(() => {
                    if(this.reload) {
                        window.location.reload()
                    }else{
                        window.location.href = "/"
                    }
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    console.error(errorCode, errorMessage)
                })
        },
        mailAuth() {
            this.$router.push({
                path: "/login/mail",
                query: {
                    "callback": this.$route.fullPath
                }
            })
        },
        async anonAuth() {
            await signInAnonymously(this.$ctx.auth)

            if(this.reload) {
                window.location.reload()
            }else{
                window.location.href = "/"
            }
        }
    }
}
</script>

<template>
    <button class="responsive large" @click="googleAuth()">
        <i class="mdi mdi-google"></i>
        <span>Google</span>
    </button>

    <div class="space"></div>

    <button class="responsive large" @click="mailAuth()">
        <i>mail</i>
        <span>{{ $t("common.mail") }}</span>
    </button>

    <template v-if="!hideAnon">
        <div class="space"></div>

        <button class="responsive fill large" @click="anonAuth()">
            <i>password_2_off</i>
            <span>{{ $t("common.anon") }}</span>
        </button>
    </template>
</template>