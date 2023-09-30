<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useDialogPluginComponent, useQuasar} from "quasar";
import {useStore} from "@/store/store";
import {getData, METHODS} from "@/utils/http";

const store = useStore();
const $q = useQuasar();
const profile = store.profile;
const router = useRouter();
const icon = ref(false);
const loading = ref(false);
const orgLoading = ref(false);
const tab = ref("info");
const organizationItem = ref({});
let roles = store.profile.role;
const isOrgAdmin = roles.some((role) => role.value === 'ROLE_ORGANIZATION_ADMIN');

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


//Tabs info
const phone = ref("");
const name = ref("");
const company = ref("");

if (profile.organization != null) {
    orgLoading.value = true;

    getData(`/admin/organization/${profile.organization.id}`, METHODS.GET)
        .then((response) => {
            if (response.success) {
                organizationItem.value = response.result.item;
                item.value.reportSendingTime = organizationItem.value.reportSendingTime
            }
        })
        .finally(() => {
            loading.value = false;
        });
    loading.value = false;
}

const item = ref({
    profile: {
        fullName: profile.profile.fullName,
    },
    email: profile.email,
    reportSendingTime: null,
});

const rolesList = {
    ROLE_SUPER_ADMIN: "Суперадминистратор",
    ROLE_ORGANIZATION_ADMIN: "Администратор клиента",
    ROLE_USER: "Пользователь",
    ROLE_PARTNER: "Партнёр",
};

defineEmits([...useDialogPluginComponent.emits]);

const {dialogRef, onDialogHide, onDialogOK, onDialogCancel} =
    useDialogPluginComponent();

function saveUser() {
    getData(`/admin/user/${profile.id}`, METHODS.PUT, item.value)
        .then((response) => {
            if (response.success) {
                $q.notify({
                    message: "Информация изменена",
                    color: "green",
                });

                store.setProfile(response.result.item);
            } else {
                $q.notify({
                    message: "Произошла ошибка",
                    color: "red",
                });
            }
        })
        .finally(() => {
            onDialogOK();
        });
}

</script>

<template>
    <q-dialog
            class="profile"
            ref="dialogRef"
            @hide="onDialogHide"
            position="right"
            maximized
    >
        <q-card style="max-width: 482px" class="q-dialog-plugin">
            <q-card class="row items-center justify-between q-pa-sm q-px-md">
                <q-card style="font-size: 14px; font-weight: 500; cursor: default"
                >Профиль пользователя
                </q-card>
                <q-btn icon="close" flat round dense v-close-popup/>
            </q-card>

            <q-separator class="q-mb-md"></q-separator>

            <div class="q-mx-md">
                <h3
                        class="profile-name q-ma-none q-mb-sm text-center"
                >
                    {{ profile.profile.fullName }}
                </h3>

                <div
                        class="text-center q-mb-lg"
                        style="color: #b2b2b2; font-size: 14px"
                >
                    Роль: {{ rolesList[profile.role[0].value] }}
                </div>

                <h3 class="text-center text-subtitle1 q-mb-xs">Основная информация</h3>

                <q-separator class="q-mb-lg separator-color" size="8px"></q-separator>

                <div class="q-mt-lg">
                    <div class="q-mx-md q-mb-md row justify-center">
                        <q-icon class="q-mr-sm" size="20px">
                            <img src="/user-data.svg"/>
                        </q-icon>
                        <div>Персональные данные</div>
                    </div>

                    <q-form greedy @submit="saveUser">
                        <div class="row wrap q-col-gutter-x-md q-gutter-y-md q-pb-sm q-mb-lg">
                            <div class="text-subtitle2 col-12">
                                Имя
                                <q-input
                                        dense
                                        outlined
                                        placeholder="Введите текст"
                                        v-model="item.profile.fullName"
                                        type="text"
                                ></q-input>
                            </div>

                            <div class="text-subtitle2 full-width">
                                Почта
                                <q-input v-model="item.email" dense outlined></q-input>
                            </div>
                        </div>

                        <template v-if="isOrgAdmin">
                            <div class="text-subtitle2 q-mb-md">
                                Настройка автоматического отправления отчетов по картам
                                <q-select
                                        v-model="item.reportSendingTime"
                                        :options="reportEnumArray"
                                        option-label="label"
                                        map-options
                                        emit-value
                                        dense
                                        outlined
                                />
                            </div>
                        </template>

                        <q-btn
                                no-caps
                                color="primary"
                                type="submit"
                                label="Сохранить изменения"
                                :loading="loading"
                        ></q-btn>
                    </q-form>
                </div>
            </div>
        </q-card>
    </q-dialog>
</template>

<style scoped>
.mobile .profile-block {
    padding: 0 20px;
}

.profile-name {
    font-size: 22px;
    font-weight: bold;
    line-height: 130%;
}

.mobile .profile-name {
    font-size: 20px;
}
</style>