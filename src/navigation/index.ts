// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      action: 'read',
      subject: 'dashboard',
      icon: 'mdi:home-outline',
    },
    {
      title: 'Registro de usuarios',
      path: '/users',
      action: 'read',
      subject: 'users',
      icon: 'mdi:users',
    },
    {
      title: 'Roles y permisos',
      path: '/roles',
      action: 'read',
      subject: 'roles',
      icon: 'carbon:user-role',
    },
    {
      title: 'Grupos contables',
      path: '/contable',
      action: 'read',
      subject: 'contable',
      icon: 'mdi:monitor-cellphone'
    },
    {
      title: 'Registro de activos',
      path: '/activos',
      action: 'read',
      subject: 'activos',
      icon: 'mdi:bank-outline'
    },
    {
      title: 'Entrega de activos',
      path: '/entregas',
      action: 'read',
      subject: 'entrega',
      icon: 'mdi:handshake'
    },
    {
      title: 'Devolucion de activos',
      path: '/devolucion',
      action: 'read',
      subject: 'devolucion',
      icon: 'mdi:human-dolly'
    },
    {
      title: 'Depreciación',
      path: '/depreciacion',
      action: 'read',
      subject: 'depreciacion',
      icon: 'mdi:alarm-panel-outline'
    },
    {
      title: 'Bitacoras',
      path: '/bitacoras',
      action: 'read',
      subject: 'bitacora',
      icon: 'mdi:dns-outline'
    },
  ]
}

export default navigation
