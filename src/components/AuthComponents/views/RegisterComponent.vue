<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {getData, METHODS} from "@/utils/http";

const router = useRouter();

const $q = useQuasar();

// __________ Form Register JS __________
const emailRegister = ref("");
const passwordRegister = ref("");
const title = ref("");
const tin = ref("");
const decisionMakerName = ref("");
const decisionMakerPhone = ref("");
const promocode = ref("");
const code = ref("");
const loading = ref(false);

const acceptRules = ref(false);

function register() {
  loading.value = true;

  getData("/admin/auth/register", METHODS.POST, {
    email: emailRegister.value,
    password: passwordRegister.value,
    code: code.value,
    promoCode: promocode.value,
  }).then((response) => {
    if (response.success) {
      $q.notify({
        message: "Вы успешно зарегистрированы",
        color: "green",
      });
      router.push("/");
    } else {
      $q.notify({
        message: response.message,
        color: "red",
      });
    }
  }).finally(() => loading.value = false);
}
</script>

<template>
  <!-- _______________ Form Register _______________  -->
  <q-card
      class="register-form--card overflow-auto row"
  >
    <!-- <div class="form-title">UpRating</div> -->
    <q-form class="form-register-reset" greedy="true" @submit="register">
      <div class="text-h4 text-bold q-mb-md">Регистрация</div>
      <div class="row wrap q-col-gutter-x-md">
        <div class="text-subtitle2 col">
          Почта <span class="text-red">*</span>
          <q-input
              dense
              outlined
              placeholder="Введите почту"
              v-model="emailRegister"
              :rules="[
              (val) =>
                new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно',
            ]"
          ></q-input>
        </div>

        <div class="text-subtitle2 col">
          Пароль <span class="text-red">*</span>
          <q-input
              dense
              outlined
              placeholder="Введите пароль"
              v-model="passwordRegister"
              type="password"
              :rules="[(val) => val.length >= 6 || 'Пароль не менее 6 символов']"
          ></q-input>
        </div>
      </div>

      <div class="text-subtitle2 q-mb-md col-6">
        Код партнёра
        <q-input
            dense
            outlined
            placeholder="Введите код партнёра"
            v-model="code"
        ></q-input>
      </div>

      <div class="text-subtitle2 q-mb-md col-6">
        Промокод
        <q-input
            dense
            outlined
            placeholder="Введите промокод"
            v-model="promocode"
        ></q-input>
      </div>

      <div>
        <q-checkbox
            style="margin-left: -7px"
            v-model="acceptRules"
            label="Заполняя данную форму, я даю согласие на обработку моих персональных данных и принимаю условия политики конфиденциальности"
        />
      </div>

      <div class="form-buttons">
        <div class="q-mt-lg row">
          <q-btn
              class="q-mr-md q-px-md"
              color="primary"
              type="submit"
              :disable="!acceptRules"
              label="Зарегистрироваться"
              :loading="loading"
          ></q-btn>
          <q-btn
              @click="$router.push('/login')"
              :disable="loading"
              color="bg-white text-black"
              type="button"
              label="Назад"
          ></q-btn>
        </div>
      </div>
    </q-form>
  </q-card>
</template>

<style>
.register-form--card {
  max-width: 684px;
  width: 100%;
  max-height: 603px;
  margin: 0 auto;
}

.form-title {
  font-size: 28px;
  line-height: 32px;
  font-weight: 700;
  margin: 50px auto;
}

.form-register-reset {
  padding: 32px 32px 52px 32px;
  border: 1px solid #ebebeb;
  border-radius: 5px;
}

.mobile .form-register-reset {
  padding: 20px;
}

.mobile .form-title {
  font-size: 20px;
  line-height: 22px;
  font-weight: 700;
}

.mobile .register-form--card .text-h4 {
  font-size: 24px;
  line-height: 24px;
  margin-bottom: 20px;
}

.mobile .form-register-reset > .row {
  display: block;
}

.mobile .form-register-reset {
  padding: 20px;
}

.mobile .form-buttons button {
  width: 100%;
  margin: 0 0 12px;
}
</style>

<style scoped>
</style>
