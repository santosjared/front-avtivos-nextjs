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
    {
      title: 'Registro de activos',
      path: '/activos',
      subject: 'activos',
      icon: 'mdi:bank-outline'
    },
    {
      title: 'Grupos contables',
      path: '/accountants',
      subject: 'accountants',
      icon: 'mdi:bus-stop-uncovered'
    },
    {
      title: 'Calcular depreciación',
      path: '/depreciation',
      subject: 'depreciation',
      icon: 'mdi:bus-stop-uncovered'
    },
    {
      title: 'Entrega de activos',
      path: '/borrowing',
      subject: 'borrowing',
      icon: 'mdi:handshake'
    },
    {
      title: 'Devolucion de activos',
      path: '/return',
      subject: 'return',
      icon: 'mdi:human-dolly'
    }
  ]
}

export default navigation
