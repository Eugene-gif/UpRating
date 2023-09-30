<script setup>
import {inject, ref} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import GridCard from "@/components/GridCard.vue";
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки
const saving = ref(false);
// Данные для таблицы
const entityList = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
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
// Пагинация
const pagination = ref({
  page: 1,
  pages: 1,
  rowsNumber: 1,
  rowsPerPage: 14,
  descending: false,
});

function getList(query) {
  getData(`/admin/legal_entity?${query}&organization=${ID}`, METHODS.GET)
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
        saving.value = false;
      });
}

function deleteUser(id) {
  confirmDelete('Удалить', (fn) => {
    saving.value = true;

    getData(`/admin/legal_entity/${id}`, METHODS.DELETE)
        .then((response) => {
          getList(`page=${pagination.value.page}&perPage=14`);
        });

    fn();
  });
}

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  pagination.value.page = +value;
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}&organization=${ID}`

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

getList('page=1perPage=14');
</script>

<template>
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
                @click="$router.push(`/organization/${ID}/legal_entity/${props.row.id}`)"
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
              <q-circular-progress
                  v-if="saving"
                  indeterminate
                  size="20px"
                  color="black"
                  class="q-mr-xs"
              />
              <q-icon
                  v-else
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
    class="sticky-table"
    :rows="entityList"
    :loading="loading"
    v-model:pagination="pagination"
    binary-state-sort
    :columns="columns"
    row-key="name"
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
                @click="$router.push(`/organization/${ID}/legal_entity/${props.row.id}`)"
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
              <q-circular-progress
                  v-if="saving"
                  indeterminate
                  size="20px"
                  color="black"
                  class="q-mr-xs"
              />
              <q-icon
                  v-else
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
  <!-- </div> -->
</template>

<style scoped>
.sticky-table {
  height: calc(100vh - 235px);
}

.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}
</style>