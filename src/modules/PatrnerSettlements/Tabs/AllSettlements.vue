<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";
import GridCard from "@/components/GridCard.vue";
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Роутер
const router = useRouter();
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Меню навигации
const crumbList = [
  {
    title: 'Взаиморасчёты',
    path: '/settlements',
  },
]
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
// Колонки таблцы
const columns = [
  {
    name: "cost",
    required: true,
    label: "Сумма",
    align: "left",
    field: 'cost',
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "date",
    required: true,
    label: "Дата",
    align: "left",
    field: 'date',
    format: (val) => `${val ? getDate(val) : 'Нет данных'}`,
    sortable: true,
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

function getSettlements(query) {
  getData(`/admin/settlements?${query}`, METHODS.GET)
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
}

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  getSettlements(`page=${+value}&perPage=14`);
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/settlements?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
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

getSettlements('page=1&perPage=14');
</script>

<template>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="settlementsArr"
      :loading="loading"
    >
      <template v-slot:pagination>
        <q-pagination
          v-model="pagination.page"
          :max="pagination.pages"
          :max-pages="6"
          @update:model-value="get(`page=${pagination.page}&perPage=14`)"
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
              @update:model-value="get(`page=${pagination.page}&perPage=14`)"
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