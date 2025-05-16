// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

import { useAuth } from 'src/hooks/useAuth'
import navigation from 'src/navigation/vertical'
import { buildAbilityFor } from 'src/configs/acl'

const Home = () => {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!user?.role?.permissions) return

    const ability = buildAbilityFor(user.role.permissions)
    if (!ability) return
    const navItems = navigation()
    const accessibleRoute: any = navItems.find(item => {
      return ability.can('read', item.subject || '')
    })
    if (accessibleRoute) {
      router.replace(accessibleRoute.path)
    } else {
      router.replace('/acl')
    }
  }, [user])

  return <Spinner />
}

export default Home
