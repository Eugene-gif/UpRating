<script setup>
import {inject, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import GridCard from "@/components/GridCard.vue";
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
  {
    title: 'Партнёры',
    path: '/partners',
  },
]
// Текст из поисковой строки
const searchText = inject('searchText');
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Квазар
const $q = useQuasar();
// Флаг загрузки
const loading = ref(true);
// Данные для таблицы
const partnersList = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getData(`/admin/partner?search=${searchText.value}`, METHODS.GET)
      .then((response) => {
        partnersList.value = response.result.items;
      });
});
// Колонки таблицы
const columns = [
  {
    name: "organizationPartnerTitle",
    required: true,
    label: "Наименование",
    align: "left",
    field: "organizationPartnerTitle",
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "cost",
    required: true,
    label: "Сумма",
    align: "left",
    field: "cost",
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "code",
    required: true,
    label: "Код",
    align: "left",
    field: "code",
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

function getPartners(query) {
  getData(`/admin/partner?${query}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          partnersList.value = response.result.items;
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

function deletePartner(id) {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/partner/${id}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        $q.notify({
          message: 'Запись успешно удалена',
          color: 'green'
        })
      }

      getPartners(`page=${pagination.value.page}&perPage=14`);
    });

    fn();
  });
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
      `/admin/partner?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        partnersList.value = response.result.items;
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

  getPartners(`page=${+value}&perPage=14`);
}

getPartners('page=1&perPage=14');
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Партнёры</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
          no-caps
          outline
          class="bg-primary text-white"
          label="Добавить"
          size="12px"
          @click="$router.push('/partners/0/main')"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="partnersList"
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
                @click="$router.push(`/partners/${props.row.id}/main`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="deletePartner(props.row.id)"
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
          @update:model-value="getPartners(`page=${pagination.page}&perPage=14`)"
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
    :rows="partnersList"
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
                @click="$router.push(`/partners/${props.row.id}/main`)"
            >
              <q-icon
                  name="info"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Подробнее</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="deletePartner(props.row.id)"
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
              @update:model-value="getPartners(`page=${pagination.page}&perPage=14`)"
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