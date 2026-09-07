/**
 * 301 judeforall.com → judecoffee.com when this Pages project
 * receives traffic for the old host (after DNS is pointed here).
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === "judeforall.com" || host === "www.judeforall.com") {
    url.protocol = "https:";
    url.hostname = "judecoffee.com";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
