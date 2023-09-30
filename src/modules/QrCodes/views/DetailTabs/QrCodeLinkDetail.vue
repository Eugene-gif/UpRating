<script setup>
import {ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
// Роутер
const route = useRoute();
// Айди записи
const ID = route.params.id;
const ID2 = route.params.id2;
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
    {
        title: 'QR коды',
        path: '/qr_codes',
    },
    {
        title: 'QR код',
        path: `/qr_codes/${ID}`,
    },
    {
        title: 'Ссылка QR кода',
        path: `/qr_codes/${ID}/link/${ID2}`,
    },
]
// Айтем
const item = ref({});
// Список клиентов
const partnerList = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки партнёров
const partnerLoading = ref(true);
// Флаг сохранения
const saving = ref(false);

if (ID2 != 0) {
    getData(`/admin/link/${ID2}`, METHODS.GET).then((response) => {
        if (response.success) {
            item.value = response.result.item;
        }
    }).finally(() => {
        loading.value = false;
    });
} else {
    item.value = {
        title: null,
        url: null,
        nfcTags: null,
    }

    loading.value = false;
}

getData(`/admin/nfc_tag`, METHODS.GET).then((response) => {
    if (response.success) {
        partnerList.value = response.result.items;

        if (+ID2 === 0) {
            item.value.nfcTags = [ID];
        }
    }
}).finally(() => partnerLoading.value = false);

function saveItem() {
    saving.value = true;
    const isNew = ID2 == 0;
    const editedItem = isNew ? null : prepareItem(item.value);

    getData(isNew ? '/admin/link' : `/admin/link/${ID2}`,
        isNew ? METHODS.POST : METHODS.PUT,
        isNew ? item.value : editedItem
    )
        .then((response) => {
            if (response.success) {
                $q.notify({
                    message: 'Запись успешно сохранена',
                    color: 'green',
                });

                router.push(`/qr_codes/${ID}/links`);
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

    if (cloneItem.nfcTags.length) {
        cloneItem.nfcTags.forEach((tag, index) => {
            if (tag.id) {
                cloneItem.nfcTags[index] = tag.id;
            }
        });
    }

    delete cloneItem.createdAt;
    delete cloneItem.updatedAt;

    return cloneItem;
}

function deleteItem() {
    getData(`/admin/link/${ID}`, METHODS.DELETE).then((res) => {
        if (res.success) {
            router.push(`/qr_codes/${ID}/links`);
        }
    });
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Ссылка</h2>
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
                        @click="$router.push(`/cards/${ID}/links`)"
                />
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <div
            style="max-width: 410px"
    >
        <q-form
                @submit="saveItem"
                class="col-6 q-pa-lg q-mt-sm"
        >
            <div class="text-subtitle2">
                Название
                <q-input
                        dense
                        standout="bg-transparent"
                        class="q-inp"
                        outlined
                        type="text"
                        v-model="item.title"
                        :loading="loading"
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />
            </div>

            <div class="text-subtitle2">
                Ссылка
                <q-input
                        dense
                        standout="bg-transparent"
                        class="q-inp"
                        outlined
                        v-model="item.url"
                        :loading="loading"
                        label="https://example.com"
                        :rules="[
                val => !!val || 'Поле должно быть заполнено',
                val => val.includes('http') || 'Введите корректную ссылку'
                ]"
                />
            </div>

            <div class="text-subtitle2">
                Qr код
                <q-select
                        v-model="item.nfcTags"
                        :options="partnerList"
                        :disable="partnerLoading || +ID2 === 0"
                        :loading="partnerLoading"
                        option-label="title"
                        option-value="id"
                        emit-value
                        map-options
                        multiple
                        dense
                        outlined
                        :rules="[val => !!val || 'Поле должно быть заполнено']"
                />
            </div>

            <div class="q-my-md">
                <q-btn
                        no-caps
                        color="primary"
                        type="submit"
                        label="Сохранить"
                        :loading="saving"
                />
            </div>
        </q-form>
    </div>
</template>

<style scoped>
</style>