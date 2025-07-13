<script lang="ts">
import { 
    signInAnonymously 
} from "firebase/auth"

import LoginButtons from "@/components/login/LoginButtons.vue"
import PrivacyPolicyLink from "@/components/PrivacyPolicyLink.vue"

import SpaceMember from "@/sdk/model/SpaceMember"

import delay from "delay"

enum MemberColors {
    amber = "Amber",
    blue = "Blau",
    "blue-grey" = "Blau-Grau",
    brown = "Braun",
    cyan = "Cyan",
    "deep-orange" = "Deep-Orange",
    "deep-purple" = "Deep-Purple",
    green = "Grün",
    grey = "Grau",
    indigo = "Indigo",
    "light-blue" = "Hellblau",
    "light-green" = "Hellgrün",
    lime = "Lime",
    orange = "Orange",
    pink = "Pink",
    purple = "Purple",
    red = "Rot",
    teal = "Teal",
    yellow = "Gelb"
}

export default {
    data() {
        return {
            name: undefined as string | undefined,
            host: undefined as string | undefined,

            space: undefined as string | undefined,
            key: undefined as string | undefined,

            page: 0,
            secondaryPage: 0,

            form: {
                name: undefined as string | undefined,
                color: undefined as string | undefined,
                
                error: undefined as string | undefined
            },

            loaded: false,

            errorCode: undefined as string | undefined
        }
    },
    mounted() {
        this.$ctx.dontAutoCreateSpace = true

        this.name = this.$route.query["name"]?.toString()
        this.host = this.$route.query["host"]?.toString()

        this.space = this.$route.query["space"]?.toString()
        this.key = this.$route.query["key"]?.toString()

        if(this.$route.query["page"] == "1") this.page = 1

        this.form.name = this.$ctx.currentUser.value?.displayName || "";
        
        (async() => {
            while(this.$client.space?.loaded != true) await delay(50)
            this.loaded = true
        })()
    },
    methods: {
        async join() {
            try {
                // join if not already joined
                if(this.$ctx.currentUser.value == undefined){
                    this.$ctx.dontAutoCreateSpace = true
                    this.$ctx.currentUser.value = (await signInAnonymously(this.$ctx.auth)).user
                }

                await this.$client.registerUser(this.space!!, this.key!!)
                window.location.href = window.location.href + "&page=1"
            }catch(e: any) {
                if(e.code) {
                    this.errorCode = e.code
                }else{
                    this.errorCode = e+""
                }

                console.error(e)
            }
        },
        async complete() {
            try {
                if(this.space === undefined) throw "Der Einladungslink ist fehlerhaft."
                if(this.key === undefined) throw "Der Einladungslink ist fehlerhaft."

                if(this.form.name === undefined) throw "Bitte gebe deinen Namen an."
                if(this.form.color === undefined) throw "Bitte wähle eine Farbe aus."
                if(this.form.name.length < 2) throw "Der Name muss aus mindestens zwei Zeichen bestehen."
                if(this.form.name.length > 48) throw "Bitte gebe eine kürzere Version deines Namens an."
                if(this.form.color.length < 2) throw "Bitte gebe eine gültige Farbe an."
                this.form.error = undefined

                try {
                    let memberId = await this.$client.space?.createMember(this.form.name, this.form.color)
                    if(memberId == undefined) throw "CREATION_OF_MEMBER_FAILED"
                    
                    await this.$client.space?.setMemberId(this.$ctx.currentUser.value!!.uid, memberId)
                    window.location.href = "/"
                }catch(e: any) {
                    if(e.code) {
                        this.errorCode = e.code
                    }else{
                        this.errorCode = e+""
                    }

                    console.error(e)
                }
            }catch(e) {
                this.form.error = e+""
            }
        },
        async chooseMember(member: SpaceMember) {
            try {
                await this.$client.space?.setMemberId(this.$ctx.currentUser.value!!.uid, member.id)
                window.location.href = "/"
            }catch(e: any) {
                if(e.code) {
                    this.errorCode = e.code
                }else{
                    this.errorCode = e+""
                }

                console.error(e)
            }
        },
        getAvailableColors() {
            let unavailableColors: string[] = []
            this.$client.space?.members.forEach(m => { unavailableColors.push(m.color) })

            let availableColors = Object.keys(MemberColors).filter(c => !unavailableColors.includes(c))
            if(availableColors.length < 3) availableColors = Object.keys(MemberColors)

            return availableColors
        },
        getColorLabel(id: any) {
            return (MemberColors as any)[id] as any
        }
    },
    components: { LoginButtons, PrivacyPolicyLink }
}
</script>

