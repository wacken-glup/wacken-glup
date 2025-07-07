<script lang="ts">
import NavigationItem from "./NavigationItem.vue"

export default {
    data() {
        return {
            selectedPage: "home"
        }
    },
    components: { NavigationItem }
}
</script>

<template>
    <NavigationItem 
        :selected-route="selectedPage"
        navId="home"
        route="/"
        icon="home"
        :label="$t('navigation.overview')" />

    <NavigationItem 
        :selected-route="selectedPage"
        navId="acts"
        route="/acts"
        icon="headphones"
        :label="$t('navigation.acts')" />

    <template v-if="$ctx.currentUser.value != undefined">
        <NavigationItem 
            :selected-route="selectedPage"
            navId="discover"
            route="/discover"
            icon="explore"
            :label="$t('navigation.discover')" />

        <NavigationItem 
            :selected-route="selectedPage"
            navId="members"
            route="/members"
            icon="group"
            :label="$t('navigation.members')" />

        <NavigationItem 
            :selected-route="selectedPage"
            navId="settings"
            route="/settings"
            icon="settings"
            :label="$t('navigation.settings')" />
    </template>
</template>