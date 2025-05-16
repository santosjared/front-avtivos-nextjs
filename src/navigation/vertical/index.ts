// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/home',
      subject: 'dashboard',
      icon: 'mdi:home-outline',
    },
    {
      title: 'Registro de usuarios',
      path: '/users',
      subject: 'users',
      icon: 'mdi:users',
    },
    {
      title: 'Roles y permisos',
      path: '/roles',
      subject: 'roles',
      icon: 'carbon:user-role',
    },
  ]
}

export default navigation
