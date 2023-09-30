<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import {useQuasar} from 'quasar';
import {useStore} from "@/store/store";

const router = useRouter();

const store = useStore();

const $q = useQuasar();

const email = ref('');
const password = ref('');
const isPwd = ref(true);

const loading = ref(false);

function login() {
  loading.value = true;

  store.login({
    'email': email.value,
    'password': password.value,
  }).then((response) => {
    if (response.success) {
      $q.notify({
        message: 'Добро пожаловать!',
        color: 'green',
      });
    } else {
      $q.notify({
        message: 'Неправильный логин или пароль',
        color: 'red',
      });
    }
  }).finally(() => {
    loading.value = false;
  })

}
</script>

<template>
  <q-card
      class="form-login--card row overflow-auto"
  >
    <q-form
        @submit="login"
        greedy="true"
        class="form-login col-6"
    >
      <div class="text-h4 text-bold form-login__title">Войти</div>

      <div class="text-subtitle2">
        Почта <span class="text-red">*</span>
        <q-input
            dense
            standout="bg-grey-2"
            class="q-inp"
            outlined
            placeholder="Введите почту"
            v-model.trim="email"
            :rules="[val => new RegExp(/.+@.+\..+/).test(val) || 'Email введён некорректно']"
        ></q-input>
      </div>

      <div class="text-subtitle2">
        Пароль <span class="text-red">*</span>
        <q-input
            dense
            standout="bg-grey-2"
            class="q-inp"
            outlined
            placeholder="Введите пароль"
            v-model="password"
            :rules="[val => !!val || 'Поле должно быть заполнено']"
            :type="isPwd ? 'password' : 'text'"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>

        </q-input>
      </div>

      <q-card-actions
          class="text-subtitle2 q-pa-none"
          align="between"
      >
        <a
          class="cursor-pointer"
          @click="$router.push('/reset')"
        >Забыли пароль</a>

        <a
          class="cursor-pointer"
          @click="$router.push('/register')"
        >Pегистрация</a>
      </q-card-actions>

      <div class="q-mt-lg">
        <q-btn
            class="full-width"
            color="primary"
            type="submit"
            label="Войти"
            :loading="loading"
        ></q-btn>
      </div>
    </q-form>

    <div class="col-6 self-stretch text-center auth-bg"
      style="background-color: #FFED9D; border-bottom-left-radius: 0;">
      <img
          style="object-fit: contain; width: 100%; height: 100%; margin-bottom: -10px;"
          src="../../../assets/auth-image.png"
      />
    </div>
  </q-card>
</template>

<style scoped>
.form-login--card {
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
}
.mobile .form-login--card {
  width: auto;
  top: 0;
  left: 0;
  margin: 0;
  transform: none;
}
.form-login {
  padding: 44px 44px 120px 44px;
}
.form-login__title.text-h4 {
  font-size: 36px;
  line-height: 42px;
  font-weight: 700;
  margin-bottom: 27px;
}
.mobile .form-login__title.text-h4 {
  font-size: 24px;
  line-height: 24px;
  margin-bottom: 20px;
}
.mobile .form-login {
  width: 100%;
  padding: 20px;
}

.mobile .auth-bg {
  display: none;
}

</style>
