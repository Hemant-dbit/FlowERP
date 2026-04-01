const AUTH_EXPIRED_EVENT = 'flowerp:auth-expired'

export function emitAuthExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
}

export function onAuthExpired(handler) {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler)
}

export function offAuthExpired(handler) {
  window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
}
