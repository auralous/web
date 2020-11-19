import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import ms from "ms";
import { useCurrentUser } from "~/hooks/user";
import {
  useMessagesQuery,
  useAddMessageMutation,
  useOnMessageAddedSubscription,
  Message,
  useUserQuery,
} from "~/graphql/gql.gen";
import { useI18n } from "~/i18n/index";

const MessageItem: React.FC<{
  message: Message;
}> = ({ message }) => {
  const user = useCurrentUser();
  const isCurrentUser = user?.id === message.creatorId;
  const dateDiff = Date.now() - message.createdAt;
  const dateDiffTxt = dateDiff < 1000 ? "Just now" : ms(dateDiff);
  const [{ data: { user: sender } = { user: undefined } }] = useUserQuery({
    variables: { id: message.creatorId },
  });

  return (
    <div className="text-sm w-full">
      <div className="opacity-75 text-xs">
        <span
          className={`${
            isCurrentUser ? "bg-success-light rounded-lg px-1" : ""
          } text-white font-bold`}
        >
          {sender?.username || ""}
        </span>
        {" • "}
        <span className="text-white opacity-75">{dateDiffTxt}</span>
      </div>
      <p className="text-white text-sm leading-tight text-opacity-75 truncate">
        {message.text}
      </p>
    </div>
  );
};

const LIMIT = 10;

const MessageList: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useI18n();

  const scrollShouldFollow = useRef(true);

  const [messages, setMessages] = useState<Message[]>([]);

  const [offset, setOffset] = useState(0);

  const [{ data, fetching }] = useMessagesQuery({
    variables: { id, limit: LIMIT, offset },
  });

  useEffect(() => {
    if (!data?.messages?.length) return;
    setMessages((prevMessages) => [...data.messages, ...prevMessages]);
  }, [data]);

  useOnMessageAddedSubscription<Message[]>(
    { variables: { id } },
    (_, response) => {
      response.messageAdded.createdAt = new Date(
        response.messageAdded.createdAt
      );
      setMessages([...messages, response.messageAdded]);
      return [];
    }
  );

  useEffect(() => {
    setMessages([]);
  }, [id]);

  const messageListRef = useRef<HTMLDivElement>(null);

  // Handle scroll and follow
  const onScroll = useCallback(
    ({ currentTarget }: React.UIEvent<HTMLDivElement, UIEvent>) => {
      // Should unfollow if scroll up and follow again if scroll back to bottom
      scrollShouldFollow.current =
        currentTarget.scrollTop >=
        currentTarget.scrollHeight - currentTarget.offsetHeight;
    },
    []
  );

  useEffect(() => {
    if (!messageListRef.current) return;
    console.log(scrollShouldFollow.current);
    if (scrollShouldFollow.current)
      // Scroll to bottom
      messageListRef.current.scrollTop =
        messageListRef.current.scrollHeight -
        messageListRef.current.offsetHeight;
  }, [messages]);

  const hasMore = useMemo(
    () => Boolean(data?.messages && data.messages.length >= LIMIT),
    [data]
  );

  return (
    <div
      className="relative flex-1 h-0 overflow-x-hidden overflow-y-auto p-4 space-y-2"
      onScroll={onScroll}
      ref={messageListRef}
    >
      <div className="h-12">
        {hasMore ? (
          <button
            onClick={() => setOffset(messages.length)}
            disabled={fetching}
            className="button w-full text-sm p-2"
          >
            {t("message.loadOlder")}
          </button>
        ) : (
          <p className="h-12 flex flex-center p-4 text-foreground-tertiary">
            {t("message.welcomeMessage")}
          </p>
        )}
      </div>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

const MessageInput: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useI18n();

  const [messageContent, setMessageList] = useState("");
  const [{ fetching }, addMessage] = useAddMessageMutation();
  function handleSubmitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimMsg = messageContent.trim();
    if (fetching || !trimMsg) return;
    addMessage({ id, text: trimMsg }).then(() => setMessageList(""));
  }
  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmitMessage}
      className="flex items-center mb-2 px-2"
    >
      <input
        aria-label={t("message.inputLabel")}
        placeholder={t("message.inputPlaceholder")}
        className="w-full input bg-background-secondary border-none focus:bg-background-tertiary"
        value={messageContent}
        onChange={(e) => setMessageList(e.target.value)}
      />
    </form>
  );
};

const Messager: React.FC<{ id: string }> = ({ id }) => {
  return (
    <div className="h-full w-full flex flex-col justify-between">
      <MessageList id={id} />
      <MessageInput id={id} />
    </div>
  );
};

export default Messager;