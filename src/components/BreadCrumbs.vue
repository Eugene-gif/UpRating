<script setup>
import {ref} from "vue";

const props = defineProps({
  routeList: {
    default: [],
  }
});
</script>

<template>
  <div class="q-pb-md q-gutter-sm mobile-hide">
    <q-breadcrumbs 
        active-color="black" 
        separator-color="grey-5" 
        class="text-grey-5" 
        separator=">"
    >
      <template v-for="crumb in routeList">
        <q-breadcrumbs-el active-class="" :to="crumb.path">{{ crumb.title }}</q-breadcrumbs-el>
      </template>
    </q-breadcrumbs>
  </div>
</template>

<style scoped>

</style>