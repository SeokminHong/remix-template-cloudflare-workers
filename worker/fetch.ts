import { createRequestHandler as createRemixRequestHandler } from '@remix-run/cloudflare';
import type { AppLoadContext, ServerBuild } from '@remix-run/cloudflare';
import {
  getAssetFromKV,
  MethodNotAllowedError,
  NotFoundError,
} from '@cloudflare/kv-asset-handler';
import * as build from '../build';
// @ts-ignore
import assetJson from '__STATIC_CONTENT_MANIFEST';

const ASSET_MANIFEST = JSON.parse(assetJson);

export interface GetLoadContextFunction<Env = unknown> {
  (request: Request, env: Env, ctx: ExecutionContext): AppLoadContext;
}

function createRequestHandler<Env>({
  /**
   * Remix build files
   */
  build,

  /**
   * Optional: Context to be available on `loader` or `action`, default to `undefined` if not defined
   * @param request Request
   * @param env Variables defined for the environment
   * @param ctx Exectuion context, i.e. ctx.waitUntil() or ctx.passThroughOnException();
   * @returns Context
   */
  getLoadContext,
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction<Env>;
}): ExportedHandlerFetchHandler<Env> {
  let handleRequest = createRemixRequestHandler(build, process.env.NODE_ENV);

  return (request: Request, env: Env, ctx: ExecutionContext) => {
    let loadContext =
      typeof getLoadContext === 'function'
        ? getLoadContext(request, env, ctx)
        : undefined;

    return handleRequest(request, loadContext);
  };
}

const requestHandler = createRequestHandler<Env>({
  build: build as unknown as ServerBuild,
  getLoadContext(_request, env, ctx) {
    return { env, ctx };
  },
});

interface BuildEnv extends Env {
  __STATIC_CONTENT: KVNamespace;
}

export async function fetch(
  request: Request,
  env: BuildEnv,
  ctx: ExecutionContext
) {
  try {
    let response = await assetHandler(request, env, ctx.waitUntil.bind(ctx));
    if (!response) response = await requestHandler(request, env, ctx);
    return response;
  } catch (e: any) {
    return new Response(e.message || e.toString(), {
      status: 500,
    });
  }
}

async function assetHandler(
  request: Request,
  env: BuildEnv,
  waitUntil: (a: Promise<any>) => void
) {
  try {
    const event = {
      request,
      waitUntil,
    };
    const options = {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST,
      cacheControl: {
        bypassCache: process.env.NODE_ENV === 'development',
      },
    };

    return await getAssetFromKV(event as FetchEvent, options);
  } catch (error) {
    if (
      error instanceof MethodNotAllowedError ||
      error instanceof NotFoundError
    ) {
      return null;
    }

    throw error;
  }
}
