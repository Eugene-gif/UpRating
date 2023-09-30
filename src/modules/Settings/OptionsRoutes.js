import Options from "@/modules/Settings/views/Options.vue";
import OptionsDetail from "@/modules/Settings/views/OptionsDetail.vue";

export default [
    {
        path: "options",
        name: "options",
        component: Options,
        meta: {
            breadCrumbs: [
                {
                    title: 'Настройки',
                    path: '/options',
                },
            ],
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        }
    },
    {
        path: "options/:id",
        name: "options-detail",
        component: OptionsDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN']
        }
    },
];