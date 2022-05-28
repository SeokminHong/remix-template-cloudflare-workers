import { createRequestHandler } from "@remix-run/server-runtime";
import type { ServerBuild } from "@remix-run/cloudflare";
import {
  getAssetFromKV,
  MethodNotAllowedError,
  NotFoundError,
} from "@cloudflare/kv-asset-handler";
import * as build from "../build";
// @ts-ignore
import assetJson from "__STATIC_CONTENT_MANIFEST";

const ASSET_MANIFEST = JSON.parse(assetJson);

const requestHandler = createRequestHandler(
  build as unknown as ServerBuild,
  process.env.NODE_ENV
);
interface Context {
  waitUntil: (a: Promise<any>) => void;
}
interface Env {
  COUNTER: DurableObjectNamespace;
  __STATIC_CONTENT: any;
}
export async function fetch(request: Request, env: Env, ctx: Context) {
  try {
    let response = await assetHandler(request, env, ctx.waitUntil.bind(ctx));
    if (!response) response = await requestHandler(request, env);
    return response;
  } catch (e: any) {
    return new Response(e.message || e.toString(), {
      status: 500,
    });
  }
}

async function assetHandler(
  request: Request,
  env: Env,
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
        bypassCache: process.env.NODE_ENV === "development",
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
