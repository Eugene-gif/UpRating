<script setup>
import {inject, reactive, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";

const route = useRoute();
// Хранилище
const store = useStore();
// Роли пользователя
let roles = store.profile.role;
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const isPartner = roles.some((role) => role.value === 'ROLE_PARTNER');
const ID = route.params.id;
const router = useRouter();
const crumbList = [
  {
    title: 'Счета',
    path: '/bills',
  },
  {
    title: 'Просмотр счёта',
    path: `/bills/${ID}`,
  },
]

// Диалог удаления/блокировки
const { confirmDelete } = inject("deleteDialog");
// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки
const saving = ref(false);
// Флаг открытия диалога
const showPaymentDialog = ref(false);
const paymentInfo = reactive({
  id: '',
  status: '',
});

if (+ID !== 0) {
  getBills();
}

function getBills() {
  getData(`/admin/bill/${ID}`, METHODS.GET).then((response) => {
    if (response.success) {
      item.value = response.result.item;
    }
  }).finally(() => {
    loading.value = false;
  });
}

function deleteItem() {
  confirmDelete("Удалить", (fn) => {
    getData(`/admin/bill/${ID}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push('/bills');
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
        saving.value = false;
        showPaymentDialog.value = false;
      });
}

function closeDialog() {
  item.value.isPayed = !item.value.isPayed;

  showPaymentDialog.value = false;
}
</script>

<template>
  <div class="q-pa-lg page-header">
    <BreadCrumbs
        :routeList="crumbList"
    />

    <div class="row justify-between items-center">
      <h2 class="text-h4 text-bold q-my-none">Счёт</h2>
      <div class="row q-gutter-md justify-end">
        <q-btn
            v-if="!isOrgAdmin"
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
            @click="$router.push('/bills')"
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
      style="max-width: 800px; border: 1px solid rgba(0, 0, 0, 0.12);"
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
          <template v-if="!isOrgAdmin && !isPartner">
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