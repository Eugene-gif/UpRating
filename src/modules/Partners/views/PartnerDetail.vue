<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Меню навигации
const crumbList = [
  {
    title: 'Партнёры',
    path: '/partners',
  },
  {
    title: 'Партнёр',
    path: `/partners/${ID}`,
  },
]
const tab = ref('main');

function deleteItem() {
  confirmDelete("Удалить", (fn) => {
    getData(`/admin/partner/${ID}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push("/partners");
      }
    });

    fn();
  });
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs :routeList="crumbList"/>

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Партнёр</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :disable="+ID === 0"
            label="Удалить"
            @click="deleteItem"
            size="12px"
        />
        <q-btn
            no-caps
            outline
            class="btn-default"
            label="Вернуться к списку"
            size="12px"
            @click="$router.push('/partners')"
        />
        <q-btn
            v-if="tab === 'users'"
            no-caps
            outline
            class="btn-default"
            label="Добавить пользователя"
            size="12px"
            @click="$router.push(`/partners/${ID}/users/0`)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <q-tabs
      class="bg-transparent text-black text-subtitle1 q-mx-md"
      v-model="tab"
      dense
      no-caps
  >
    <q-route-tab :to="`/partners/${ID}/main`" name="main" label="Основная информация"/>
    <q-route-tab v-if="+ID !== 0" :to="`/partners/${ID}/clients`" name="clients" label="Клиенты"/>
    <q-route-tab v-if="+ID !== 0" :to="`/partners/${ID}/settlements`" name="settlements" label="Взаиморасчёты"/>
    <q-route-tab v-if="+ID !== 0" :to="`/partners/${ID}/users`" name="users" label="Пользователи"/>
  </q-tabs>

  <router-view/>
</template>

<style scoped>
</style>