<template>
    <main class="responsive max">
        <div class="middle-align" style="height: 100%">
            <article class="center middle-align center-align" style="padding-left: 24px; padding-right: 24px;">
                <div>
                    <div class="page" :class="{ active: page == 0 }">
                        <i class="extra">groups</i>
                        <h5 class="center-align">{{ $t("join.title") }}</h5>

                        <p v-if="name != null">{{ $t("join.message.specific", { n: host || $t("common.someone"), s: name }) }}</p>
                        <p v-if="name == null">{{ $t("join.message.generic", { n: host || $t("common.someone") }) }}</p>

                        <div class="space"></div>

                        <nav v-if="$ctx.currentUser.value !== undefined" class="center-align">
                            <button class="large" @click="join()">
                                <i>join</i>
                                <span>{{ $t("common.join") }}</span>
                            </button>
                        </nav>

                        <div v-if="$ctx.currentUser.value == undefined" class="center-align">
                            <button class="responsive" @click="join()">
                                <i>join</i>
                                <span>{{ $t("join.button.joinWithoutAccount") }}</span>
                            </button>

                            <div class="space"></div>
                            <div class="divider"></div>
                            <div class="space"></div>

                            <LoginButtons :hide-anon="true" :reload="true" />
                        </div>
                    </div>

                    <div class="page" :class="{ active: page == 1 }" v-if="loaded">
                        <i class="extra">label</i>
                        <h5 class="center-align">{{ $t("join.whoAreYou.title") }}</h5>
                        <p>{{ $t("join.whoAreYou.message[0]") }}<br>{{ $t("join.whoAreYou.message[1]") }}</p>

                        <div class="space"></div>

                        <div class="space"></div>

                        <nav class="tabbed">
                            <a :class="{ active: secondaryPage == 0 }" @click="secondaryPage = 0">
                                <i>check_circle</i>
                                <span>{{ $t("common.select") }}</span>
                            </a>

                            <a :class="{ active: secondaryPage == 1 }" @click="secondaryPage = 1">
                                <i>add</i>
                                <span>{{ $t("common.add")  }}</span>
                            </a>
                        </nav>

                        <div class="space"></div>
                        <div class="space"></div>

                        <div v-if="$client.space != undefined" class="page left center-align" :class="{ active: secondaryPage == 0 }">
                            <article style="max-height: 50vh; overflow: scroll">
                                <template v-for="member of ($client.space.members as any as SpaceMember[])">
                                    <a v-if="!member.isOwner()" class="row wave padding" @click="chooseMember(member)">
                                        <button class="circle" :class="[ `${ member.color }5` ]"><i style="color: black">person</i></button>
                                        <div class="max">
                                            <h6 class="small">{{ member.name }}</h6>
                                            <div><span class="link">{{ $tc("common.likes", member.likes.length) }} {{ $t("common.and") }} {{ $tc("common.recommendations", member.suggestions.length) }}</span></div>
                                        </div>
                                    </a>
                                </template>

                                <a class="row wave padding" @click="secondaryPage = 1">
                                    <button class="circle"><i>add</i></button>
                                    <div class="max">
                                        <h6 class="small">{{ $tc("common.add") }}</h6>
                                        <div><span class="link">{{ $tc("join.whoAreYou.add") }}</span></div>
                                    </div>
                                </a>
                            </article>
                        </div>

                        <div class="page right center-align" :class="{ active: secondaryPage == 1 }"> 
                            <form id="join-form" onsubmit="event.preventDefault()">
                                <div class="field label prefix border">
                                    <i>label</i>
                                    <input type="name" v-model="form.name">
                                    <label>{{ $t("common.name") }}</label>
                                </div>

                                <div class="field label prefix suffix border">
                                    <i :class="[ `${ form.color }-text` ]">palette</i>
                                    <select v-model="form.color">
                                        <template v-for="color of getAvailableColors()">
                                            <option :value="color">{{ getColorLabel(color) }}</option>
                                        </template>
                                    </select>
                                    <label>{{ $t("common.color") }}</label>
                                    <i>arrow_drop_down</i>
                                </div>
                            </form>

                            <p v-if="form.error != null" class="error">{{ form.error }}</p>

                            <nav class="right-align">
                                <button form="join-form" @click="complete()">
                                    <i>check</i>
                                    <span>{{ $t("common.finish") }}</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </main>

    <PrivacyPolicyLink />

    <div class="overlay" :class="{ active: errorCode }" @click="errorCode = undefined"></div>

    <dialog class="error" :class="{ active: errorCode }">
        <h5>{{ $t("join.dialog.error.title") }}</h5>
        <div>{{ $t("join.dialog.error.message") }} {{ errorCode }}</div>
        
        <nav class="right-align no-space">
            <button class="error-container no-elevate" @click="errorCode = undefined">
                {{ $t("common.ok") }}
            </button>
        </nav>
    </dialog>
</template>