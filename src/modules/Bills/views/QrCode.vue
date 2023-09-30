<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getData, METHODS} from "@/utils/http";
import QrcodeVue from "qrcode.vue";
// Роутер
const router = useRouter();
const route = useRoute();
const ID = route.params.id;
const url = import.meta.env.VITE_API_URL;
const qrLoading = ref(true);
const qrCode = ref();
// Меню навигации
const crumbList = [
  {
    title: "Счета",
    path: "/bills",
  },
  {
    title: "QR-код для оплаты",
    path: `/bills/${ID}/qr`,
  },
];

getData(`/admin/bill/qr/${ID}`, METHODS.GET).then((response) => {
  if (response.success) {
    qrCode.value = response.result;
  }
}).finally(() => qrLoading.value = false);
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs :routeList="crumbList"/>

    <div class="row justify-between items-center page-header">
      <div class="text-h4 text-bold q-my-none">QR-код для оплаты счёта</div>

      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          outline
          class="btn-default"
          label="Вернуться назад"
          size="12px"
          @click="$router.push(router.options.history.state.back)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div class="q-pa-lg q-mt-sm" style="width: 410px">
    <div class="row justify-center q-mx-xl">
      <q-circular-progress
          v-if="qrLoading"
          indeterminate
          size="100px"
          color="black"
      />

      <img
          v-else
          :src="qrCode"
          alt="QR-код для оплаты счёта"
      />
    </div>
  </div>
</template>

<style scoped>
</style>