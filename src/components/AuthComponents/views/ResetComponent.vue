<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { getData, METHODS } from "@/utils/http";

const $q = useQuasar();

const router = useRouter();

const email = ref("");

const loading = ref(false);

function resetPass() {
  loading.value = true;
  getData("/reset_password/reset", METHODS.POST, {
    email: email.value,
  })
    .then((response) => {
      if (response.success) {
        router.push({ name: "confirm", state: { email: email.value } });
      } else {
        $q.notify({
          message: "Пользователя с указанным email не существует",
          color: "red",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <!-- _______________ Form Reset _______________  -->
  <q-card class="reset-form--card row">
    <q-form class="border-none" greedy="true" @submit="resetPass">
      <div class="text-h4 text-bold q-mb-md">Сброс пароля</div>
      <p class="q-mb-lg">
        Введите ваш адрес электронной почты, и мы вышлем вам ссылку для сброса
        вашего пароля
      </p>
      <div class="text-subtitle2">
        Почта <span class="text-red">*</span>
        <q-input
          dense
          standout="bg-grey-2"
          class="q-inp"
          outlined
          v-model="email"
          placeholder="Введите почту"
          :rules="[
            (val) => new RegExp(/.+@.+\..+/).test(val) || 'Неверный email',
          ]"
        ></q-input>
      </div>

      <div>
        <q-btn
          class="full-width form-reset__btn"
          color="primary"
          type="submit"
          label="Отправить письмо для сброса пароля"
          :loading="loading"
        ></q-btn>
      </div>
    </q-form>
    <div class="form-reset__btn-back q-pt-xl q-mx-auto">
      <q-btn
        class="text-lowercase bg-white"
        color="bg-white text-black"
        type="button"
        @click="$router.push('/login')"
      >
        <q-avatar size="16px">
          <img src="/arrow-left.svg"/>
        </q-avatar>
        <q-item-label class="q-ml-xs">
          назад
        </q-item-label>
      </q-btn>

    </div>
  </q-card>
</template>


<style scoped>
.form-reset__btn {
  text-transform: none;
}

.reset-form--card {
  max-width: 370px;
  width: 100%;
  padding: 32px 32px 52px 32px;
  margin: 0 auto;
}

.mobile .reset-form--card {
  max-width: 100%;
  padding: 20px;
}

.mobile .register-form--card .text-h4 {
  font-size: 24px;
  line-height: 24px;
  margin-bottom: 20px;
}
</style>
