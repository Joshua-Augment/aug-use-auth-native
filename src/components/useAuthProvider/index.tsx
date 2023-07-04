
import { useEffect, useState } from 'react';
import Toast from "react-native-toast-message"
import { AuthOptions, DeepPartial, TMethodReturn, TMethods, TWildcardObject } from '../types';
import { firebaseHandler } from './components/FirebaseHandlers';
import { apiHandler } from './components/apiHandlers';
import { connectAuthEmulator, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';




export type TuseAuth<T=any, U=any> = {
  user : T|null,
  register : (a:any,loginUponRegistration ?:boolean) => Promise<TMethodReturn>
  login : (a:U) => Promise<TMethodReturn>,
  logout : () => Promise<TMethodReturn>,
  modify : (a:T) => Promise<TMethodReturn>
}

export type TMessages = {  
  login : {
    start : string | false,
    completed : string | false,
    error : string | false,
  },
  register : {
    start : string | false,
    completed : string | false, 
    error : string | false,
  },
  logout : {
    start : string | false,
    completed : string | false,
    error : string | false,
  },
  modify : {
    start : string | false,
    completed : string | false,
    error : string | false
  },  
}

export type TNotificationTypes = 'info'|'success'|'error'
export type TMessageTypes = 'start' | 'completed' | 'error'


const useAuthProvider = <UserType extends {[key:string] : any},LoginType extends {[key:string] : any}>(
  authMethods : AuthOptions,
  prefix:string, 
  messages?: DeepPartial<TMessages>,    
  notificationHandler ?: (type:TNotificationTypes, message:string) => void,
): TuseAuth<UserType,LoginType> => {  
  const [user, setUser] = useState<null|UserType>(null) 

  useEffect(()=>{
    let unsubscribe = () => {}
    // Check localStorage
    if (authMethods.authMethods === 'API') {
      const _user = localStorage.getItem(`${prefix}-user`)
      if (_user !== null) {setUser(JSON.parse(_user))}
    } else if (authMethods.authMethods === 'Firebase') {
      if (getApps().length === 0 || getApps().filter(x => x.name === 'aug-getAuth').length === 0) {
        initializeApp(authMethods.authApp)
      }
      const auth = getAuth(getApps().filter(x => x.name === 'aug-getAuth')[0]);
      
      if (authMethods.useEmulator !== undefined && authMethods.useEmulator !== false) {
        const emulatorURL = typeof authMethods.useEmulator === 'boolean' && authMethods.useEmulator === true ? "http://localhost:9099" : authMethods.useEmulator
        connectAuthEmulator(auth, emulatorURL)
      }
      
      unsubscribe = onAuthStateChanged(auth, async (_user) => {
        if (_user) {
          const res = await auth.currentUser?.getIdTokenResult(true)
          const token = await auth.currentUser?.getIdToken(true)
          setUser({
            ..._user as any,
            claims : res === undefined? undefined:  res.claims,
            token : token
          }) 
        } else { setUser(null)}
      });
    }

    return () => unsubscribe()
  },[])

  const DefaultMessages = {
    register : {
      start : 'Registering User....',
      completed : 'User {{name}} Registered!',
      error : 'An error occured! Error : {{error}}'
    },
    login : {
      start : 'Logging In....',
      completed : 'Logged In! Welcome, {{name}}',
      error : 'An error occured! Error : {{error}}'
    },
    logout : {
      start : 'Logging Out....',
      completed : 'Goodbye, {{name}}!',
      error : 'An error occured! Error : {{error}}'
    },
    modify : {
      start : 'Modifying Details...',
      completed : 'User details have been updated!',
      error : 'An error occured! Error : {{error}}'
    }
  }

  const Messages = {
    register : {...DefaultMessages.register, ...messages?.register},
    login : {...DefaultMessages.login, ...messages?.login},
    logout : {...DefaultMessages.logout, ...messages?.logout},
    modify : {...DefaultMessages.modify, ...messages?.modify},
  }



  const parseMessage = (type: TMethods, status: 'start' | 'completed' | 'error', data ?: TWildcardObject) => {
    const _message = Messages[type][status]
    if (_message === false) {return ''}
    else {      
      const output = _message.replace(/{{\s*(.*?)\s*}}/g, (match: string, key: string) => {
        const value = key.split('.').reduce((obj: any, prop: string) => {
          if (obj && prop in obj) {
            return obj[prop];
          }
          return match;
        }, data);
      
        return value;
      });
      
      return output;
    }
  } 
 
  const _notificationHandler = (notificationType:TNotificationTypes, messageType :TMethods, status: TMessageTypes, data ?: TWildcardObject) => {
    if (Messages[messageType][status] === false) {return ;}
    if (notificationHandler) {
      notificationHandler(notificationType,parseMessage(messageType, status, data))
    } else {
      Toast.show({
        type: notificationType, // success, info, warning, error   / optional parameter
        text1: messageType.charAt(0).toUpperCase() + messageType.slice(1),
        text2: parseMessage(messageType, status, data),
        // renderLeadingIcon: '/img/alert-icon.jpg', 
        // visibilityTime: 2000, 
      });
    }

  }

  

  const _authHandling = <RetData extends TWildcardObject>(type: TMethods, a: TWildcardObject) => new Promise<{status:boolean, data :RetData}>((resolve, reject) => {
    switch(authMethods.authMethods) {
      case 'API':
        return resolve(apiHandler<RetData>(type, authMethods.authType as any, a, user, authMethods.authHandler))
      case 'Firebase':
        return resolve(firebaseHandler<RetData>(type, authMethods.authType, a, authMethods.authApp))
    }

    return reject('NO AUTH METHOD OR ERROR');
  })
 
  const register = 
    <RegForm extends TWildcardObject, RetData extends TWildcardObject>
    (a:RegForm,loginUponRegistration ?: boolean) => 
    new Promise<TMethodReturn>((resolve) => {
      _notificationHandler('info','register','start',a ?? {})
      _authHandling<RetData>('register',a ?? {})
      .then(res => { 
        if(res.status) {
          _notificationHandler('info','register','completed',res.data ?? {})
          if (loginUponRegistration === true) {
            localStorage.setItem(`${prefix}-user`,JSON.stringify(res.data)) 
            setUser(res.data as any); 
          }
          resolve({status:true, data: {apiReturn: res.data, formData: a}})
        } else {
          _notificationHandler('info','register','error',res.data ?? {})
          return resolve({status: false, data: {formData: a, apiReturn: res}})
        }  
      }).catch((err) => {
        _notificationHandler('info','register','error',err ?? {})
        return resolve({status: false, data: {formData: a, apiReturn: err}})
      })
  })

  const login = 
  <LoginType extends TWildcardObject>
  (a:LoginType) => 
  new Promise<TMethodReturn>((resolve,reject) => {
    _notificationHandler('info','login','start',a ?? {})
    _authHandling<UserType>('login',a ?? {})
    .then(res => { 
      if(res.status) {
        _notificationHandler('info','login','completed',res.data ?? {})
        if (a.persist) { localStorage.setItem(`${prefix}-user`,JSON.stringify(res.data)) }
        if (authMethods.authMethods !== "Firebase") { setUser(res.data); }
        resolve({status:true, data: {apiReturn :res.data, formData: a}})
      } else {
        _notificationHandler('info','login','error',res.data ?? {})
        localStorage.removeItem(`${prefix}-user`)
        resolve({status:false, data: {apiReturn : res, formData: a}}); 
        reject(false)
      }  
    }).catch((err) => {
      _notificationHandler('info','register','error',err ?? {})
      resolve({status:false, data: {apiReturn : err, formData: a}}); 
    })
  })
  
  const logout = () => new Promise<TMethodReturn>((resolve) => {
    _notificationHandler('info','logout','start',user !== null ? user : undefined)
    localStorage.removeItem(`${prefix}-user`)
    _authHandling('logout',{}).then((res) => {      
      localStorage.removeItem(`${prefix}-user`)
      setUser(null)
      _notificationHandler('success','logout','completed',res.data ?? {})
      resolve({status:true, data: {apiReturn: res.data, formData: null }})
    }).catch((err) => {
      _notificationHandler('error','logout','error',err ?? {})
      resolve({status:false, data: {apiReturn: err, formData: null }})
    })
    setUser(null)
  })

  const modify = 
  <ModForm extends TWildcardObject>
  (a:ModForm) => 
  new Promise<TMethodReturn>((resolve) => {    
    _notificationHandler('info','modify','start',user !== null ? user : undefined)
    _authHandling<UserType>('modify',a as any)
      .then(res => { 
        if(res.status) {
          setUser(res.data);           
          resolve({status: true, data: {apiReturn: res.data, formData: a}})          
          _notificationHandler('success','modify','completed',res.data)
        } else {
          _notificationHandler('error','modify','start',user !== null ? user : undefined)
          resolve({status: false, data: {apiReturn: res, formData: a}})
        }
      }).catch(err => {
        _notificationHandler('error','modify','start',user !== null ? user : undefined)
        resolve({status: false, data: {apiReturn: err, formData: a}})
      })

  })

  return {user, login, logout, modify, register}
} 

export default useAuthProvider