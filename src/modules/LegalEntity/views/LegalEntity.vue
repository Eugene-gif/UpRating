<script setup>
import {inject, onMounted, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useRouter} from "vue-router";
import {useStore} from "@/store/store";
import GridCard from "@/components/GridCard.vue";

// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Хранилище
const store = useStore();
// Роли пользователя
const roles = store.profile.role;
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const tableRef = ref();
const sortTitle = ref();
const isDesc = ref(true);
// Меню навигации
const crumbList = [
  {
    title: 'Юр.лица',
    path: '/legal_entity',
  },
]
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Текст из поисковой строки
const searchText = inject('searchText');
// Флаг загрузки
const loading = ref(true);
// Данные для таблицы
const entityList = ref([]);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getData(`/admin/legal_entity?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        entityList.value = response.result.items;
      });
});
// Колонки таблицы
const columns = [
  {
    name: "title",
    required: true,
    label: "Наименование",
    align: "left",
    field: 'title',
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "tin",
    align: "left",
    label: "ИНН",
    field: "tin",
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "geerbox",
    align: "left",
    label: "КПП",
    field: "geerbox",
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "legalAddress",
    align: "left",
    label: "Адрес юр.лица",
    field: "legalAddress",
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    label: 'Действия',
    name: 'actions',
    field: 'actions',
    align: 'center',
  },
];

if (!isOrgAdmin) {
  columns.splice(4, 0, {
    name: "organization",
    align: "left",
    label: "Клиент",
    field: "organization",
    format: (val) => `${val.title ?? 'Нет данных'}`,
    sortable: true,
  });
}

// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
  descending: false,
});

// Получение записей для таблицы
function getList(query) {
  getData(`/admin/legal_entity?${query}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          entityList.value = response.result.items;
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

function deleteUser(id) {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/legal_entity/${id}`, METHODS.DELETE)
        .then((response) => {
          getList(`page=${pagination.value.page}&perPage=14`);
        });

    fn();
  });
}

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  getList(`page=${value}&perPage=14`)
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/legal_entity?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        entityList.value = response.result.items;
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

getList('page=1&perPage=14');
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Юридические лица</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          color="primary"
          label="Добавить"
          size="12px"
          @click="$router.push('/legal_entity/0')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

<div v-if="$q.platform.is.mobile">
  <GridCard
    :headers="columns"
    :list="entityList"
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
            @click="$router.push(`/legal_entity/${props.row.id}`)"
          >
            <q-icon
              name="info"
              size="20px"
              class="q-mr-xs"
            />
            <q-item-section>Просмотр</q-item-section>
          </q-item>

          <q-item
              clickable
              @click="deleteUser(props.row.id)"
              class="items-center"
          >
            <q-icon
                name="delete"
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
        @update:model-value="getList(`page=${pagination.page}&perPage=14`)"
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
    ref="tableRef"
    row-key="id"
    class="sticky-table"
    :rows="entityList"
    :loading="loading"
    :columns="columns"
    v-model:pagination="pagination"
    binary-state-sort
    flat
    square
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
              @click="$router.push(`/legal_entity/${props.row.id}`)"
            >
              <q-icon
                name="info"
                size="20px"
                class="q-mr-xs"
              />
              <q-item-section>Просмотр</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="deleteUser(props.row.id)"
                class="items-center"
            >
              <q-icon
                  name="delete"
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
              @update:model-value="getList(`page=${pagination.page}&perPage=14`)"
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