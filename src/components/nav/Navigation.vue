<script lang="ts">
import NavigationItems from "./NavigationItems.vue"
import NavigationItem from "./NavigationItem.vue"

export default {
    components: { NavigationItems, NavigationItem }
}
</script>

<template>
    <nav class="left max l">
        <NavigationItems />

        <NavigationItem
            v-if="$ctx.currentUser.value == undefined"
            navId="login"
            route="/login"
            icon="login"
            :label="$t('common.signIn')" />
    </nav>

    <nav class="left m">
        <NavigationItems />

        <NavigationItem
            v-if="$ctx.currentUser.value == undefined"
            navId="login"
            route="/login"
            icon="login"
            :label="$t('common.signIn')" />
    </nav>

    <nav class="bottom s">
        <NavigationItems />

        <NavigationItem
            v-if="$ctx.currentUser.value == undefined"
            navId="login"
            route="/login"
            icon="login"
            :label="$t('common.signIn')" />
    </nav>
</template>