import { TEndpoints, TMethods, TWildcardObject } from "../../types"

export const apiHandler = <T extends TWildcardObject>(type: TMethods, urls :TEndpoints, a: TWildcardObject,user ?: any,  extHandler ?: ( params: any, url: string, user: any|null ) => Promise<{ status: boolean; data: any }>) => new Promise<{status: boolean, data: T }>((resolve, reject) => {
  const chooseUrl = (type:TMethods) => urls[type]?.url ?? urls['url']?.url ?? ''
  const getMethod = (type:TMethods) => urls[type]?.method ?? urls['url']?.method ?? 'POST'
  const getArgs = (type:TMethods) => ({ ...urls[type]?.args, ...urls['url']?.args })
  const getHeaders = (type:TMethods) => ({ ...urls[type]?.headers, ...urls['url']?.headers })

  if (extHandler) {
    extHandler(a,chooseUrl(type),user).then((response) => resolve(response)).catch((err) => reject(err))
  } else {
    fetch(
      chooseUrl(type),
      {
        method : getMethod(type),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...getHeaders(type)
        },
        body : JSON.stringify({...a, ...getArgs(type)})
      }
    ).then(data => data.json()).then((response) => resolve(response as any)).catch((err) => reject(err))
  }
})