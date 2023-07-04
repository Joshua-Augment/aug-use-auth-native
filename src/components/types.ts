import { FirebaseOptions } from "firebase/app";

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;


export type TMethods = 'login' | 'logout' | 'modify' | 'register'
export type TAuthMethods = 'API' | 'Firebase'
export type TFirebaseAuthMethods = 'EmailPassword' | 'Facebook' | 'Google' 
export type TEndpointFields = {method ?:string, headers ?: TWildcardObject, args ?: TWildcardObject}
export type TEndpoints = {
  url : TEndpointFields & {url: string},
  register ?:TEndpointFields & {url?: string},
  login ?:TEndpointFields & {url?: string},
  logout ?:TEndpointFields & {url?: string},
  modify ?:TEndpointFields & {url?: string},
}

export type TMethodReturn = {
  status:  boolean,
  data:  {
    apiReturn : any,
    formData ?: any
  }
}

export type AuthOptions = AuthAPI | AuthFirebase

export interface AuthAPI {
  authMethods : 'API',
  authType ?: TEndpoints,
  authHandler ?: ( params: any, url: string, user: any|null ) => Promise<{ status: boolean; data: any }>
}

export interface AuthFirebase {
  authMethods : 'Firebase',
  authType : TFirebaseAuthMethods,
  authApp : FirebaseOptions,
  useEmulator ?: boolean | string
}

export type TWildcardObject<T=any> = {[key:string] : T}