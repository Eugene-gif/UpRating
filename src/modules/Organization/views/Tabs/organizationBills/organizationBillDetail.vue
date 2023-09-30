<script setup>
import {inject, reactive, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useStore} from "@/store/store";

const route = useRoute();
const ID = route.params.id;
const ID2 = route.params.id2;
const router = useRouter();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
const crumbList = [
  {
    title: 'Клиенты',
    path: '/organization',
  },
  {
    title: 'Клиент',
    path: `/organization/${ID}/bill`,
  },
  {
    title: 'Счёт',
    path: `/organization/${ID}/bill/${ID2}`,
  },
];

// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Флаг загрузки
const loading = ref(true);

const saving = ref(false);
// Флаг открытия диалога
const showPaymentDialog = ref(false);
const paymentInfo = reactive({
  id: '',
  status: '',
});

if (+ID2 !== 0) {
  getBills();
}

function getBills() {
  getData(`/admin/bill/${ID2}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
    }
  }).finally(() => {
    loading.value = false;
  });
}

function deleteItem() {
  confirmDelete('Удалить', (fn) => {
    getData(`/admin/bill/${ID2}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push(`/organization/${ID}/bill`);
      }
    });

    fn();
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
        getBills();
      })
      .finally(() => {
        showPaymentDialog.value = false;
        saving.value = false;
      });
}

function closeDialog() {
  item.value.isPayed = !item.value.isPayed;

  showPaymentDialog.value = false;
}

const getDate = (value) => {
  const date = new Date(Date.parse(value));

  function convertUTCDateToLocalDate(date) {
    let newDate = new Date(date);
    let d = newDate;
    return [
          (d.getDate() < 10 ? '0' : '') + d.getDate(),
          ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1),
          d.getFullYear()].join('.') + ' ' +
        [(d.getHours() < 10 ? '0' : '') + d.getHours(),
          (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(),
          (d.getSeconds() < 10 ? '0' : '') + d.getSeconds()].join(':');
  }

  const newTime = convertUTCDateToLocalDate(date);
  return newTime;
};
</script>

<template>
  <div class="q-pa-lg">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center page-header">
      <h2 class="text-h4 text-bold q-my-none">Счёт</h2>
      <div class="row q-gutter-md justify-end">
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
            @click="$router.push(`/organization/${ID}/bill`)"
        />
      </div>
    </div>
  </div>

  <q-separator class="separator-color" size="10px"/>

  <q-circular-progress
      v-if="loading"
      indeterminate
      size="50px"
      color="primary"
      class="q-ma-md"
  />

  <div
      v-else
      class="column q-ma-lg q-mt-sm"
      style="max-width: 800px;"
  >
    <table>
      <tr>
        <th>Номер счёта:</th>
        <td>{{ item.billNumber ?? 'Нет данных' }}</td>
      </tr>

      <tr>
        <th>Стоимость:</th>
        <td>{{ item.cost ?? 'Нет данных' }}</td>
      </tr>

      <tr>
        <th>Дата создания:</th>
        <td>{{ item.createdAt ? getDate(item.createdAt) : 'Нет данных' }}</td>
      </tr>

      <tr>
        <th>Оплачен</th>
        <td>
          <template v-if="!isPartner">
            <q-toggle
                v-model="item.isPayed"
                @click="switchPayment(item.id, item.isPayed)"
            />
          </template>

          <template v-else>
            {{ item.isPayed ? 'Оплачен' : 'Не оплачен'}}
          </template>
        </td>
      </tr>

      <tr>
        <th>Дата оплаты</th>
        <td>{{ item.payedAt ? getDate(item.payedAt) : 'Нет данных' }}</td>
      </tr>

      <tr>
        <th>Юр.лицо</th>
        <td>{{ item.legalEntity?.title ?? 'Нет данных' }}</td>
      </tr>

      <tr>
        <th>Номера карт</th>
        <td>
          <template
              v-for="card in item.nfcTags"
              :key="card.token"
          >
            <div class="text-subtitle1">
              &#x2022; {{ card.token ?? 'Нет данных' }}
            </div>
          </template>
        </td>
      </tr>
    </table>
  </div>

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
table, th, td {
  border-collapse: collapse;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

th, tr {
  text-align: center;
}
</style>