<script setup>
import {ref} from "vue";
import {getData, uploadImage, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import ImageUploader from "@/components/ImageUploader.vue"
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Айтем
const item = ref({
  organizationPartner: {},
  requisites: {},
});
// Список организаций
const entityList = ref({});
// Массивы справочников
const subLists = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки клиента
const organizationLoading = ref(true);
// Флаг загрузки юр.лиц клиента
const entityLoading = ref(false);
// Флаг сохранения
const saving = ref(false);
// Флаг отображения пароля
const showPass = ref(true);

if (ID != 0) {
  getData(`/admin/partner/${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          item.value = response.result.item;
          Object.assign(item.value, {...item.value.requisites});
          delete item.value.requisites;
        }
      })
      .finally(() => {
        loading.value = false;
      });
} else {
  item.value = {
    organizationPartner: {
      title: '',
    },
    cost: null,
    organizations: null,
  };

  loading.value = false;
}

getRefsLists("organization", "organizationList");
getRefsLists("roles", "roleList");

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  const editedItem = isNew ? null : prepareItem(item.value);

  getData(
    isNew ? "/admin/partner" : `/admin/partner/${ID}`,
    isNew ? METHODS.POST : METHODS.PUT,
    isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: "Партнёр успешно создан",
            color: "green",
          });

          router.push('/partners');
        } else {
          $q.notify({
            message: 'Произошла ошибка',
            color: 'red',
          });
        }
      })
      .finally(() => {
        saving.value = false;
      });
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  if (cloneItem.organizations.length) {
    cloneItem.organizations.forEach((organization, index, organizationList) => {
      if (organization.id) {
        organizationList[index] = organization.id;
      }
    });
  }

  if (logo.value !== null) {
    cloneItem.logo = logo.value;
  } else if (cloneItem.logo !== null && cloneItem.logo.id) {
    cloneItem.logo = cloneItem.logo.id;
  }

  if (cloneItem.organizationPartnerTitle) {
    cloneItem.title = cloneItem.organizationPartner.title;
  }

  if (cloneItem.entityList?.id) {
    cloneItem.entityList = cloneItem.entityList.id;
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;
  delete cloneItem.id;
  delete cloneItem.users;

  return cloneItem;
}

function deleteItem() {
  getData(`/admin/partner/${ID}`, METHODS.DELETE).then((res) => {
    if (res.success) {
      router.push("/partners");
    }
  });
}

function getEntities() {
  item.value.legalEntity = null;
  entityLoading.value = true;

  getRefsLists(`legal_entity?organization=${item.value.organization}`, 'entityList');
}

// Получение справочников
function getRefsLists(refName, refArr) {
  getData(`/admin/${refName}`, METHODS.GET).then((response) => {
    subLists.value[refArr] = response.result.items;
  }).finally(() => {
    organizationLoading.value = false;
    entityLoading.value = false;
  });
}
// Изображение
const image = ref();
const logo = ref(null);

function saveImage(files) {
  image.value = files;
  
  uploadImage(image.value)
    .then((IDs) => {
      logo.value = IDs[0];
    })
    .catch(res => {
      console.log(res);
    });
}

function getSrc(id) {
  return import.meta.env.VITE_API_URL + '/admin/attachment/download/' + id;
}
</script>

<template>
  <div
      style="max-width: 410px;"
  >
    <template v-if="+ID !== 0">
      <q-form
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm"
      >
        <div class="text-subtitle2">
          Название
          <q-input
            v-model="item.organizationPartner.title"
            :loading="loading"
            dense
            outlined
            :rules="[val => !!val || 'Поле должно быть заполнено']"
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Сумма
          <q-input
            type="number"
            dense
            outlined
            disable
            v-model="item.cost"
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Клиенты
          <q-select
            v-model="item.organizations"
            :options="subLists.organizationList"
            :disable="organizationLoading"
            option-label="title"
            option-value="id"
            multiple
            map-options
            emit-value
            outlined
            dense
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Промокод
          <q-input
            v-model="item.code"
            dense
            outlined
            disable
          />
        </div>

        Реквизиты партнёра:

        <div class="text-subtitle2 q-my-lg">
          ИНН
          <q-input
            v-model="item.tin"
            type="number"
            dense
            outlined
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          Номер счёта
          <q-input
            v-model="item.accountNumber"
            type="number"
            dense
            outlined
          />
        </div>

        <div class="text-subtitle2 q-my-lg">
          БИК банка
          <q-input
            v-model="item.bicBank"
            type="number"
            dense
            outlined
          />
        </div>

        <div class="text-subtitle2 q-mb-lg">
          к/с банка
          <q-input
            v-model="item.toFromBank"
            type="number"
            dense
            outlined
          />
        </div>

        <div
          v-if="ID != 0"
          class="row items-start q-col-gutter-md"
        >
          <div class="logo-block">
            <img
              v-if="item && item.logo"
              :src="getSrc(item.logo.id)"
            />
          </div>

          <div class="col-none">
            <ImageUploader
              :title="'Загрузить логотип'"
              @onChange="saveImage"
              :multiple="true"
            />
          </div>
        </div>

        <div class="q-my-md">
          <q-btn
            no-caps
            outline
            class="bg-primary text-white"
            type="submit"
            label="Сохранить"
            :loading="loading || saving"
          />
        </div>
      </q-form>
    </template>

    <q-form
        v-else
        @submit="saveItem"
        class="col-6 q-pa-lg q-mt-sm"
    >
      <div class="text-subtitle2 q-mb-lg">
        Название
        <q-input
          dense
          outlined
          v-model="item.title"
        />
      </div>

      <div class="q-mb-lg">
        <q-btn
          no-caps
          color="primary"
          type="submit"
          label="Сохранить"
          :loading="loading || saving"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
.logo-block {
  width: 300px;
  overflow: hidden;
}
  .logo-block img {
    display: block;
    width: 100%;
  }
</style>