export function isSafari() {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  return /^((?!chrome|android|crios|opr|edg|firefox|fxios).)*safari/i.test(navigator.userAgent);
}
