import { useEditions } from '../api/editions'

export const useCurrentEdition = () => {
  const { data: editions, ...rest } = useEditions()
  const current = editions && editions.length > 0 ? editions[0] : undefined
  return { edition: current, ...rest }
}
