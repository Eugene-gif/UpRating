import Users from "@/modules/Users/views/Users.vue";
import UserDetail from "@/modules/Users/views/UserDetail.vue";

export default [
    {
        path: "users",
        name: "users",
        component: Users,
        meta: {
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN']
        }
    },
    {
        path: "users/:id",
        name: "users-detail",
        component: UserDetail,
        meta: {
            isDetail: true,
            role: ['ROLE_SUPER_ADMIN', 'ROLE_ORGANIZATION_ADMIN']
        }
    },
]