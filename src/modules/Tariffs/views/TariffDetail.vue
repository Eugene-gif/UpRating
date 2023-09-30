<script setup>
import {inject, ref} from "vue";
import {getData, METHODS, _copy} from "@/utils/http";
import {useRoute, useRouter} from "vue-router";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import {useQuasar} from "quasar";
// Роутер
const route = useRoute();
// Роутер
const $q = useQuasar();
// Айди записи
const ID = route.params.id;
// Роутер
const router = useRouter();
// Диалог удаления/блокировки
const {confirmDelete} = inject('deleteDialog');
// Меню навигации
const crumbList = [
    {
        title: 'Тарифы',
        path: '/tariffs',
    },
    {
        title: 'Тариф',
        path: '/tariffs/:id',
    },
];
// Айтем
const item = ref({});
// Список клиентов
const organizationList = ref({});
// Флаг загрузки
const loading = ref(true);
// Флаг сохранения
const saving = ref(false);

const types = [
    {value: 'NFC_TAG', label: 'Карта'},
    {value: 'QR_CODE', label: 'QR код'}
]

if (+ID !== 0) {
    getData(`/admin/subscription_type/${ID}`, METHODS.GET).then((response) => {
        if (response.success) {
            item.value = response.result.item;
        }
    }).finally(() => {
        loading.value = false;
    });
} else {
    item.value = {
        title: '',
        period: '',
        cost: null,
        type: ''
    }

    loading.value = false;
}

getData(`/admin/organization`, METHODS.GET).then((response) => {
    if (response.success) {
        organizationList.value = response.result.items;
    }
});

function saveItem() {
    saving.value = true;
    const isNew = +ID === 0;
    const editedItem = prepareItem(item.value);

    getData(isNew ? '/admin/subscription_type' : `/admin/subscription_type/${ID}`,
        isNew ? METHODS.POST : METHODS.PUT,
        isNew ? item.value : editedItem
    )
        .then((response) => {
            if (response.success) {
                $q.notify({
                    message: 'Тариф успешно создан',
                    color: 'green',
                });

                router.push('/tariffs');
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

    delete cloneItem.createdAt;
    delete cloneItem.updatedAt;
    delete cloneItem.id;

    return cloneItem;
}

function deleteItem() {
    confirmDelete('Удалить', (fn) => {
        getData(`/admin/subscription_type/${ID}`, METHODS.DELETE).then((res) => {
            if (res.success) {
                router.push('/tariffs');
            }
        });

        fn();
    });
}
</script>

<template>
    <div class="q-pa-lg">
        <BreadCrumbs
                :routeList="crumbList"
        />

        <div class="row justify-between items-center page-header">
            <h2 class="text-h4 text-bold q-my-none">Тариф</h2>

            <div class="row q-gutter-md justify-end">
                <q-btn
                        no-caps
                        outline
                        class="btn-default"
                        label="Удалить"
                        :disable="+ID === 0"
                        @click="deleteItem"
                        size="12px"
                />
                <q-btn
                        no-caps
                        outline
                        class="btn-default"
                        label="Вернуться к списку"
                        size="12px"
                        @click="$router.push('/tariffs')"
                />
            </div>
        </div>
    </div>

    <q-separator class="separator-color" size="10px"/>

    <div style="max-width: 410px;">
        <q-form
                @submit="saveItem"
                class="col-6 q-pa-lg q-mt-sm"
        >
            <div class="text-subtitle2">
                Название
                <q-input
                        v-model="item.title"
                        :loading="loading"
                        dense
                        outlined
                />
            </div>

            <div class="text-subtitle2 q-my-lg">
                Время действия
                <q-input
                        v-model="item.period"
                        :loading="loading"
                        dense
                        outlined
                        type="number"
                />
            </div>

            <div class="text-subtitle2 q-my-lg">
                Стоимость
                <q-input
                        v-model="item.cost"
                        :loading="loading"
                        dense
                        outlined
                        type="number"
                />
            </div>

            <div class="text-subtitle2 q-my-lg">
                Тип подписки
                <q-select
                    v-model="item.type"
                    :options="types"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    dense
                    outlined
                >
                </q-select>
            </div>

            <div class="q-my-md">
                <q-btn
                        no-caps
                        color="primary"
                        type="submit"
                        label="Сохранить"
                        :loading="loading || saving"
                        :disable="loading"
                />
            </div>
        </q-form>
    </div>
</template>

<style scoped>

</style>
