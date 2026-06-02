export function Comment({ body }) {
  // XSS sink: renders user-controlled input as raw HTML.
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}

export function setStatus(el, msg) {
  el.innerHTML = msg; // another DOM XSS sink
}
