# useAuth Hook for React
## Description

A simple hook for react to create easy registration and authentication handlers. Also provides simple notification handling and callbacks 
for post-processing or custom logic facilitation

## Props and Descriptions

The use of the hook is fairly simple, two elements are needed, the  <AuthProvider> element and the useAuth() hook

At the root level (or where the context should encompass), use the <AuthProvider> element and provide the props needed to get start

### Props
For AuthProvider the props are as follows
| Prop | Description | Required | Default | Type | TypeDef |
|---|---|---|---|---|---|
|authMethod| The Authentication Method used. An object with keys `authMethods` and `authType`, an optional `authHandler` is available for external implementation. `authMethods` can be either "API" or "Firebase" (More in plan). API method uses standard XHR requests, defaulting to the fetchAPI but may use authHandler if provided. Firebase uses the Firebase Authentication Method, and a Firebase initialization Object {apiKey : '', authDomain : '' , ....} needs to be provided as `authApp` | Yes| - |{authMethods: 'API' \| 'Firebase', authType : TEndpoints \| TFirebaseAuthMethods} | <table><tbody><tr><th colSpan="3">TEndpoint</th></tr><tr><th colSpan="3">{['url' \| 'register' \| 'login' \| 'logout' \| 'modify'] : TEndpointFields}</th></tr><tr><th colSpan="3"></th></tr><tr><th colSpan="3">TEndpointFields</th></tr><tr><th>Key</th><th>Value</th><th>Required</th></tr><tr><td>url</td><td>string</td><td>YES</td></tr><tr><td>method</td><td>RequestMethods ['POST','GET','DELETE','PUT','DELETE'] (Default:POST)</td><td>NO</td></tr><tr><td>headers</td><td>{[key:string] : string}</td><td>NO</td></tr><tr><td>args</td><td>{[key:string] : any}</td><td>NO</td></tr><tr><th colSpan="3"></th></tr><tr><th colSpan="3">TFirebaseAuthMethods =  'EmailPassword' \| 'Facebook' \| 'Google'</th></tr><tr><th colSpan="3">(For authMethod="Firebase", a Firebase App Config object needs to be provided as `authApp`)</th></tr><tr><th colSpan="3">For testing an argument `useEmulator` can be added, setting to true for default url ("http://localhost:9099") or a string to change that URL</th></tr></tbody></table> |
| prefix | The localStorage prefix for auth persistance. Always provide temporary tokens and never store sensitive data locally | Yes | undefined | string |
| messages | Message Strings for Event Notification. Defaults are available but may be overridden, and setting a value to false disables notification. Dot Notation may be used to access complex array structures as well, eg "Welcome back, {{ response.name }}"  |  No | See Typedef | [key: 'url' \| 'login' \| 'register' \| 'logout' \| 'modify'] : {start ?: string \| boolean, completed ?: string \| boolean, error ?: string \| boolean}| <table><tbody><tr><th colSpan="2">messages["register"]</th></tr><tr><th>Key</th><th>Value</th></tr><tr><td>start</td><td>'Registering User....'</td></tr><tr><td>completed</td><td>'User {{name}} Registered!'</td></tr><tr><td>error</td><td>'An error occured! Error : {{error}}'</td></tr><tr><th colSpan="2">messages["login"]</th></tr><tr><th>Key</th><th>Value</th></tr><tr><td>start</td><td>'Logging In....'</td></tr><tr><td>completed</td><td>'Logged In! Welcome, {{name}}'</td></tr><tr><td>error</td><td>'An error occured! Error : {{error}}'</td></tr><tr><th colSpan="2">messages["logout"]</th></tr><tr><th>Key</th><th>Value</th></tr><tr><td>start</td><td>'Logging Out....'</td></tr><tr><td>completed</td><td>'Goodbye, {{name}}!'</td></tr><tr><td>error</td><td>'An error occured! Error : {{error}}'</td></tr><tr><th colSpan="2">messages["modify"]</th></tr><tr><th>Key</th><th>Value</th></tr><tr><td>start</td><td>'Modifying Details...'</td></tr><tr><td>completed</td><td>'User details have been updated!'</td></tr><tr><td>error</td><td>'An error occured! Error : {{error}}'</td></tr></tbody></table> |
| notificationHandler | Custom Notification Logic. Notifications are handled by Vanilla Toasts natively (https://github.com/AlexKvazos/VanillaToasts), but can be handled externally by providing the logic to the wrapper | No| vanillaToasts | notificationHandler ?: (type:'error' \| 'success' \| 'info', message:string) => void) |

## Examples
### TLDR Example  

App.jsx/tsx

```
import {AuthProvider} from "aug-use-auth"

const App = () => {
  return (
  <AuthProvider
    authenticationMode={{
      authMethods : "API",
      authType : {
        url : {
          url : '/api/auth/'
        }
      }
    }}
    prefix='example-auth'
    messages={{
      login:{
        start: false,
        completed : 'Welcome back {{ username }}!'
      }
    }}
  >
    <div>SomeData</div>
  </AuthProvider>)
}
```

innerElement.jsx/tsx
```
import {useAuth} from "aug-use-auth"

const InnerElement = () => {
  const {user} = useAuth()

  return user === null ? <p>Please Log In!</p> : <p>Welcome back {user.name}! </p>
}
```

### Longer 
App.jsx/tsx 
```

return <AuthProvider 
  /*  
      `authType` refers to the application endpoint where the registration should take place. 
      You may pass a requestHandler function to handle the requests, but this endpoint will be 
      passed back to that function during execution. There are 5 endpoints, `url`, `register`, `login`, `logout`, and `modify`, 
      but only `url` is required, if the rest of the endpoints are provided they will be used, else the system falls back to `url`
  */
    authenticationMode={{
      authMethods:"API",
      authType:{
        url : {
          url : '/api/auth',
        },
        register : {
          url : '/api/auth/reg',
          method : 'POST',
          headers : {
            'Authorization' : 'Bearer ' + BEARER_TOKEN
          },
          args : {
            'ref' : REF_TOKEN
          }
        },
        /*
            If server requests should be handled with custom implementation, this can be passed as a prop with the following syntax; 
            const request_handler_implementation = (params: {[key: string]: any}, url: string, user: any|null) => new Promise((resolve, reject) => {
              // Response should be formatted as {status: boolean, data: {[key: string]: any} }
              handleRequest(params, url[, user]).then(response => resolve(response))
            })
            
        */
        authHandler: request_hander_implementation
      }
    }}

  /*
      Prefix is used internally to keep track of the auth in localStorage. NOTE that this data is handled 
      as plaintext; as such passwords should be omitted from the user's data. Instead it is recommended to
      provide a server side token for further authentication after logging in.
  */
  prefix='test-prefix'
  /*
      messages are notifications that will be shown at the start, upon completion, or upon error of any of the 
      provided methods. To disable any particular message, just set it to false. The Request data returned should
      have data in the format {status: boolean, data: {[key:string]: any}}, and this data will be used for templated
      responses. Messages can be templated by enclosing keys in a double curly-bracket {{ key }}.
      
      Default messages are provided, with the messages prop as optional for further customization
  */ 
  messages={{
    login : {
      start: disable,
      completed : 'Welcome back {{ name }} ! You have {{ messages_no }} unread tasks!'
    }
  }};

  /*
      VanillaToasts are use to handle the notifications natively, but if a custom notification handler is provided the hook will 
      pass event type and message to it to handle 
      type can be one of `info`, `error`, `success`
  */
  notificationHandler={notification_handler_implementation}
>
  <div>Testing, This should be your App.js content or any content that this context should react</div>
</AuthProvider>

```

### Firebase Example
App.jsx/tsx
```
import {AuthProvider} from "aug-use-auth"

const App = () => {
  return (
  <AuthProvider
    authenticationMode={{
      authMethods : "Firebase",
      authType : "EmailPassword"
    }}
    prefix='example-auth'
    messages={{
      login:{
        start: false,
        completed : 'Welcome back {{ username }}!'
      }
    }}
  >
    <div>SomeData</div>
  </AuthProvider>)
}
```

In any other element within the Provider's children's, use then useAuth() to retrieve the following objects and methods

|Item | Use | Type| Promise |
|---|-----|-----| ----|
|user | User Object, typically email, name, token etc. Only provide temporary hashes or tokens that can't be decoded to sensitive information as this data is saved on the client side. If no user logged in, this is null. For Firebase Authentication, a token from (getIdToken()) is given as user.token, and any custom claims if available are provided by the user.claims | UserType \| null | N/A |
|register | Sends a registration request, accepts an object of the registration form. Returns {status:true, data: any} if true. | (registrationData:any) => Promise | {status : boolean, data : {apiReturn : any, formData: registrationData } }
|login | Login function, accepts an object with the login details (email and password). Returns {status:true, data: UserData} if successful | (loginData:any, ) => Promise | {status : boolean, data : {apiReturn : any, formData: loginData } } 
|logout| Logout function .Clears the user object | () => Promise | {status : boolean, data : {apiReturn : any, formData: null } } | 
modify | To modify user details | (modifyFormData: any) => Promise | {status:boolean, data: {apiReturn : any, formData: modifyFormData}}

## TODO

1. Allow multiple options for authentication (Email / Password or Google etc)
2. More authentication methods

