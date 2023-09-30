<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";

// Роутер
const route = useRoute();
// Квазар
const $q = useQuasar();
// Ротуер
const router = useRouter();
const url = import.meta.env.VITE_API_URL;
// Айди записи
const ID = route.params.id;
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
const isUser = roles.some((role) => role.value === 'ROLE_USER');
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
// Диалог удаления/блокировки
const {confirmDelete} = inject("deleteDialog");
// Текущая вкладка
const tab = ref('main');
// Меню навигации
const crumbList = [
  {
    title: 'Карты',
    path: '/cards',
  },
  {
    title: 'Карта',
    path: `/cards/${ID}`,
  },
];

function deleteItem() {
  confirmDelete("Удалить", (fn) => {
    getData(`/admin/nfc_tag/${ID}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push("/cards");
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
      <h2 class="text-h4 text-bold q-my-none">Карта</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
          v-if="tab === 'main' && !isUser"
          no-caps
          color="primary"
          label="Продлить подписку"
          :disable="+ID === 0"
          @click="router.push(`/cards/${ID}/extend`)"
          target="_blank"
          size="12px"
        />

        <q-btn
          v-if="tab === 'main' && !isUser"
          no-caps
          outline
          class="btn-default"
          label="Составить отчёт"
          :disable="+ID === 0"
          size="12px"
          @click="$router.push(`/cards/${ID}/report`)"
        />

        <q-btn
          v-if="tab === 'main' && isAdmin"
          no-caps
          outline
          class="btn-default"
          :disable="+ID === 0"
          label="Удалить"
          size="12px"
          @click="deleteItem"
        />

        <q-btn
          v-if="tab === 'links'"
          color="primary"
          class="btn-default"
          label="Создать ссылку"
          size="12px"
          @click="$router.push(`/cards/${ID}/link/0`)"
        />

        <q-btn
          no-caps
          outline
          class="btn-default"
          label="Вернуться к списку"
          size="12px"
          @click="$router.push('/cards')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <q-tabs
      v-model="tab"
      dense
      class="text-black"
      align="center"
      narrow-indicator
  >
    <q-route-tab :to="`/cards/${ID}/main`" name="main" label="Основная информация"/>
    <q-route-tab :disable="+ID === 0" :to="`/cards/${ID}/links`" name="links" label="Ссылки карты"/>
  </q-tabs>


  <router-view/>
</template>

<style scoped>
</style>