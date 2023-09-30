<script setup>
import {inject, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {getData, METHODS} from "@/utils/http";
import BreadCrumbs from '@/components/BreadCrumbs.vue';
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Текущая вкладка
const tab = ref("main");
// Меню навигации
const crumbList = [
  {
    title: 'Расчёты',
    path: '/organization',
  },
];

</script>

<template>
  <div class="q-px-lg q-pt-md">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Расчёты</h2>
    </div>
  </div>

  <q-tabs
      v-model="tab"
      dense
      class="text-black"
      align="justify"
      narrow-indicator
  >
    <q-route-tab :to="`/settlement/incoming`" name="main" label="Начисления"/>
    <q-route-tab :to="`/settlement/settlements`" name="legal_entity" label="Взаиморасчёты"/>
  </q-tabs>

  <q-separator class="separator-color" size="10px"/>

  <div>
    <router-view/>
  </div>
</template>

<style scoped>
</style>
