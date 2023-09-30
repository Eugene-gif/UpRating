<script setup>
import {ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
// Роутер
const route = useRoute();
// Квазар
const $q = useQuasar();
// Айди записи
const ID = route.params.id;
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Настройки',
    path: '/options',
  },
  {
    title: 'Создание настройки',
    path: `/options/${ID}`,
  },
];
// Айтем
const item = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);

if (ID != 0) {
  getData(`/admin/reward_payment_settings/${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
    }
  }).finally(() => {
    loading.value = false;
  });
} else {
  item.value = {
    value: null,
    startDate: null,
    type: null,
  }

  loading.value = false;
}

const types = [
  {
    title: 'Карта',
    type: 'CARD_TYPE',
  },
  {
    title: 'Подписка',
    type: 'SUB_TYPE',
  },
  {
    title: 'Брендирование',
    type: 'BRAND_TYPE',
  }
]

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  item.value.value = +item.value.value;
  const editedItem = isNew ? null : prepareItem(item.value);

  getData(isNew ? '/admin/reward_payment_settings' : `/admin/reward_payment_settings/${ID}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: 'Запись успешно сохранена',
            color: 'green',
          });

          router.push('/options');
        } else {
          $q.notify({
            message: 'Произошла ошибка',
            color: 'red',
          });
        }
      })
      .finally(() => {
        saving.value = false;
      });
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;

  return cloneItem;
}

function deleteItem() {
  getData(`/admin/reward_payment_settings/${ID}`, METHODS.DELETE).then((res) => {
    if (res.success) {
      router.push('/options');
    }
  });
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Настройка</h2>
      <div class="q-gutter-y-sm q-gutter-x-sm">
        <q-btn
            no-caps
            outline
            class="btn-default"
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
            @click="$router.push('/options')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div
      class="q-pa-lg q-mt-sm"
      style="max-width: 410px"
  >
    <q-form
        @submit="saveItem"
        class="q-gutter-sm">
      <div class="text-subtitle2">
        Значение
        <q-input
            v-model="item.value"
            type="number"
            dense
            outlined
            :disable="+ID !== 0"
        />

      </div>

      <div class="text-subtitle2 q-mt-lg">
        Тип
        <q-select
            v-model="item.type"
            :options="types"
            option-label="title"
            option-value="type"
            map-options
            emit-value
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-mb-lg">
        Начало действия
        <q-input
            dense
            outlined
            v-model="item.startDate"
            mask="####-##-##"
        >
          <template v-slot:append>
            <q-icon
                name="event"
                class="cursor-pointer">
              <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
              >
                <q-date
                    v-model="item.startDate"
                    mask="YYYY-MM-DD"
                >
                  <div class="row items-center justify-end">
                    <q-btn
                        v-close-popup
                        label="Закрыть"
                        color="primary"
                        flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="q-my-md">
        <q-btn
            no-caps
            color="primary"
            type="submit"
            label="Сохранить"
            :loading="saving"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
:deep() .q-date__calendar-item > .q-date__today {
  box-shadow: 0 0 1px 0 black;
  border: 1px solid black;
}
</style>