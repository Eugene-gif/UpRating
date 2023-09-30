<script setup>
import {ref} from "vue";
// import {useRouter} from "vue-router";
// import {useQuasar} from 'quasar';

// const router = useRouter();

// const $q = useQuasar();

const formBlack = ref(true);

</script>

<template>
  <q-layout view="hHh lpR fFf" class="page-form">
    <q-page-container>
      <!-- _______________ Form Login _______________  -->
      <div class="text-h5 text-black text-center page-form__title">UpRating</div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.page-form {
  padding: 20px;
}
.page-form__title {
  font-size: 28px;
  line-height: 32px;
  font-weight: 700;
  margin-top: 60px;
  margin-bottom: 100px;
}
.mobile .page-form__title {
  margin: 40px 0 40px 0;
}
</style>