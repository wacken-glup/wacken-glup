<script lang="ts">
export default {
    data() {
        return {
            active: false,

            installPrompt: undefined as any
        }
    },
    mounted() {
        window.addEventListener("beforeinstallprompt", (event) => {
            this.installPrompt = event
            this.active = true
        })
    },
    methods: {
        install() {
            this.installPrompt.prompt()
        }
    }
}
</script>

<template>
    <div class="snackbar primary" :class="{ active: active }" @click="install()">
        <div class="max">{{ $t("pwaAdvert") }}</div>

        <button class="fill circle no-elevate" @click="install()">
            <i>add</i>
        </button>
    </div>
</template>