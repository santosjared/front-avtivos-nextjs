// ** React Imports
import { ReactNode, useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { NavLink } from 'src/@core/layouts/types'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  const { children, navLink } = props
  const ability = useContext(AbilityContext)

  return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null
}

export default CanViewNavLink
