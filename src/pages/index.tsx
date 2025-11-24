import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import Spinner from 'src/@core/components/spinner'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import navigation from 'src/navigation'

const getFirstAllowedRoute = (ability: any) => {
  const items = navigation()

  for (const item of items) {
    if (ability?.can(item.action, item.subject)) {
      return item.path
    }
  }

  return null
}

const Home = () => {
  const router = useRouter()
  const ability = useContext(AbilityContext)
  console.log(ability)
  useEffect(() => {

    if (!router.isReady || !ability) return

    const route = getFirstAllowedRoute(ability)

    if (route) {
      router.replace(route)
    } else {
      router.replace('/dashboard')
    }
  }, [router.isReady, ability])

  return <Spinner />
}

export default Home
