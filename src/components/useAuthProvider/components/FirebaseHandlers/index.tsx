import {
  signInWithEmailAndPassword, 
  GoogleAuthProvider ,
  signInWithPopup, 
  FacebookAuthProvider, 
  signOut, 
  updateCurrentUser, 
  createUserWithEmailAndPassword,
  getAuth
} from 'firebase/auth'
import { initializeApp, FirebaseApp, FirebaseOptions, getApps} from "firebase/app"
import { TFirebaseAuthMethods, TMethods, TWildcardObject } from '../../../types'

export const firebaseHandler = <RetType extends TWildcardObject>(
  method: TMethods ,
  type: TFirebaseAuthMethods, 
  a: TWildcardObject, 
  appConfig : FirebaseOptions
) => new Promise<{status:boolean, data: RetType}>((resolve) => {
  const extApp = getApps().length === 0 || getApps().filter(x => x.name === 'aug-getAuth').length === 0 ? initializeApp(appConfig) : getApps().filter(x => x.name === 'aug-getAuth')[0]
  
  switch (method) {
    case 'login':
      return resolve(firebaseLoginHandler(type, a, extApp))
    case 'logout':
      return resolve(firebaseLogoutHandler(a, extApp))
    case 'register':
      return resolve(firebaseRegisterHandler(type, a, extApp))
    case 'modify':
      return resolve(firebaseModifyHandler(type, a, extApp))
  }
  return resolve({status:false, data: {error : 'UNRESOLVED', location: ''} as any})
})

const firebaseLogoutHandler = <RetType extends TWildcardObject>( a: TWildcardObject, extApp : FirebaseApp) => new Promise<{status:boolean, data: RetType}>((resolve) => {
  const auth = getAuth(extApp)
  signOut(auth)
  .then(() => {
    resolve({status:true, data: a as any})
    return
  })
  .catch((err) => {
    resolve({status:false, data: err})
    return 
  })
})

const firebaseRegisterHandler = <RetType extends TWildcardObject>(type: TFirebaseAuthMethods, a: TWildcardObject, extApp : FirebaseApp) => new Promise<{status:boolean, data: RetType}>((resolve) => {
  const auth = getAuth(extApp)
  switch (type) {
    case 'EmailPassword':
      createUserWithEmailAndPassword(auth, a.email, a.password)
      .then( user => {
        resolve({status:true, data : user.user as any})
        return
      }).catch((err) => {
        resolve({status:false, data: err})
        return 
      })
    break;
      default:
        return resolve({status:true, data:null as any})
  }

  // return resolve({status:false, data: {error : 'UNRESOLVED', location: ''} as any})
})

const firebaseModifyHandler = <RetType extends TWildcardObject>(type: TFirebaseAuthMethods, a: TWildcardObject, extApp : FirebaseApp) => new Promise<{status:boolean, data: RetType}>((resolve) => {
  const auth = getAuth(extApp)
  switch (type) {
    case 'EmailPassword':
      updateCurrentUser(auth, a as any)
      .then( () => {
        resolve({status:true, data : a as any})
        return
      })
      .catch((err) => {
        resolve({status:false, data: err})
        return
      })
      break;
        default:
          return resolve({status:true, data:null as any})
  }
  
  // return resolve({status:false, data: {error : 'UNRESOLVED', location: ''} as any})
})

const firebaseLoginHandler = <RetType extends TWildcardObject>(type: TFirebaseAuthMethods, a: TWildcardObject, extApp : FirebaseApp) => new Promise<{status:boolean, data: RetType}>((resolve) => {
  const auth = getAuth(extApp);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  const facebookProvider = new FacebookAuthProvider();


  switch(type) {
    case 'EmailPassword':
      signInWithEmailAndPassword(auth, a.email, a.password)
        .then(async (user)=> {
          const customClaims = await auth.currentUser?.getIdTokenResult()
          const token = await auth.currentUser?.getIdToken(true)

          resolve({status:true, data: {...user.user, token: token, claims : customClaims === undefined ? undefined : customClaims.claims} as any})
          return 
        }).catch((err) => {
          resolve({status:false, data: err})
          return
        })
      break;
    case 'Google':
      signInWithPopup(auth, googleProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential === null ? null : credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        
        return resolve({status:true, data: {...user, _token : token} as any})
      }).catch((error) => resolve({status: false, data: error}));
    case 'Facebook':
      signInWithPopup(auth, facebookProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential === null ? null : credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        
        return resolve({status:true, data: {...user, _token : token} as any})
      }).catch((error) => resolve({status: false, data: error}));
    default: 
      return resolve({status:false, data: {error : 'UNRESOLVED', location: ''} as any})
  }
})