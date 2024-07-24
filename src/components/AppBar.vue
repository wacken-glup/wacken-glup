<script lang="ts">
export default {
    props: {
        label: {
            type: String
        }
    },
    methods: {
        toggleMode() {
            if(this.$ctx.darkMode.value && !this.$ctx.systemDarkMode.value) {
                this.$ctx.systemDarkMode.value = true
            }else if(this.$ctx.darkMode.value && this.$ctx.systemDarkMode.value) {
                this.$ctx.systemDarkMode.value = false
                this.$ctx.darkMode.value = false
            }else if(!this.$ctx.darkMode.value && !this.$ctx.systemDarkMode.value) {
                this.$ctx.darkMode.value = true
            }else if(!this.$ctx.darkMode.value && this.$ctx.systemDarkMode.value) {
                this.$ctx.systemDarkMode.value = false
                this.$ctx.darkMode.value = true
            }
        }
    }
}
</script>

<template>
    <header>
        <nav>
            <slot name="prepend"></slot>

            <h5 class="max center-align">{{ label }}</h5>

            <button class="circle transparent" @click="toggleMode()">
                <i class="ignore-hover-fill">
                    {{ 
                        ($ctx.systemDarkMode.value) ? "sync"
                            : ($ctx.darkMode.value == true) ? 'dark_mode' : 'light_mode'    
                    }}
                </i>
            </button>

            <button v-if="$ctx.currentUser.value?.photoURL" class="circle transparent" @click="$router.push('/login')">
                <img class="responsive" :src="$ctx.currentUser.value?.photoURL">
            </button>
        </nav>
    </header>
</template>