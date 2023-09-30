<script setup>
import {ref, provide} from 'vue';
import {useStore} from "@/store/store";

//
const store = useStore();
//
store.getProfile();

const message = ref(null);

const setMessage = (msg) => {
  if (msg) {
    message.value = msg;
  }
}

const getMessage = (callback) => {
  if (callback) {
    callback(message.value, () => {
      message.value = null;
    });
  }
}

provide('crossMessage', {
  setMessage,
  getMessage,
  message,
})
</script>

<template>
  <router-view/>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}

.sticky-table {
  /* height: calc(100vh - 200px); */
}

.q-table tbody td {
    max-width: 180px;
    /* width: 300px; */
    white-space: normal;
    text-overflow: ellipsis;
    overflow: hidden;
    height: auto;
}

.sticky-table th:last-child,
.sticky-table td:last-child {
  position: sticky;
  right: 0;
  background: #fff;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%);
}

.separator-color {
  background-color: #f7f7f7;
}
.mb-30 {
  margin-bottom: 30px;
}
.mt-30 {
  margin-top: 30px;
}

.q-btn--outline:before {
  border: none;
}
.q-btn--outline.btn-default:before {
  border: 1px solid #ebebeb;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

/* _____Tables_____ */
.q-table tbody td {
  font-size: 14px;
  font-weight: 500;
}

.q-table th {
  font-size: 13px;
  font-weight: 600;
}

.q-table__bottom input[type=number] {
  width: 36px; 
  height: 32px; 
  border-radius: 3px; 
  border: 1px solid #ebebeb; 
  background-color: #f7f7f7;
  text-align: center;
}

.q-pagination .q-btn:before {
  border: 1px solid #ebebeb;
}

.q-pagination .q-btn {
  margin-left: 3px;
  width: 32px;
  height: 32px;
}

.q-pagination .q-btn--outline:before {
  background: #ebebeb;
}

.mobile .page-header {
  display: block;
}

.mobile .page-header .text-h4 {
  margin-bottom: 12px;
  font-size: 24px;
}

.mobile .page-header > .row {
  display: block;
  width: auto;
  padding-right: 20px;
  padding-bottom: 20px;
  margin-right: -24px;
}

.mobile .page-header > div {
  width: 100%;
  overflow: auto;
  white-space: nowrap;
}
.mobile .q-pagination {
  margin: 0 16px;
}
.q-table__grid-item {
  padding: 10px 20px;
}
.q-table__grid-item-card {
  padding: 20px;
  border: 1px solid #efefef;
  border-radius: 4px;
}
.q-table__grid-item-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}
.q-table__grid-item-row .q-table__grid-item-title {
  width: 120px;
  font-weight: bold;
  font-size: 14px;
  color: #000;
  opacity: 1;
}
.q-table__grid-item-row .q-table__grid-item-value {
  font-size: 14px;
  flex: 1;
}
.mobile .q-form {
  width: 100%;
}
.q-select .q-field__native > span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.infoCard {
  max-width: 420px;
  padding: 24px;
  border-radius: 4px;
  border: 1px solid rgb(242 192 55);
  background: rgba(242, 192, 55, 0.1);
}
.q-table__bottom .infoCard {
  margin: 0 auto;
}
.page-header .infoCard {
  margin: 40px auto;
}
</style>
