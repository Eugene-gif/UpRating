<script setup>
import {inject, ref} from "vue";

const { showDeleteDialog, closeDialog, dialogOptions } = inject('deleteDialog');
const loading = ref(false);

function deleteItem() {
  loading.value = true;

  dialogOptions.value.callback(() => {
    loading.value = false;

    closeDialog();
  });
}
</script>

<template>
  <q-dialog v-model="showDeleteDialog">
    <q-card
        class="column items-center justify-evenly text-center q-pa-lg"
        style="max-width: 390px; max-height: 380px"
    >
      <div class="q-mb-lg">
        <div class="text-h6 text-bold">
          Вы действительно хотите {{ dialogOptions.text === 'Удалить' ? 'удалить' : 'заблокировать' }} этот объект?
        </div>
      </div>

      <!-- <div class="text-subtitle2 text-body1 q-mb-lg">
        Эту операцию нельзя отменить
      </div> -->

      <div class="full-width q-gutter-md">
        <q-btn
            no-caps
            outline
            class="btn-default"
            :label="dialogOptions.text"
            @click="deleteItem"
            :loading="loading"
        />

        <q-btn
            no-caps
            color="primary"
            label="Отмена"
            @click="closeDialog"
            :disable="loading"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>