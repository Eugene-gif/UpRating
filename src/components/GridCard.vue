<script setup>
import { ref } from 'vue';

const props = defineProps({
    loading: {
        default: false,
    },
    headers: {
        default: [],
    },
    list: {
        default: [],
    },
});
</script>

<template>
    <q-circular-progress
        v-if="loading"
        indeterminate
        size="50px"
        color="primary"
        class="q-ma-md"
    />

    <template v-else>
        <div class="q-pa-md">
            <template v-if="list.length === 0">
                <slot name="noresult">
                    Нет данных
                </slot>
            </template>

            <template v-else>
                <template v-for="item in list">
                    <q-card class="q-pa-md q-mb-md">
                        <template v-for="head in headers">
                            <div class="row q-mb-md">
                                <div class="table-card--title">{{ head.label }}</div>
                                
                                <div class="table-card--value">
                                    <slot :name="head.name" v-bind="{row: item}">
                                        <template v-if="typeof head.field === 'function'">
                                            <template v-if="head.format">
                                                {{ head.format(head.field(item)) }}
                                            </template>

                                            <template v-else>
                                                {{ head.field(item) }}
                                            </template>
                                        </template>

                                        <template v-else>
                                            <template v-if="head.format">
                                                {{ head.format(item[head.field]) }}
                                            </template>

                                            <template v-else>
                                                {{ item[head.name] }}
                                            </template>
                                        </template>
                                    </slot>
                                </div>
                            </div>
                        </template>
                    </q-card>
                </template>
            </template>
        </div>

        <slot name="pagination"></slot>
    </template>
</template>

<style scoped>
.table-card--title {
    font-weight: bold;
    width: 120px;
    padding-right: 15px;
}
.table-card--value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>