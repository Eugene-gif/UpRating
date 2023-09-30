<script setup>
import {inject, reactive, ref} from "vue";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "@/store/store";
import GridCard from "@/components/GridCard.vue";
import {getDate} from "@/utils/dateFormatter";
// Роутер
const router = useRouter();
// Роутер
const route = useRoute();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
// Айди записи
const ID = route.params.id;
// Меню навигации
const crumbList = ref(router.currentRoute.value.meta.breadCrumbs);
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Квазар
const $q = useQuasar();
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг сохранения
const paymentSaving = ref(false);
// Флаг загрузки отчёта
const fileLoading = ref(false);
// Флаг открытия диалога
const showPaymentDialog = ref(false);
const paymentInfo = reactive({
  id: '',
  status: '',
});
// Данные для таблицы
const billList = ref([]);
const sortTitle = ref();
const isDesc = ref(true);
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
    name: "isPayed",
    required: true,
    label: "Оплачен",
    align: "left",
    field: "isPayed",
    format: (val) => `${val ?? 'Нет данных'}`,
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
  getData(`/admin/bill?${query}&organization=${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          billList.value = response.result.items;
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

// Изменение состояния оплаты
function switchPayment(id, status) {
  showPaymentDialog.value = true;
  paymentInfo.id = id;
  paymentInfo.status = status;
}

function applyPayment() {
  paymentSaving.value = true;

  getData(`/admin/bill/${paymentInfo.id}`, METHODS.PUT,
      {
        isPayed: paymentInfo.status,
      })
      .then((response) => {
        getBills(`page=${pagination.value.page}&perPage=14`);
      })
      .finally(() => {
        paymentSaving.value = false;
        showPaymentDialog.value = false;
      });
}

function closeDialog() {
  const index = billList.value.findIndex((bill) => bill.id === paymentInfo.id);

  if (index > -1) {

    billList.value[index].isPayed = !billList.value[index].isPayed;
  }

  showPaymentDialog.value = false;
}

// Скачивание отчёта
function sendReport(byEmail, id, fileName) {
  if (byEmail) {
    getData(`/admin/doc/bill_report?bill_id=${id}&send_by_email=true`, METHODS.GET).then((response) => {
      if (response.success) {
        $q.notify({
          message: 'Отчёт успешно выслан на почту!',
          color: 'green',
        });
      }
    });
  } else {
    fileLoading.value = true;
    const token = localStorage.getItem('token');

    fetch(`${import.meta.env.VITE_API_URL}/admin/doc/bill_report?bill_id=${id}`, {
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
    saving.value = true;

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

function onRequest(props) {
  loading.value = true;

  if (props.pagination.sortBy === sortTitle.value) isDesc.value = !isDesc.value;

  sortTitle.value = props.pagination.sortBy;
  const sortQuery = `order=${sortTitle.value}.${isDesc.value ? 'DESC' : 'ASC'}&organization=${ID}`

  getData(
      `/admin/bill?page=${props.pagination.page}&perPage=${props.pagination.rowsPerPage}&${sortQuery}`,
      METHODS.GET,
  )
      .then((response) => {
        billList.value = response.result.items;
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

  getBills(`page=${+value}&perPage=14`);
}

getBills('page=1&perPage=14')
</script>

<template>

  <div v-if="$q.platform.is.mobile">
    <GridCard
      :headers="columns"
      :list="billList"
      :loading="loading"
    >
      <template v-slot:isPayed="props">
        <template v-if="!isPartner">
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
                  clickable
                  @click="sendReport(false, props.row.id, props.row.billNumber)"
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
                  clickable
                  @click="sendReport(true, props.row.id)"
                  class="items-center"
              >
                <q-icon
                    name="email"
                    size="20px"
                    class="q-mr-xs"
                />
                <q-item-section>Выслать счёт</q-item-section>
              </q-item>

              <q-item
                  clickable
                  @click="$router.push(`/organization/${ID}/bill/${props.row.id}`)"
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
                  v-if="!props.row.isPayed"
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
      :rows="billList"
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
      <q-td>
        <q-toggle
          v-model="props.row.isPayed"
          @click="switchPayment(props.row.id, props.row.isPayed)"
        />
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
                clickable
                @click="sendReport(false, props.row.id, props.row.billNumber)"
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
                clickable
                @click="sendReport(true, props.row.id)"
                class="items-center"
            >
              <q-icon
                  name="email"
                  size="20px"
                  class="q-mr-xs"
              />
              <q-item-section>Выслать счёт</q-item-section>
            </q-item>

            <q-item
                clickable
                @click="$router.push(`/organization/${ID}/bill/${props.row.id}`)"
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
                v-if="!props.row.isPayed"
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
              @update:model-value="getBills(`page=${pagination.page}&perPage=14`)"
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
          Вы действительно хотите установить этот счёт {{ paymentInfo.status ? 'оплаченным' : 'неоплаченным'}} ?
        </div>
      </div>

      <div class="full-width q-gutter-md">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :label="paymentInfo.status ? 'Оплатить' : 'Установить'"
            @click="applyPayment"
            :loading="paymentSaving"
        />

        <q-btn
            no-caps
            color="primary"
            label="Отмена"
            @click="closeDialog"
            :disable="paymentSaving"
        />
      </div>
    </q-card>
  </q-dialog>
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