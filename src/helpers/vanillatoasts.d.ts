declare module 'vanillatoasts' {
  export function create(options : { 
    title ?: string,
    text ?: string,
    icons ?: string,
    onHide ?: () => void,
    positionClass ?: string,
    callback ?: () => void,
    single ?: boolean,
    timeout ?: number,
    type ?: string,
    hide ?: () => void,
  }):void
}