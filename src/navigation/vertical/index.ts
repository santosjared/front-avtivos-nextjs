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
      path: '/contable',
      subject: 'contable',
      icon: 'mdi:monitor-cellphone'
    },
    {
      title: 'Entrega de activos',
      path: '/borrowing',
      subject: 'borrowing',
      icon: 'mdi:handshake'
    },
    {
      title: 'Devolucion de activos',
      path: '/devolucion',
      subject: 'devolucion',
      icon: 'mdi:human-dolly'
    },
    {
      title: 'Depreciación',
      path: '/depreciation',
      subject: 'depreciation',
      icon: 'mdi:alarm-panel-outline'
    },
    {
      title: 'Bitacoras',
      path: '/depreciation',
      subject: 'depreciation',
      icon: 'mdi:dns-outline'
    },
  ]
}

export default navigation
