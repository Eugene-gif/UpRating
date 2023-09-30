<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {getDate} from "@/utils/dateFormatter";
import GridCard from "@/components/GridCard.vue";
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Текст из поисковой строки
const searchText = inject('searchText');
// Квазар
const $q = useQuasar();
// Флаг загрузки
const loading = ref(true);
// Данные для таблицы
const settlementsArr = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getData(`/admin/settlements?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        settlementsArr.value = response.result.items;
      });
});

const types = {
  CARD_TYPE: 'Карта',
  SUB_TYPE: 'Подписка',
  BRAND_TYPE: 'Брендирование',
};

// Колонки таблцы
const columns = [
  {
    name: "value",
    required: true,
    label: "Значение",
    align: "left",
    field: "value",
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "profile",
    required: true,
    label: "Тип",
    align: "left",
    field: (row) => types[row.type],
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "value",
    required: true,
    label: "Начало действия",
    align: "left",
    field: 'startDate',
    format: (val) => `${val ? getDate(val) : 'Нет данных'}`,
    sortable: true,
  },
  {
    label: 'Действия',
    name: 'actions',
    field: 'actions',
    align: 'center',
  },
];
// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
  descending: false,
});

getData('/admin/reward_payment_settings', METHODS.GET)
    .then((response) => {
      if (response.success) {
        settlementsArr.value = response.result.items;
        pagination.value = {
          page: response.result.pagination.page,
          pages: response.result.pagination.pages,
          rowsNumber: response.result.pagination.totalCount,
          rowsPerPage: response.result.pagination.perPage,
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/reward_payment_settings?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        settlementsArr.value = response.result.items;
        pagination.value = {
          page: response.result.pagination.page,
          pages: response.result.pagination.pages,
          rowsNumber: response.result.pagination.totalCount,
          rowsPerPage: response.result.pagination.perPage,
          descending: isDesc.value,
          sortBy: sortTitle.value,
        }
      }).finally(() => loading.value = false);
}


function switchPage(value) {
  if (+value > pagination.value.pages) return;

  pagination.value.page = +value;
}
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Настройки</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          color="primary"
          label="Добавить"
          size="12px"
          @click="$router.push('/options/0')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="settlementsArr"
      :loading="loading"
    >
      <template v-slot:actions="props">
        <q-btn-dropdown
          dropdown-icon="more_vert"
          dense
          color="black"
        >
          <q-list>
            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/options/${props.row.id}`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:pagination>
        <q-pagination
          v-model="pagination.page"
          :max="pagination.pages"
          :max-pages="6"
          direction-links
          outline
          color="black"
          active-design="outline"
          active-color="grey"
          active-text-color="black"
        />
      </template>
    </GridCard>
  </div>
  
  <q-table
    v-else
      class="sticky-table"
      :rows="settlementsArr"
      :loading="loading"
      :columns="columns"
      v-model:pagination="pagination"
      binary-state-sort
      row-key="name"
      flat
      square
      :grid="$q.platform.is.mobile"
      @request="onRequest"
  >
    <template #body-cell-actions="props">
      <q-td :props="props">
        <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
        >
          <q-list>
            <q-item
                clickable
                class="items-center"
                @click="$router.push(`/options/${props.row.id}`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-td>
    </template>

    <template #bottom>
      <div class="full-width row justify-between items-center">

        <div class="row q-pa-md items-center">
          <div
              style="font-size: 14px"
          >
            Перейти
          </div>

          <input
              type="number"
              @change="switchPage($event.target.value)"
              style="width: 36px; height: 32px"
              class="q-mx-sm"
          >

          <div style="font-size: 14px">/ {{ pagination.pages }}</div>
        </div>

        <div>
          <q-pagination
              v-model="pagination.page"
              :max="pagination.pages"
              :max-pages="6"
              direction-links
              outline
              color="black"
              active-design="outline"
              active-color="grey"
              active-text-color="black"
          />
        </div>
      </div>
    </template>
  </q-table>
</template>

<style scoped>
.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>