import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ context }) => {
  const { env } = context;
  const id = env.COUNTER.idFromName('home page count');
  const pageCount = env.COUNTER.get(id);
  const count = await pageCount.fetch('/increment');
  return count.json();
};

export default function Index() {
  const count: number = useLoaderData();

  return (
    <div className="font-sans">
      <h1>Welcome to Remix</h1>
      <h2>You're vistior number: {count}!</h2>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
