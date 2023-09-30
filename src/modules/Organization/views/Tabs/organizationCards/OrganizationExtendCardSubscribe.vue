<script setup>
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getData, METHODS} from "@/utils/http";
// Роутер
const route = useRoute();
// Роутер
const router = useRouter();
// Айди записи
const ID = route.params.id;
// Айди записи
const ID2 = route.params.id2;
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Список сроков подписки
const subscriptionList = ref([]);
const item = ref({
  nfcTags: [ ID2 ],
  tariffs: [],
});

getData(`/admin/subscription_type`, METHODS.GET).then((response) => {
  if (response.success) {
    subscriptionList.value = response.result.items;
    loading.value = false;
  }
});
function extendSubscribe() {
  saving.value = true;

  getData(`/admin/bill/sub_bill`, METHODS.POST, {
    nfcTags: item.value.nfcTags,
    tariffs: [
        item.value.tariffs
    ]
  }).then((response) => {
    if (response.success) {
      router.push(`/organization/${ID}/card`);
    }
  }).finally(() => saving.value = false);
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Продление подписки</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
            no-caps
            outline
            class="btn-default"
            label="Вернуться к списку"
            size="12px"
            @click="$router.push(router.options.history.state.back)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div style="max-width: 410px">
    <q-form
        @submit="extendSubscribe"
        class="col-6 q-pa-lg q-mt-sm"
    >
      <div class="text-subtitle1">
        Тариф
        <q-select
            v-model="item.tariffs"
            :options="subscriptionList"
            :loading="loading"
            option-label="title"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <q-btn
          no-caps
          outline
          class="bg-primary text-white q-my-lg"
          :loading="saving"
          :disable="loading || item.tariffs.length < 1"
          type="submit"
          label="Продлить"
      />

    </q-form>
  </div>
</template>


<style scoped>

</style>