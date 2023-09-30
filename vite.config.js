import {defineConfig} from 'vite'
import {fileURLToPath} from "url";

const path = require('path');
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
        },
    },
    build: {
        commonjsOptions: {
            exclude: ['ckeditor/*'],
        }
    },
    plugins: [vue()],

})