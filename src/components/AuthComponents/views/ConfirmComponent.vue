<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from 'quasar';
import { getData, METHODS } from "@/utils/http";

const $q = useQuasar();

const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const code = ref('');

const loading = ref(false);

function confirmPass() {
  loading.value = true;
  getData("/reset_password/reset_confirm", METHODS.POST, {
    email: history.state.email,
    password: password.value,
    confirmPassword: confirmPassword.value,
    code: code.value,
  })
  .then(response => {
    if (response.success) {
      $q.notify({
        message: 'Ваш пароль успешно изменен',
        color: 'green',
      });

      router.push('/');
    } else {
      $q.notify({
        message: 'Неправильный код',
        color: 'red',
      })
    }
  }).finally(() => {
    loading.value = false;
  })
  
}
</script>

<template>
<!-- _______________ Form Confirm _______________  -->
    <q-card
      class="confirm-form--card q-pa-xs row"
    >
      <q-form 
        class="q-pa-md" 
        greedy="true"
        @submit="confirmPass"
      >
        <div class="text-h4 text-bold">Сброс пароля</div>
        <p>
          Введите ваш адрес электронной почты, и мы вышлем вам ссылку для сброса
          вашего пароля
        </p>

        <div class="text-subtitle2">
          Введите пароль <span class="text-red">*</span>
          <q-input
            dense
            standout="bg-grey-2"
            class="q-inp"
            outlined
            v-model="password"
            placeholder="Введите пароль"
            type="password"
            :rules="[val => val.length >= 6 || 'Пароль должен быть не менее 6 символов']"
          ></q-input>
        </div>

        <div class="text-subtitle2">
          Подтвердите пароль <span class="text-red">*</span>
          <q-input
            dense
            standout="bg-grey-2"
            class="q-inp"
            outlined
            v-model="confirmPassword"
            placeholder="Введите пароль"
            type="password"
            :rules="[ val => confirmPassword === password || 'Пароль не совпадает']"
          ></q-input>
        </div>

        <div class="text-subtitle2">
          Код доступа <span class="text-red">*</span>
          <q-input
            dense
            standout="bg-grey-2"
            class="q-inp"
            outlined
            v-model="code"
            placeholder="Введите полученный код"
            :rules="[val => !!val || 'Поле должно быть заполнено']"
          ></q-input>
        </div>

        <div class="q-my-md">
          <q-btn
            class="full-width"
            color="primary"
            type="submit"
            label="Отправить письмо для сброса пароля"
            :loading="loading"
          ></q-btn>
        </div>
      </q-form>
    </q-card>  
</template>


<style>
.confirm-form--card {
  width: 370px;
  margin: 0 auto;
  padding: 32px 32px 52px 32px;
}

.mobile .confirm-form--card {
  width: auto;
  padding: 20px;
}
.mobile .confirm-form--card .text-h4 {
  font-size: 24px;
  line-height: 24px;
  margin-bottom: 20px;
}
</style>

