<script lang="ts">
import { RouterLink } from 'vue-router'

export default {
    props: {
        navId: String,
        route: String,
        icon: String,
        label: String
    },
    mounted() {
        this.update()
    },
    watch: {
        $route() {
            this.update()
        }  
    },
    data() {
        return {
            active: false
        }
    },
    methods: {
        update() {
            this.active = this.$route.meta.navId == this.navId
        }
    }
}
</script>

<template>
    <RouterLink :to="route || ''" :class="{ active: active }">
        <i>{{ icon }}</i>
        <div>{{ label }}</div>
    </RouterLink>
</template>