<script setup>
import {inject, ref, watch} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {useStore} from "@/store/store";
import {getDate} from "@/utils/dateFormatter";
import QrcodeVue from 'qrcode.vue'
import ImageViewer from "@/components/ImageViewer.vue";

// Роутер
const route = useRoute();
const url = import.meta.env.VITE_API_URL;
// Айди записи
const ID = route.params.id;
// Хранилище
const store = useStore();
// Профиль
let storeProfile = store.profile;
const roles = storeProfile.role;
// Флаг админа клиента
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');
const isAdmin = roles.some((role) => role.value === 'ROLE_SUPER_ADMIN');
const isUser = roles.some((role) => role.value === 'ROLE_USER');
// Квазар
const $q = useQuasar();
// Ротуер
const router = useRouter();
// Диалог удаления/блокировки
const {confirmDelete} = inject("deleteDialog");
// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Список пользователей
const userList = ref([]);
// Флаг отвечающий за редактировании записи
const isEdit = ref(false);
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки
const usersLoading = ref(true);
// Флаг загрузки qr-code
const qrLoading = ref(true);
// Флаг сохранения
const saving = ref(false);
// Флаг пустого массива с пользователями
const isEmptyUsers = ref(false);

if (ID != 0) {
  getData(`/admin/nfc_tag/${ID}`, METHODS.GET)
      .then((response) => {
        if (response.success) {
          item.value = response.result.item;

          getUsers(false);
        }
      })
      .finally(() => {
        loading.value = false;
        saving.value = false;
        usersLoading.value = false;
      });
} else {
  item.value = {
    title: '',
    organization: null,
    isBlocked: false,
    activeLink: null,
    links: [],
    user: null,
    isPhysical: true,
    lastSubExpire: null,
    isReviewFollow: false,
    reviewEmail: null,
      type: 'NFC_TAG'
  };

  loading.value = false;
  saving.value = false;
  usersLoading.value = false;
}

getData(`/admin/organization`, METHODS.GET).then((response) => {
  if (response.success) {
    organizationList.value = response.result.items;
  }
});

function saveItem() {
  saving.value = true;
  const isNew = +ID === 0;
  const editedItem = isNew ? null : prepareItem(item.value);

  getData(
      isNew ? "/admin/nfc_tag" : `/admin/nfc_tag/${ID}`,
      isNew ? METHODS.POST : METHODS.PUT,
      isNew ? item.value : editedItem
  )
      .then((response) => {
        if (response.success) {
          $q.notify({
            message: "Карта успешно сохранена",
            color: "green",
          });

          router.push("/cards");
        } else {
          $q.notify({
            message: "Произошла ошибка",
            color: "red",
          });
        }
      })
      .finally(() => {
        saving.value = false;
      });
}

function prepareItem(item) {
  const cloneItem = _copy(item);

  if (cloneItem.organization.id) {
    cloneItem.organization = cloneItem.organization.id;
  }

  if (cloneItem.activeLink?.id) {
    cloneItem.activeLink = cloneItem.activeLink.id;
  }

  if (cloneItem.links?.length) {
    cloneItem.links.forEach((link, index) => {
      if (link.id) {
        cloneItem.links[index] = link.id;
      }
    });
  }

  delete cloneItem.createdAt;
  delete cloneItem.updatedAt;
  delete cloneItem.id;
  delete cloneItem.token;

  return cloneItem;
}

function deleteItem() {
  confirmDelete("Удалить", (fn) => {
    getData(`/admin/nfc_tag/${ID}`, METHODS.DELETE).then((res) => {
      if (res.success) {
        router.push("/cards");
      }
    });

    fn();
  });
}

function getUsers(isNew) {
  if (isNew) item.value.user = null;

  usersLoading.value = true;

  getData(`/admin/user?organization=${item.value.organization.id ?? item.value.organization}`, METHODS.GET).then((response) => {
    if (response.success) {
      userList.value = response.result.items;

      if (userList.value < 1) {
        isEmptyUsers.value = true;
      }
    }
  }).finally(() => usersLoading.value = false);
}

setTimeout(() => {
  qrLoading.value = false;
}, 1000);

function hasPartnerLogo() {
  return storeProfile.organization.partner && storeProfile.organization.partner.logo;
}

function getLogo() {
  if (hasPartnerLogo()) {
    return import.meta.env.VITE_API_URL + '/admin/attachment/download/' + storeProfile.organization.partner.logo.id;
  }

  return '/card_logo.png';
}

const canvasElem = ref(null);
const downloadLink = ref(null);

function svgToCanvas() {
    const canvas = canvasElem.value.querySelector('canvas');
    canvas.toBlob(function(blob) {
        downloadLink.value.href = canvas.toDataURL();
    });
}

watch(canvasElem, (elem, prevElem) => {
    if (elem) {
        svgToCanvas();
    }
});
</script>

