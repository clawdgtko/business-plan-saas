// Database migrations
export default {
  async fetch(request, env, ctx) {
    return new Response('Migrations runner - use wrangler d1 migrations apply')
  }
}