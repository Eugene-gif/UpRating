<script setup>
import {ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";

const route = useRoute();
const ID = route.params.id;
const ID2 = route.params.id2;
const router = useRouter();
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
  {
    title: 'Клиент',
    path: `/organization/${ID}/bill`,
  },
  {
    title: 'Счёт',
    path: `/organization/${ID}/bill/${ID2}`,
  },
];

// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Список карт
const cardsList = ref([]);
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки
const saving = ref(false);

getData(`/admin/bill/${ID2}`, METHODS.GET).then((response) => {
  if (response.success) {
    getTags(response.result.item);
  }
})

getData(`/admin/subscription_type`, METHODS.GET).then((response) => {
  if (response.success) {
    organizationList.value = response.result.items;
  }
});

function getTags(data) {
  getData(`/admin/nfc_tag`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = data;
      cardsList.value = response.result.items;

      item.value.nfcTags.forEach((card, index, nfcTags) => {
        nfcTags[index] = card.id;
      });
    }
  }).finally(() => {
    loading.value = false;
  });
}

function saveItem() {
  saving.value = true;
  const editedItem = prepareItem(item.value);

  getData(`/admin/bill/${ID2}`, METHODS.PUT, editedItem)
      .then((response) => {
        if (response.success) {
          router.push(`/organization/${ID}/bill`);
        }
      })
      .finally(() => {
        saving.value = false;
      });
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  if (cloneItem.legalEntity?.id) {
    cloneItem.legalEntity = cloneItem.legalEntity.id;
  }

  if (cloneItem.nfcTags.length) {
    cloneItem.nfcTags.forEach((tag, index) => {
      if (tag.id) {
        cloneItem.nfcTags[index] = tag.id;
      }
    });
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;

  return cloneItem;
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Редактирование счёта</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          outline
          class="btn-default"
          label="Вернуться к списку"
          @click="router.push(`/organization/${ID}/bill`)"
          size="12px"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div style="max-width: 410px">
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm">
      <div class="text-subtitle2">
        Стоимость
        <q-input
            dense
            standout="bg-transparent"
            class="q-inp"
            outlined
            type="text"
            v-model="item.cost"
            :loading="loading"
        />
      </div>

      <div class="text-subtitle2 q-my-md">
        <q-toggle 
            v-model="item.isPayed"
            label="Оплачен"
        />
      </div>

      <div class="text-subtitle2">
        Юр.лицо
        <q-select
            v-model="item.legalEntity"
            :options="organizationList"
            option-label="title"
            :loading="loading"
            dense
            standout="bg-transparent"
            class="q-inp"
            outlined
            type="text"
        />
      </div>

      <div class="text-subtitle2 q-my-lg">
        Карты
        <q-select
            v-model="item.nfcTags"
            :options="cardsList"
            option-label="title"
            option-value="id"
            :loading="loading"
            multiple
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <!--      <div class="text-subtitle2 q-my-md">-->
      <!--        Тарифы-->
      <!--        <q-select-->
      <!--            v-model="item.organization"-->
      <!--            :options="organizationList"-->
      <!--            option-label="title"-->
      <!--            dense-->
      <!--            standout="bg-transparent"-->
      <!--            class="q-inp"-->
      <!--            outlined-->
      <!--            type="text"-->
      <!--        />-->
      <!--      </div>-->

      <div class="q-my-md">
        <q-btn
            no-caps
            color="primary"
            type="submit"
            label="Сохранить"
            :loading="saving"
            :disable="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>

</style>