import {
  dedupExchange,
  createClient,
  subscriptionExchange,
  Exchange,
} from "urql";
import { multipartFetchExchange } from "@urql/exchange-multipart-fetch";
import { persistedFetchExchange } from "@urql/exchange-persisted-fetch";
import { refocusExchange } from "@urql/exchange-refocus";
import { SubscriptionClient } from "benzene-ws-client";
import { pipe, onPush } from "wonka";
import { cacheExchange as createCacheExchange } from "@urql/exchange-graphcache";
import { simplePagination } from "@urql/exchange-graphcache/extras";
import { devtoolsExchange } from "@urql/devtools";
import { toast } from "~/lib/toast";
// import { default as schemaIntrospection } from "./introspection.json";
import {
  Story,
  StoriesDocument,
  StoryUsersDocument,
  StoriesQuery,
  StoryUsersQuery,
} from "~/graphql/gql.gen";
import { t } from "~/i18n/index";

const subscriptionClient =
  typeof window !== "undefined"
    ? new SubscriptionClient(`${process.env.WEBSOCKET_URI}/graphql`, {
        genId: (params) => params.key,
        reconnectionAttempts: Infinity,
      })
    : null;

const errorExchange: Exchange = ({ forward }) => (ops$) =>
  pipe(
    forward(ops$),
    onPush((result) => {
      if (result.error) {
        const { networkError, graphQLErrors } = result.error;

        if (networkError && typeof window !== "undefined")
          toast.error("Unable to connect to server.");

        graphQLErrors.forEach((error) => {
          let message = error.message;
          const code = error.extensions?.code;
          if (code === "PERSISTED_QUERY_NOT_FOUND") return;
          if (message.startsWith("Internal error:")) {
            // We log this error to console so dev can look into it
            console.error(error);
            message = t("error.internalError");
          }
          if (code === "UNAUTHENTICATED") message = t("error.authenticated");
          if (typeof window !== "undefined") toast.error(message);
        });
      }
    })
  );

const cacheExchange = createCacheExchange({
  // schema: schemaIntrospection as any,
  keys: {
    QueueItem: () => null,
  },
  resolvers: {
    Query: {
      messages: simplePagination({
        offsetArgument: "offset",
        mergeMode: "before",
      }),
    },
    Message: {
      // @ts-ignore
      createdAt: (parent) => new Date(parent.createdAt),
    },
    NowPlayingQueueItem: {
      playedAt: (parent) =>
        typeof parent.playedAt === "string" ? new Date(parent.playedAt) : null,
      endedAt: (parent) =>
        typeof parent.endedAt === "string"
          ? new Date(parent.endedAt)
          : undefined,
    },
    Story: {
      // @ts-ignore
      createdAt: (parent: Story) => new Date(parent.createdAt),
    },
  },
  updates: {
    Mutation: {
      createStory: (result, args, cache) => {
        const newStory = result.createStory as Story | null;
        if (newStory) {
          cache.updateQuery<StoriesQuery>(
            {
              query: StoriesDocument,
              variables: { creatorId: newStory.creatorId },
            },
            (data) =>
              data?.stories
                ? {
                    stories: data.stories
                      // Set all previous story to unlive
                      .map((s) => ({ ...s, isLive: false }))
                      .concat([newStory]),
                  }
                : { stories: [newStory] }
          );
        }
      },
      deleteStory: (result, args, cache) => {
        cache.invalidate({
          __typename: "Story",
          id: result.deleteStory as string,
        });
      },
      deleteMe: () => {
        window.resetUrqlClient();
      },
    },
    Subscription: {
      storyUsersUpdated: (result, args, cache) => {
        if (result.storyUsersUpdated) {
          cache.updateQuery<StoryUsersQuery>(
            {
              query: StoryUsersDocument,
              variables: { id: args.id },
            },
            () => ({ storyUsers: result.storyUsersUpdated as string[] })
          );
        }
      },
    },
  },
});

export const createUrqlClient = () =>
  createClient({
    url: `${process.env.API_URI}/graphql`,
    fetchOptions: { credentials: "include" },
    exchanges: [
      process.env.NODE_ENV !== "production" && devtoolsExchange,
      dedupExchange,
      typeof window !== "undefined" && refocusExchange(),
      cacheExchange,
      errorExchange,
      persistedFetchExchange({
        preferGetForPersistedQueries: true,
      }),
      multipartFetchExchange,
      subscriptionExchange({
        // @ts-ignore
        forwardSubscription(operation) {
          return subscriptionClient?.request(operation);
        },
      }),
    ].filter(Boolean) as Exchange[],
  });
