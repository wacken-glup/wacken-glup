<script lang="ts">
export default {
    props: {
        plain: Boolean
    },
    data() {
        return {
            privacyPolicyUrl: undefined as string | undefined
        }
    },
    mounted() {
        this.privacyPolicyUrl = import.meta.env.VITE_PRIVACY_POLICY
    }
}
</script>

<template>
    <template v-if="privacyPolicyUrl">
        <template v-if="plain">
            <p class="link"><a class="link underline" :href="privacyPolicyUrl">{{ $t("privacyPolicy") }}</a></p>
        </template>


        <template v-if="!plain">
            <div class="center-align" style="position: fixed; bottom: 65px; width: 100%">
                <p class="link"><a class="link underline" :href="privacyPolicyUrl">{{ $t("privacyPolicy") }}</a></p>
            </div>
        </template>
    </template>
</template>