<script setup>
import {inject, reactive, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";
import GridCard from "@/components/GridCard.vue";
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа организации
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
// Флаг суперадмина
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Меню навигации
const crumbList = [
  {
    title: 'Счета',
    path: '/bills',
  },
];
// Текст из поисковой строки
const searchText = inject('searchText');
// Диалог блокировки/удаления
const {confirmDelete} = inject('deleteDialog');
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг загрузки отчёта
const fileLoading = ref(false);
// Флаг отправки отчёта
const fileSending = ref(false);
// Флаг открытия диалога
const showPaymentDialog = ref(false);
const paymentInfo = reactive({
  id: '',
  status: '',
});
// Данные для таблицы
const billsList = ref([]);
// Слово, по которому производится сортировка
const sortTitle = ref();
// Флаг сортировки по убыванию
const isDesc = ref(true);
// Если смотритель получает значение из поисковой строки, он делает выборку по массиву элементов таблицы
watch(searchText, () => {
  getBills(`search=${searchText.value}`);
});

// Колонки таблицы
const columns = [
  {
    name: "billNumber",
    required: true,
    label: "Номер счёта",
    align: "left",
    field: "billNumber",
    format: (val) => `${val ?? 'Нет данных'}`,
    sortable: true,
  },
  {
    name: "cost",
    required: true,
    label: "Стоимость",
    align: "left",
    field: "cost",
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    name: "date",
    required: true,
    label: "Дата создания",
    align: "left",
    field: "date",
    format: (val) => val ? getDate(val) : 'Нет данных',
    sortable: true,
  },
  {
    name: "payedAt",
    required: true,
    label: "Дата оплаты",
    align: "left",
    field: "payedAt",
    format: (val) => val ? getDate(val) : 'Нет данных',
    sortable: true,
  },
  {
    name: "legalEntity",
    required: true,
    label: "Плательщик",
    align: "left",
    field: (val) => val,
    format: (val) => val ? getValue(val) : 'Нет данных',
    sortable: true,
  },
  {
    name: "nfcTags",
    required: true,
    label: "Карты",
    align: "left",
    field: (row) => row.nfcTags?.length,
    format: (val) => `${val ?? 'Нет данных'}`,
  },
  {
    label: 'Действия',
    name: 'actions',
    field: 'actions',
    align: 'center',
  },
];

if (isAdmin) {
  columns.splice(4, 0, {
    name: "isPayed",
    required: true,
    label: "Оплачен",
    align: "left",
    field: "isPayed",
    format: (val) => `${val ?? 'Нет данных'}`,
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

// Получение записей таблицы
function getBills(query) {
  loading.value = true;

  getData(`/admin/bill?${query}`, METHODS.GET)
    .then((response) => {
      if (response.success) {
        billsList.value = response.result.items;
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

// Изменение состояния оплаты
function switchPayment(id, status) {
  showPaymentDialog.value = true;
  paymentInfo.id = id;
  paymentInfo.status = status;
}

function applyPayment() {
  saving.value = true;

  getData(`/admin/bill/${paymentInfo.id}`, METHODS.PUT,
      {
        isPayed: paymentInfo.status,
      })
      .then((response) => {
        getBills(`page=${pagination.value.page}&perPage=14`);
      })
      .finally(() => {
        saving.value = false;
        showPaymentDialog.value = false;
      });
}

function closeDialog() {
  const index = billsList.value.findIndex((bill) => bill.id === paymentInfo.id);

  if (index > -1) {

    billsList.value[index].isPayed = !billsList.value[index].isPayed;
  }

  showPaymentDialog.value = false;
}

// Скачивание отчёта
function sendReport(byEmail, id, fileName, url) {
  if (byEmail) {
    fileSending.value = true;

    getData(`/admin/doc/${url}?bill_id=${id}&send_by_email=true`, METHODS.GET).then((response) => {
      if (response.success) {
        $q.notify({
          message: 'Отчёт успешно выслан на почту!',
          color: 'green',
        });
      }
    }).finally(() => fileSending.value = false);
  } else {
    fileLoading.value = true;
    const token = localStorage.getItem('token');

    fetch(`${import.meta.env.VITE_API_URL}/admin/doc/${url}?bill_id=${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        'authorization': `Bearer ${token}`,
      }
    })
        .then((res) => res.blob())
        .then((res) => {
          const aElement = document.createElement('a');
          aElement.setAttribute('download', fileName);
          const href = URL.createObjectURL(res);
          aElement.href = href;
          aElement.setAttribute('target', '_blank');
          aElement.click();
          URL.revokeObjectURL(href);
        }).finally(() => {
      fileLoading.value = false;
    })
  }
}

function deleteBill(id) {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/bill/${id}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        $q.notify({
          message: 'Запись успешно удалена',
          color: 'green'
        })
      }

      getBills(`page=${pagination.value.page}&perPage=14`);
    });

    fn();
  });
}

function switchPage(value) {
  if (+value > pagination.value.pages) return;

  getBills(`page=${+value}&perPage=14`);
}

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}`

  getData(
    `/admin/bill?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
    METHODS.GET,
  )
    .then((response) => {
      billsList.value = response.result.items;
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

function getValue(val) {
  let value;
  if (val.organization?.title) {
    value = val.organization?.title;
  }

  if (val.legalEntity?.title) {
    value += ` / ${val.legalEntity?.title}`;
  }

  return value;
}

getBills('page=1&perPage=14');
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Счета</h2>

      <div class="row q-gutter-md justify-end">
        <q-btn
            no-caps
            color="primary"
            label="Продлить подписку на карту"
            size="12px"
            @click="$router.push('/bills/subscribe')"
        />

          <q-btn
                  no-caps
                  color="primary"
                  label="Продлить подписку на Qr код"
                  size="12px"
                  @click="$router.push('/bills/subscribe_qr')"
          />

        <q-btn
            v-if="!isOrgAdmin"
            no-caps
            outline
            class="btn-default"
            label="Договор-оферта"
            href="https://uprating.org/offer"
            target="_blank"
            size="12px"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

<div v-if="$q.platform.is.mobile">
  <GridCard
    :headers="columns"
    :list="billsList"
    :loading="loading"
  >
  <template v-slot:isPayed="props">
    <template v-if="isAdmin">
      <q-toggle
        v-model="props.row.isPayed"
        @click="switchPayment(props.row.id, props.row.isPayed)"
      />
    </template>

    <template v-else>
      {{ props.row.isPayed ? 'Оплачен' : 'Не оплачен' }}
    </template>
  </template>

  <template v-slot:actions="props">
      <q-btn-dropdown
        dropdown-icon="more_vert"
          dense
          color="black"
      >
        <q-list>
          <q-item
              color="black"
              clickable
              class="items-center"
              @click="$router.push(`/bills/${props.row.id}/qr`)"
          >
            <q-icon
                name="pin"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>QR код для оплаты</q-item-section>
          </q-item>

          <q-item
              v-if="props.row.isPayed & props.row.legalEntity"
              clickable
              @click="sendReport(false, props.row.id, props.row.billNumber, 'act_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileLoading"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="sticky_note_2"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Скачать акт</q-item-section>
          </q-item>

          <q-item
              v-else-if="props.row.legalEntity"
              clickable
              @click="sendReport(false, props.row.id, props.row.billNumber, 'bill_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileLoading"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="sticky_note_2"
                size="20px"
                class="q-mr-xs"
            />
            
            <q-item-section>Скачать счёт</q-item-section>
          </q-item>

          <q-item
              v-if="props.row.isPayed & props.row.legalEntity"
              clickable
              @click="sendReport(true, props.row.id, props.row.billNumber,'act_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileSending"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="email"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Выслать акт</q-item-section>
          </q-item>

          <q-item
              v-else-if="props.row.legalEntity"
              clickable
              @click="sendReport(true, props.row.id, props.row.billNumber,'bill_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileSending"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="email"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Выслать счёт</q-item-section>
          </q-item>

          <q-item
              clickable
              @click="$router.push(`/bills/${props.row.id}`)"
              class="items-center"
          >
            <q-icon
                name="info"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Подробнее</q-item-section>
          </q-item>

          <q-item
              v-if="!isOrgAdmin && !props.row.isPayed"
              clickable
              @click="deleteBill(props.row.id)"
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
        @update:model-value="getBills(`page=${pagination.page}&perPage=14`)"
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
  :rows="billsList"
  :loading="loading"
  :columns="columns"
  v-model:pagination="pagination"
  binary-state-sort
  row-key="name"
  flat
  square
  @request="onRequest"
>
  <template #body-cell-isPayed="props">
    <q-td v-if="isAdmin">
      <q-toggle
        v-model="props.row.isPayed"
        @click="switchPayment(props.row.id, props.row.isPayed)"
      />
    </q-td>
    <q-td v-else>
      {{ props.row.isPayed ? 'Оплачен' : 'Не оплачен' }}
    </q-td>
  </template>

  <template #body-cell-actions="props">
    <q-td>
      <q-btn-dropdown
        dropdown-icon="more_vert"
        flat
        dense
      >
        <q-list>
          <q-item
              clickable
              class="items-center"
              @click="$router.push(`/bills/${props.row.id}/qr`)"
          >
            <q-icon
                name="pin"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>QR код для оплаты</q-item-section>
          </q-item>

          <q-item
              v-if="props.row.isPayed & props.row.legalEntity"
              clickable
              @click="sendReport(false, props.row.id, props.row.billNumber, 'act_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileLoading"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="sticky_note_2"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Скачать акт</q-item-section>
          </q-item>

          <q-item
              v-else-if="props.row.legalEntity"
              clickable
              @click="sendReport(false, props.row.id, props.row.billNumber, 'bill_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileLoading"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="sticky_note_2"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Скачать счёт</q-item-section>
          </q-item>

          <q-item
              v-if="props.row.isPayed & props.row.legalEntity"
              clickable
              @click="sendReport(true, props.row.id, props.row.billNumber,'act_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileSending"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="email"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Выслать акт</q-item-section>
          </q-item>

          <q-item
              v-else-if="props.row.legalEntity"
              clickable
              @click="sendReport(true, props.row.id, props.row.billNumber,'bill_report')"
              class="items-center"
          >
            <q-circular-progress
                v-if="fileSending"
                indeterminate
                size="20px"
                color="black"
                class="q-mr-xs"
            />

            <q-icon
                v-else
                name="email"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Выслать счёт</q-item-section>
          </q-item>

          <q-item
              clickable
              @click="$router.push(`/bills/${props.row.id}`)"
              class="items-center"
          >
            <q-icon
                name="info"
                size="20px"
                class="q-mr-xs"
            />
            <q-item-section>Подробнее</q-item-section>
          </q-item>

          <q-item
              v-if="!isOrgAdmin && !props.row.isPayed"
              clickable
              @click="deleteBill(props.row.id)"
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
              style=""
              class="q-mx-sm q-px-xs"
          >

          <div style="font-size: 14px">/ {{ pagination.pages }}</div>
        </div>

        <div>
          <q-pagination
              v-model="pagination.page"
              :max="pagination.pages"
              :max-pages="6"
              @update:model-value="getBills(`page=${pagination.page}&perPage=14`)"
              direction-links
              outline
              color="black"
              active-design="outline"
              active-text-color="black"
          />
        </div>
      </div>
    </template>
  </q-table>


  <q-dialog
      no-esc-dismiss
      no-backdrop-dismiss
      v-model="showPaymentDialog"
  >
    <q-card
        class="column items-center justify-evenly text-center q-pa-lg"
        style="max-width: 390px; max-height: 380px"
    >
      <div class="q-mb-lg">
        <div class="text-h6 text-bold">
          Вы действительно хотите установить этот счёт {{ paymentInfo.status ? 'оплаченным' : 'неоплаченным' }} ?
        </div>
      </div>

      <div class="full-width q-gutter-md">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :label="paymentInfo.status ? 'Оплатить' : 'Установить'"
            @click="applyPayment"
            :loading="saving"
        />

        <q-btn
            no-caps
            color="primary"
            label="Отмена"
            @click="closeDialog"
            :disable="saving"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.q-table__bottom {
  position: sticky;
  bottom: 0;
  z-index: 1111
}

.btn-round {
  border-radius: 5px;
}
</style>