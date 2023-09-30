<script setup>
import {ref} from "vue";
import {_copy, getData, METHODS} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
// Квазар
const $q = useQuasar();
// Хранилище
const store = useStore();
// Роли пользователя
const roles = store.profile.role;
// Флаг админа клиента
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
// Роутер
const route = useRoute();
// Роутер
const router = useRouter();
// Айди записи
const ID = route.params.id;
// Флаг загрузки
const loading = ref(false);
// Флаг сохранения
const saving = ref(false);
// Список клиентов
const organizationItem = ref({});
// Флаг загрузки партнёров
const partnerLoading = ref(true);
// Список партнёров
const partnersList = ref();

const reportEnumArray = [
    {
        value: 'EVERY_FIRST_OF_MONTH',
        label: 'Каждое первое число месяца'
    },
    {
        value: 'EVERY_MONDAY',
        label: 'Каждый понедельник'
    },
    {
        value: 'DONT_SEND_AUTOMATICALLY',
        label: 'Без автоматической отправки'
    }
]

getData(`/admin/partner`, METHODS.GET)
    .then((response) => {
      if (response.success) {
        partnersList.value = response.result.items;
      }
    })
    .finally(() => {
      partnerLoading.value = false;
    });

if (ID != 0) {
  loading.value = true;

  getData(`/admin/organization/${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          organizationItem.value = response.result.item;
        }
      })
      .finally(() => {
        loading.value = false;
      });
} else {
  organizationItem.value = {
    title: '',
    decisionMakerName: '',
    decisionMakerPhone: '',
  }

  loading.value = false;
}

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  const editItem = prepareItem(organizationItem.value);

  if (isNew) {
    getData(`/admin/organization`, METHODS.POST, organizationItem.value)
        .then((response) => {
          if (response.success) {
            $q.notify({
              message: 'Запись успешно сохранена',
              color: 'green',
            });

          }
        })
        .finally(() => {
          saving.value = false;
        });
  } else {
    getData(`/admin/organization/${ID}`, METHODS.PUT, editItem)
        .then((response) => {
          if (response.success) {
            $q.notify({
              message: 'Запись успешно обновлена',
              color: 'green',
            });

          }
        })
        .finally(() => {
          saving.value = false;
        });
  }
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  if (cloneItem.partner?.organizationPartner?.id) {
    cloneItem.partner = cloneItem.partner.id;
  }

  return cloneItem;
}
</script>

<template>
  <div
      style="max-width: 410px"
  >
    <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg"
    >
      <div class="text-subtitle2">
        Наименование
        <q-input
            v-model="organizationItem.title"
            :loading="loading"
            :rules="[val => !!val || 'Поле должно быть заполнено']"
            dense
            outlined
        />
      </div>

        <template v-if="isAdmin">
            <div class="text-subtitle2 q-mb-md">
                Настройка автоматического отправления отчетов по картам
                <q-select
                        v-model="organizationItem.reportSendingTime"
                        :options="reportEnumArray"
                        map-options
                        emit-value
                        dense
                        outlined
                />
            </div>
        </template>

      <template v-if="isAdmin">
        <div class="text-subtitle2 q-mb-md">
          Партнёр
          <q-select
              v-model="organizationItem.partner"
              :options="partnersList"
              :loading="partnerLoading"
              :disable="!isAdmin || organizationItem.isPartner"
              :option-label="(row) => row.organizationPartnerTitle ?? row.organizationPartner.title"
              option-value="id"
              map-options
              emit-value
              dense
              outlined
          />
        </div>
      </template>

        <div class="text-subtitle2">
            Индивидуальная скидка
            <q-input
              v-model.number="organizationItem.discount"
              :loading="loading"
              dense
              :rules="[val => val <= 70 || 'Скидка не может быть больше 70']"
              outlined
            />
        </div>

      <div class="q-my-md">
        <q-btn
            no-caps
            color="primary"
            type="submit"
            label="Сохранить"
            :disable="loading"
            :loading="saving"
        />
      </div>
    </q-form>
  </div>
</template>


<style scoped>

</style>