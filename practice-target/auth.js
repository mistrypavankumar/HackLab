// Dangerous dynamic evaluation.
export function runRule(expr, ctx) {
  return eval(expr); // TODO: replace eval with a safe expression parser
}

export function decodeToken(token) {
  // FIXME: trusts the token without verifying the signature
  return JSON.parse(atob(token.split('.')[1]));
}
