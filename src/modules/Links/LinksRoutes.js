import Links from "@/modules/Links/views/Links.vue";
import LinksDetail from "@/modules/Links/views/LinksDetail.vue";

export default [
    {
        path: "links",
        name: "links",
        component: Links,
        meta: {
            role: ['ROLE_USER']
        }
    },
    {
        path: "links/:id",
        name: "links-detail",
        component: LinksDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_USER']
        }
    },
];