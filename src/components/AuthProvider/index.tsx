import React from 'react';
import useAuthProvider, {
  TMessages,
  TNotificationTypes,
  TuseAuth,
} from '../useAuthProvider';
import PropTypes from 'prop-types';
import { AuthOptions, DeepPartial } from '../types';

type IAuthProvider = {
  authenticationMode: AuthOptions;
  children: any;
  prefix: string;
  messages?: DeepPartial<TMessages>;
  notificationHandler?: (type: TNotificationTypes, message: string) => void;
}




export const AuthProviderContext = React.createContext<TuseAuth<any, any>>({
  user: null,
  register : (a:any) => new Promise((b) => b(a)),
  login: (a: any) => new Promise((b) => {b(a);}),
  logout: () => new Promise((b) => b({status:true, data: {apiReturn: null}})),
  modify: (a: any) => new Promise((b) => {b(a);}),
});

const AuthProvider = <
  T extends { [key: string]: any },
  U extends { [key: string]: any },
>( 
  props: IAuthProvider, 
) => {
  const { user, login, logout, modify, register } = useAuthProvider<T, U>(
    props.authenticationMode,
    props.prefix,
    props.messages,
    props.notificationHandler
  );

  return (
    <AuthProviderContext.Provider
      value={{
        user: user,
        login: login,
        logout: logout,
        modify: modify,
        register: register,
      }}
    >
      {props.children}
    </AuthProviderContext.Provider>
  );
};

AuthProvider.propTypes = {
  children : PropTypes.element.isRequired,
  prefix : PropTypes.string.isRequired,
  authenticationMode : PropTypes.oneOfType([
    PropTypes.shape({
      authMethods: PropTypes.oneOf(['API']),
      authType :  PropTypes.shape({
        url : PropTypes.shape({
          url : PropTypes.string.isRequired,
          method : PropTypes.string,
          headers : PropTypes.objectOf(PropTypes.string),
          args: PropTypes.objectOf(PropTypes.string)
        }),
        login : PropTypes.shape({
          url : PropTypes.string,
          method : PropTypes.string,
          headers : PropTypes.objectOf(PropTypes.string),
          args: PropTypes.objectOf(PropTypes.string)
        }),
        register : PropTypes.shape({
          url : PropTypes.string,
          method : PropTypes.string,
          headers : PropTypes.objectOf(PropTypes.string),
          args: PropTypes.objectOf(PropTypes.string)
        }),
        logout : PropTypes.shape({
          url : PropTypes.string,
          method : PropTypes.string,
          headers : PropTypes.objectOf(PropTypes.string),
          args: PropTypes.objectOf(PropTypes.string)
        }),
        modify : PropTypes.shape({ 
          url : PropTypes.string,
          method : PropTypes.string,
          headers : PropTypes.objectOf(PropTypes.string),
          args: PropTypes.objectOf(PropTypes.string)
        }),
      }),
      authHandler : PropTypes.func
    }),
    PropTypes.shape({
      authMethods: PropTypes.oneOf(['Firebase']),
      authType : PropTypes.oneOf(['EmailPassword','Google','Facebook']),
      authApp : PropTypes.object,
      useEmulator : PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
    }),
  ]),
  messages : PropTypes.shape({
    register : PropTypes.shape({start :PropTypes.string, completed : PropTypes.string, error : PropTypes.string}),
    login : PropTypes.shape({start :PropTypes.string, completed : PropTypes.string, error : PropTypes.string}),
    logout : PropTypes.shape({start :PropTypes.string, completed : PropTypes.string, error : PropTypes.string}),
    modify : PropTypes.shape({start :PropTypes.string, completed : PropTypes.string, error : PropTypes.string}),
  }),
  requestHandler: PropTypes.func,
  notificationHandler: PropTypes.func,
}

export default AuthProvider;
