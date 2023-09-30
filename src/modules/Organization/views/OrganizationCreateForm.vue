<script setup>
import {ref} from "vue";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
// Квазар
const $q = useQuasar();
// Роутер
const route = useRoute();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
  {
    title: 'Создание клиента',
    path: `/organization/create`,
  },
];
// Айди записи
const ID = route.params.id;
// Флаг редактирования
const isEdit = ref(false);
// Флаг загрузки
const loading = ref(false);
// Список организаций
const organizationItem = ref({
  isPartner: false,
  isBlocked: false,
});

// Флаг загрузки партнёров
const partnerLoading = ref(true);
// Список партнёров
const partnersList = ref();

getData(`/admin/partner`, METHODS.GET)
    .then((response) => {
      if (response.success) {
        partnersList.value = response.result.items;
      }
    })
    .finally(() => {
      partnerLoading.value = false;
    });

function saveItem() {
  loading.value = true;

  getData(`/admin/organization`, METHODS.POST, organizationItem.value)
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Запись успешно создана',
            color: 'green',
          });
          router.push('/organization');
        }
      })
      .finally(() => {
        loading.value = false;
      });
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Создание клиента</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          outline
          class="btn-default"
          label="Вернуться назад"
          @click="$router.push('/organization')"
          size="12px"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div style="max-width: 410px">
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm"
    >
      <div class="text-subtitle2">
        Наименование
        <q-input
            v-model="organizationItem.title"
            :rules="[val => !!val || 'Поле должно быть заполнено']"
            dense
            outlined
        />
      </div>

<!--      <div class="text-subtitle2 q-mb-xs">-->
<!--        Имя представителя клиента-->
<!--        <q-input-->
<!--            v-model="organizationItem.decisionMakerName"-->
<!--            :rules="[val => !!val || 'Поле должно быть заполнено']"-->
<!--            dense-->
<!--            outlined-->
<!--        />-->
<!--      </div>-->

<!--      <div class="text-subtitle2 q-mb-md">-->
<!--        Номер телефона представителя клиента-->
<!--        <q-input-->
<!--            v-model="organizationItem.decisionMakerPhone"-->
<!--            mask="+# (###)###-##-##"-->
<!--            :rules="[val => !!val || 'Поле должно быть заполнено']"-->
<!--            outlined-->
<!--            dense-->
<!--        />-->
<!--      </div>-->

<!--      <div class="text-subtitle2 q-my-sm">-->
<!--        Партнёр-->
<!--        <q-checkbox-->
<!--            v-model="organizationItem.isPartner"-->
<!--            class="q-mx-md"-->
<!--            outlined-->
<!--            dense-->
<!--        />-->
<!--      </div>-->

      <div class="text-subtitle2 q-mb-md">
        Партнёр
        <q-select
            v-model="organizationItem.partner"
            :options="partnersList"
            :loading="partnerLoading"
            option-label="organizationPartnerTitle"
            option-value="id"
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <div class="text-subtitle2 q-mb-md">
            Индивидуальная скидка
            <q-input
              v-model.number="organizationItem.discountSize"
              :loading="loading"
              :rules="[val => val <= 70 || 'Скидка не может быть больше 70']"
              dense
              outlined
            />
        </div>

      <div>
        <q-btn
            no-caps
            outline
            class="bg-primary text-white q-mb-lg"
            type="submit"
            label="Сохранить"
            :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>


<style scoped>

</style>