import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { ACLObj, AppAbility } from 'src/configs/acl'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor } from 'src/configs/acl'
import NotAuthorized from 'src/pages/401'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'

interface AclGuardProps {
  children: ReactNode
  guestGuard: boolean
  aclAbilities: ACLObj
}

const AclGuard = ({ children, guestGuard, aclAbilities }: AclGuardProps) => {
  const [ability, setAbility] = useState<AppAbility | null>(null)
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.user?.role?.permissions && !ability) {
      const newAbility = buildAbilityFor(auth.user.role.permissions)
      setAbility(newAbility)
    }
  }, [auth.user, ability])

  if (guestGuard || ['/404', '/500', '/'].includes(router.route)) {
    return <>{children}</>
  }
  if (ability && ability.can(aclAbilities.action, aclAbilities.subject)) {
    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  }

  return (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}
export default AclGuard
