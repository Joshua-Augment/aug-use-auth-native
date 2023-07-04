import {useContext} from "react"
import {AuthProviderContext} from "../../components/AuthProvider"

export const useAuth = () => useContext(AuthProviderContext) 