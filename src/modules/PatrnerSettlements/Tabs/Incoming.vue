<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
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
  getData(`/admin/reward?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        settlementsArr.value = response.result.items;
      });
});
// Колонки таблцы
const columns = [
  {
    name: "organization",
    required: true,
    label: "Клиент",
    align: "left",
    field: (row) => row.organization?.title,
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "type",
    required: true,
    label: "Тип",
    align: "left",
    field: (row) => row.type === 'CARD_TYPE' ? 'Карта' : 'Подписка',
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
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
  getData(`/admin/reward?${query}`, METHODS.GET)
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

function deleteSettlement(id) {
  confirmDelete('Удалить', (fn) => {

    getData(`/admin/reward/${id}`, METHODS.DELETE)
        .then((response) => {
          getSettlements(`page=${pagination.value.page}&perPage=14`);
        });

    fn();
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
      `/admin/reward?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
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
                @click="$router.push(`/settlements/${props.row.id}`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>

            <q-item
                v-if="isAdmin"
                clickable
                @click="deleteSettlement(props.row.id)"
                class="items-center"
            >
              <q-icon
                  name="block"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Удалить</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:pagination>
        <q-pagination
          v-model="pagination.page"
          :max="pagination.pages"
          :max-pages="6"
          @update:model-value="getSettlements(`page=${pagination.page}&perPage=14`)"
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
                @click="$router.push(`/settlements/${props.row.id}`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>

            <q-item
                v-if="isAdmin"
                clickable
                @click="deleteSettlement(props.row.id)"
                class="items-center"
            >
              <q-icon
                  name="block"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Удалить</q-item-section>
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
              @update:model-value="getSettlements(`page=${pagination.page}&perPage=14`)"
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

</style>