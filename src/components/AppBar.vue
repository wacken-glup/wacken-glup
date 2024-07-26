<script lang="ts">
export default {
    props: {
        label: {
            type: String
        }
    }
}
</script>

<template>
    <header>
        <nav>
            <slot name="prepend"></slot>

            <h5 class="max center-align">{{ label }}</h5>

            <button class="circle transparent" 
                v-if="$ctx.systemDarkMode.value" @click="$ctx.systemDarkMode.value = false; $ctx.darkMode.value = false">

                <i class="ignore-hover-fill">sync</i>
            </button>

            <button class="circle transparent" 
                v-if="!$ctx.darkMode.value && !$ctx.systemDarkMode.value" @click="$ctx.darkMode.value = true">

                <i class="ignore-hover-fill">light_mode</i>
            </button>

            <button class="circle transparent" 
                v-if="$ctx.darkMode.value && !$ctx.systemDarkMode.value" @click="$ctx.systemDarkMode.value = true">

                <i class="ignore-hover-fill">dark_mode</i>
            </button>

            <button v-if="$ctx.currentUser.value?.photoURL" class="circle transparent" @click="$router.push('/login')">
                <img class="responsive" :src="$ctx.currentUser.value?.photoURL">
            </button>
        </nav>
    </header>
</template>