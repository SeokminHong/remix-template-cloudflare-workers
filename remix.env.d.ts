/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare/globals" />
/// <reference types="@cloudflare/workers-types" />

import type { AppData } from '@remix-run/server-runtime';

export {};

declare global {
  export interface AppLoadContext {
    COUNTER: DurableObjectNamespace;
  }

  export interface DataFunctionArgs {
    request: Request;
    context: AppLoadContext;
    params: Params;
  }

  export interface LoaderFunction {
    (args: DataFunctionArgs):
      | Promise<Response>
      | Response
      | Promise<AppData>
      | AppData;
  }

  export interface ActionFunction {
    (args: DataFunctionArgs):
      | Promise<Response>
      | Response
      | Promise<AppData>
      | AppData;
  }
}
