<script setup>
import {ref} from 'vue';
import {useQuasar} from "quasar";

const emit = defineEmits(['onChange']);
const $q = useQuasar();
const props = defineProps({
  title: {
    default: '',
  },
  multiple: {
    default: false,
  }
});

const isPreview = ref(false);
const images = ref([]);
const image = ref();
const previewImage = ref();
const previewImages = ref([]);
const detailPreview = ref();
const maxSize = 20;
const formats = '.jpg, image/png, .jpeg';

function convertImage(file) {
  if (props.multiple && file !== null) {
    file.forEach((item, index) => {
      if (item !== null) {
        let blob = URL.createObjectURL(image.value[index]);

        images.value.push(item);
        previewImages.value.push(blob);
      } else {
        previewImage.value = '';
      }
    });

    emit('onChange', images.value);
  } else {
    if (file === null) {
      previewImage.value = '';

      return;
    }

    previewImage.value = URL.createObjectURL(file);
    emit('onChange', file);
  }

}

function deleteImage(index) {
  previewImages.value.splice(index, 1);
  previewImage.value = '';
  images.value.splice(index, 1);
  image.value = '';
}

function openPreview(image) {
  detailPreview.value = image;
  isPreview.value = true;
}

function onRejected(rejectedEntries) {
  let error = `Загрузите верный формат файла (${formats}), не более ${maxSize} Мб.`;
  
  $q.notify({
    type: 'negative',
    message: error,
  })
}

function clearData() {
  if (props.multiple) {
    previewImages.value = [];
    images.value = [];
  }
}
</script>

<template>
  <div class="row no-wrap q-col-gutter-md">
    <div style="height: 100px; width: 300px">
      <q-file
          v-model="image"
          @update:model-value="convertImage"
          :multiple="multiple"
          clearable
          hint="Максимальный размер файла - 20Мб (jpeg, jpg, png)"
          :label="title"
          :max-file-size="maxSize * 1024 * 1024"
          @rejected="onRejected"
          :accept="formats"
          @clear="clearData"
      >
        <template #prepend>
          <q-icon name="attach_file"/>
        </template>
      </q-file>
    </div>

    <template v-if="multiple">
      <template
          v-if="previewImages.length"
          v-for="(image, index) in previewImages"
          :key="image.name"
      >
        <div style="height: 100px; width: 100px">
          <q-img
              :src="image"
              class="q-mx-xl"
              @click.stop="openPreview(image)"
          >
            <div
                style="background: transparent; padding: 0;"
                class="absolute-right"
            >
              <q-icon
                  name="highlight_off"
                  color="white"
                  size="20px"
                  style="cursor: pointer;"
                  @click.stop="deleteImage(index)"
              />
            </div>
          </q-img>
        </div>
      </template>
    </template>

    <template v-else>
      <div
          v-if="previewImage"
          class="col-6"
      >
        <q-img
            :src="previewImage"
            style="height: 100px; width: 100px"
            class="q-mx-xl"
            @click="openPreview(previewImage)"
        >
          <div
              style="background: transparent; padding: 0;"
              class="absolute-right"
          >
            <q-icon
                name="highlight_off"
                color="white"
                size="20px"
                style="cursor: pointer;"
                @click.stop="deleteImage(0)"
            />
          </div>
        </q-img>
      </div>
    </template>
  </div>

  <q-dialog v-model="isPreview">
    <q-img
        style="background: white"
        :src="detailPreview"
    >
      <div
          style="background: transparent; padding: 0;"
          class="absolute-right"
      >
        <q-icon
            name="highlight_off"
            color="white"
            size="20px"
            style="cursor: pointer;"
            @click="isPreview = false"
        />
      </div>
    </q-img>
  </q-dialog>
</template>


<style scoped>

</style>