import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import { StoreProvider } from '@wsh-2025/client/src/app/StoreContext';
import { createRoutes } from '@wsh-2025/client/src/app/createRoutes';
import { createStore } from '@wsh-2025/client/src/app/createStore';
import type { FastifyInstance } from 'fastify';
import { createStandardRequest } from 'fastify-standard-request-reply';
import htmlescape from 'htmlescape';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';

function getFiles(parent: string): string[] {
  const dirents = readdirSync(parent, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isFile() && !dirent.name.startsWith('.'))
    .map((dirent) => path.join(parent, dirent.name));
}

function getFilePaths(relativePath: string, rootDir: string): string[] {
  const files = getFiles(path.resolve(rootDir, relativePath));
  return files.map((file) => path.join('/', path.relative(rootDir, file)));
}

export function registerSsr(app: FastifyInstance): void {
  app.register(fastifyStatic, {
    prefix: '/public/',
    root: [
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist'),
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public'),
    ],
  });

  app.get('/favicon.ico', (_, reply) => {
    reply.status(404).send();
  });

  app.get('/*', async (req, reply) => {
    const start = performance.now();
    // @ts-expect-error ................
    const request = createStandardRequest(req, reply);

    const store = createStore({});
    console.log('margin1', performance.now() - start);
    const handler = createStaticHandler(createRoutes(store));
    console.log('createStaticHandler', performance.now() - start);
    const context = await handler.query(request);
    console.log('handler.query', performance.now() - start);
    if (context instanceof Response) {
      return reply.send(context);
    }
    console.log('margin2', performance.now() - start);
    const router = createStaticRouter(handler.dataRoutes, context);
    const appHtml = renderToString(
      <StrictMode>
        <StoreProvider createStore={() => store}>
          <StaticRouterProvider context={context} hydrate={false} router={router} />
          </StoreProvider>
      </StrictMode>,
    );


    const rootDir = path.resolve(__dirname, '../../../');
    const imagePaths = [
      getFilePaths('public/images', rootDir),
      // getFilePaths('public/animations', rootDir),
      // getFilePaths('public/logos', rootDir),
    ].flat();

    const imageLink = imagePaths.map((imagePath) => `<link as="image" href="${imagePath}" rel="preload" fetchpriority="low"/>`).join('\n');
    // const imageLink = null;
    // 適当なpreloadをやめさせる
    //           ${imagePaths.map((imagePath) => `<link as="image" href="${imagePath}" rel="preload" />`).join('\n')}

    console.log('end',performance.now(), store.getState())
    reply.type('text/html').send(/* html */ `
      <!DOCTYPE html>
      <html lang="ja" style="width: 100%; height: 100%;">
        <head>
          <meta charSet="UTF-8" />
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
          <link rel="stylesheet" href="@unocss/reset/tailwind-compat.css">
          <link rel="stylesheet" href="uno.css">
          ${imageLink ?? ""}
        </head>
        <script>
        window.__staticRouterHydrationData = ${htmlescape({
          actionData: context.actionData,
          loaderData: context.loaderData,
        })};
      </script>
      <script>
      window.__initialStoreState = ${htmlescape(store.getState())};
      </script>
      <body style="width: 100%; height: 100%;--un-bg-opacity: 1;--un-text-opacity: 1;background-color: rgb(0 0 0 / var(--un-bg-opacity));color: rgb(255 255 255 / var(--un-text-opacity));">
        <div id="root">${appHtml}</div>
        </body>
        <script src="/public/main.js"></script>
      </html>
    `);
  });
}
