import createDOMPurify from 'dompurify';
import { marked } from 'marked';
import defaultAvatar from '@/assets/img/default-avatar.png';

const DOMPurify = createDOMPurify();

export type Message = {
  role: 'assistant' | 'user';
  content: string;
};

export type Action = {
  log: string;
};

export default function MessageView({
  message,
  action,
}: {
  message: Message;
  action?: Action;
}) {
  const content = {
    __html: DOMPurify.sanitize(marked(message.content) as string),
  };

  return (
    <div className="flex space-x-2 ">
      {/* {message.role === 'assistant' ? (
        <img
          alt="Avatar"
          src={defaultAvatar}
          className="h-12 w-12 flex-none rounded-full border"
        />
      ) : (
        <div className="h-12 w-12 flex-none rounded-full border" />
      )} */}

      <div className="flex-1 rounded-xl">
        <p className="font-bold">
          {message.role === 'assistant' ? 'Auxy' : 'You'}
        </p>
        {action && (
          <div className="rounded border border-indigo-100 bg-indigo-50 px-4 py-2 font-semibold text-indigo-500">
            <p>{action.log}</p>
          </div>
        )}
        <div className="prose" dangerouslySetInnerHTML={content} />
      </div>
    </div>
  );
}
