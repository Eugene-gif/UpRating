<script setup>
import {ref} from "vue";
import {getData, uploadImage, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
import {copyToClipboard} from 'quasar';
import ImageUploader from "@/components/ImageUploader.vue";
// Роутер
const route = useRoute();
// Квазар
const $q = useQuasar();
// Роутер
const router = useRouter();
// Меню навигации
const crumbList = [
    {
        title: 'Мои реквизиты',
        path: '/requisites',
    },
]
// Айтем
const item = ref({
    partner: {},
});
// Флаг загрузки
const loading = ref(true);
// Флаг загрузки партнёров
const partnerLoading = ref(true);
// Флаг сохранения
const saving = ref(false);

getData(`/admin/requisites/self`, METHODS.GET).then((response) => {
    if (response.success) {
        item.value = response.result.item;
    }
}).finally(() => {
    loading.value = false;
});

function saveItem() {
    saving.value = true;

    const editedItem = prepareItem(item.value);

    getData(
        `/admin/requisites/${item.value.id}`,
        METHODS.PUT,
        {...editedItem}
    )
        .then((response) => {
            if (response.success) {
                $q.notify({
                    message: 'Реквизиты успешно сохранены',
                    color: 'green',
                });

                router.push('/requisites');
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

    if (attachment.value !== null) {
        cloneItem.partner.logo = attachment.value;
    } else if (cloneItem.partner.logo !== null && cloneItem.partner.logo.id) {
        cloneItem.partner.logo = cloneItem.partner.logo.id;
    }

    delete cloneItem.id;
    delete cloneItem.createdAt;
    delete cloneItem.updatedAt;

    return cloneItem;
}


function copyPromo() {
    copyToClipboard(item.value.partner.code).then(() => {
        $q.notify({
            message: 'Промокод скопирован в буфер обмена',
            color: 'green',
        });
    })
}

// Изображение
const image = ref();

const attachment = ref(null);

function saveImage(files) {
    image.value = files;

    uploadImage(image.value).then((IDs) => {
        attachment.value = IDs[0];
    });
}

function getSrc(id) {
    return import.meta.env.VITE_API_URL + '/admin/attachment/download/' + id;
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Мои реквизиты</h2>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <div
            style="max-width: 410px"
    >
        <q-form
                @submit="saveItem"
                class="col-6 q-pa-lg ">
            <div class="text-subtitle2 q-my-lg">
                ИНН
                <q-input
                        v-model="item.tin"
                        dense
                        outlined
                />
            </div>

            <div class="text-subtitle2 q-mb-lg">
                Номер счёта
                <q-input
                        v-model="item.accountNumber"
                        dense
                        outlined
                />
            </div>

            <div class="text-subtitle2 q-my-lg">
                БИК банка
                <q-input
                        v-model="item.bicBank"
                        dense
                        outlined
                />
            </div>

            <div class="text-subtitle2 q-mb-lg">
                к/с банка
                <q-input
                        v-model="item.toFromBank"
                        dense
                        outlined
                />
            </div>

            <div class="text-subtitle2 q-mb-lg">
                Промокод
                <q-input
                        v-model="item.partner.code"
                        dense
                        outlined
                        readonly
                >
                    <template #append>
                        <q-icon
                                name="content_copy"
                                class="cursor-pointer"
                                @click="copyPromo"
                        />
                    </template>
                </q-input>
            </div>

            <div class="logo-block">
                <img
                        v-if="item && item.partner.logo"
                        :src="getSrc(item.partner.logo.id)"
                />
            </div>

            <div class="row items-start q-col-gutter-md">
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