<template>
  <div
      class="row card-detail"
      style="max-width: 600px">
    <q-form
        @submit="saveItem"
        class="col-7 q-pa-lg q-mt-sm"
    >
      <div
          v-if="!isOrgAdmin"
          class="text-subtitle2"
      >
        Клиент
        <q-select
            v-model="item.organization"
            :options="organizationList"
            @update:model-value="getUsers(true)"
            :disable="isUser"
            :loading="loading"
            option-label="title"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
            :rules="[(val) => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div class="text-subtitle2 q-mb-xl">
        Название
        <q-input
            dense
            standout="bg-transparent"
            class="q-inp"
            hint="Укажите название qr кода, удобное для распознавания: головной офис, ресепшен, имя сотрудника, который будет ей пользоваться и т.п."
            outlined
            :disable="isUser"
            v-model="item.title"
            :loading="loading"
            :rules="[(val) => !!val || 'Поле должно быть заполнено']"
        />
      </div>

      <div
          v-if="+ID !== 0 && !isUser"
          class="text-subtitle2 q-mb-md"
      >
        Заблокирован
        <q-toggle
            v-model="item.isBlocked"
            :disable="isUser || isOrgAdmin"
        />
      </div>

      <div
          v-if="+ID !== 0 && !isUser"
          class="text-subtitle2"
      >
        Физическая карта
        <q-toggle
            v-model="item.isPhysical"
            disable
        />
      </div>

      <div
          v-if="!loading && !item.links.length && +ID !== 0"
          class="infoCard q-my-sm"
      >
        У вас еще нет ссылок, перейдите в раздел
        <router-link :to="`/cards/${ID}/links`">"Ссылок"</router-link>
        и задайте их.
      </div>

      <div class="text-subtitle2 q-mb-xl">
        Активная ссылка
        <q-select
            v-model="item.activeLink"
            :options="item.links"
            :disable="+ID === 0"
            :loading="loading"
            hint="Выберите из списка ссылку, куда будет перенаправлять ваш qr код. Создать новую ссылку вы можете в разделе 'Ссылки'."
            option-label="title"
            option-value="id"
            emit-value
            map-options
            dense
            outlined
        />
      </div>

      <div
          v-if="+ID === 0"
          class="infoCard q-mb-md"
      >
        После создания карты не забудьте к ней привязать активную ссылку во вкладке "Ссылки карты" для новой карты.
      </div>

      <div
          v-if="isEmptyUsers && +ID !== 0"
          class="q-my-sm infoCard"
      >
        У вас еще нет пользователей, перейдите в раздел
        <router-link :to="`/users`">"Пользователей"</router-link>
        и создайте их.
      </div>

        <div class="text-subtitle2 q-mb-md">
            Отслеживание негативных отзывов
            <q-toggle
                    v-model="item.isReviewFollow"
            />
        </div>

        <template v-if="item.isReviewFollow == true">
            <div class="text-subtitle2 q-mb-md">
                Email для получения негативных отзывов
                <q-input
                        dense
                        standout="bg-transparent"
                        class="q-inp"
                        outlined
                        :disable="isUser"
                        v-model="item.reviewEmail"
                        :loading="loading"
                        :rules="[(val) => !!val || 'Поле должно быть заполнено']"
                />
            </div>
        </template>

      <div class="text-subtitle2 q-mb-lg">
        Пользователь
        <q-select
            v-model="item.user"
            :options="userList"
            :disable="usersLoading || isUser"
            :loading="usersLoading"
            :option-label="(row) => row.profile.fullName"
            :option-value="(row) => row.id"
            hint="Добавьте пользователей в разделе 'Пользователи' и затем выберите из списка пользователя для данного qr кода."
            map-options
            emit-value
            dense
            outlined
        />
      </div>

      <div class="text-subtitle2 q-mb-lg">
        Действие подписки до
        <q-input
            dense
            outlined
            v-model="item.lastSubExpire"
            mask="####-##-##"
            :disable="!isAdmin"
        >
          <template v-slot:append>
            <q-icon
                name="event"
                class="cursor-pointer">
              <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
              >
                <q-date
                    v-model="item.lastSubExpire"
                    mask="YYYY-MM-DD"
                    :disable="!isAdmin"
                >
                  <div class="row items-center justify-end">
                    <q-btn
                        v-close-popup
                        label="Закрыть"
                        color="primary"
                        flat
                    />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="q-my-lg">
        <q-btn
            no-caps
            outline
            class="bg-primary text-white q-mt-sm"
            type="submit"
            label="Сохранить"
            :loading="saving"
            :disable="loading"
        />
      </div>
    </q-form>

    <div
        v-if="+ID !== 0"
        class="qr-card--block text-subtitle2 q-my-lg"
    >
      <q-circular-progress
          v-if="qrLoading"
          indeterminate
          size="50px"
          color="black"
          class="q-ma-md"
      />

      <div
          v-else
      >
      <ImageViewer>
                    <template v-slot:header>
                        Показать QR-код
                    </template>

                    <template v-slot:body>
                        <div class="card-qr">
                            <div class="card-qr--inner">
                                <div class="qr-logo">
                                    <img :src="getLogo()" />
                                </div>

                                <div
                                    class="card-qr--inner-wrap"
                                    ref="canvasElem"
                                >
                                    <QrcodeVue
                                        level="L"
                                        size="190"
                                        :value="`${url}/redirect/${item.token}`"
                                    />
                                </div>
                            </div>

                            <div class="q-pt-md">
                            <a
                                class="download-link"
                                crossorigin="anonymous"
                                download="image.png"
                                ref="downloadLink"
                                href="#"
                            ><q-icon name="download"></q-icon> Скачать QR-код</a>
                            </div>
                        </div>
                    </template>
                </ImageViewer>
      </div>
    </div>
  </div>
</template>

<style scoped>

.card-qr {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
}
.card-qr--inner {
  position: relative;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 25px;
  border-radius: 10px;
  aspect-ratio: 363/565;
  background-color: #000;
}
.card-qr--inner-wrap {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
}
.card-qr--inner-wrap svg {
  display: block;
}
.card-qr--inner:before {
  content: '';
  position: absolute;
  left: 50%;
  top: 20px;
  width: 90px;
  height: 12px;
  margin-left: -45px;
  border-radius: 6px;
  background-color: #fff;
}
.qr-logo {
  width: 230px;
  height: 80px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.qr-logo img {
  width: 100%;
  object-fit: contain;
}

.mobile .qr-card--block {
  margin: 0 24px 0px;
}

.mobile .card-detail {
  flex-direction: column-reverse;
}

.download-link,
.download-link:active {
    text-decoration: none;
    color: #000;;
}
</style>