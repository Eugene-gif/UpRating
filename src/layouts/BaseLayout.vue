<script setup>
import {computed, provide, ref, watch} from "vue";
import Header from "@/components/Header.vue";
import Menu from "@/components/Menu.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {useRouter} from "vue-router";

const showDeleteDialog = ref(false);
const dialogOptions = ref({});
const router = useRouter();

function confirmDelete(text, fn) {
  showDeleteDialog.value = true;

  dialogOptions.value = {
    text: text,
    callback: fn,
  }
}

function closeDialog() {
  showDeleteDialog.value = false;

  dialogOptions.value = null;
}

// Текст из поисковой строки
const searchText = ref('');


provide('deleteDialog', {
  showDeleteDialog,
  dialogOptions,
  closeDialog,
  confirmDelete,
});


const table = computed(() => router.currentRoute.value.name);

function searchInput(value) {
  searchText.value = value;
}

provide('searchText', searchText);
</script>

<template>
  <q-layout view="lHh Lpr lff">
    <Header @onSearch="searchInput" />

    <Menu />

    <q-page-container>
      <ConfirmDialog/>

      <router-view/>

    </q-page-container>
  </q-layout>
</template>

<style scoped>
</style>