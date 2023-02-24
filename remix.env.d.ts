/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

import type { AppData } from '@remix-run/server-runtime';

declare global {
  export type Env = {
    COUNTER: DurableObjectNamespace;
  };

  export interface AppLoadContext {
    env: Env;
    ctx: ExecutionContext;
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
