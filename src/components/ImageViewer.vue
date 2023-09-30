<script setup>
import {ref} from 'vue';

const show = ref(false);
</script>

<template>
    <q-btn class="q-mt-lg" @click="show=true" color="primary">
        <slot name="header"></slot>
    </q-btn>

    <q-dialog v-model="show">
        <slot name="body"></slot>
    </q-dialog>
</template>

<style scoped>

</style>
