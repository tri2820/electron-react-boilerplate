import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';

import 'tailwindcss/tailwind.css';
import { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Blocks } from 'lucide-react';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';
import defaultAvatar from '/assets/img/default-avatar.jpg';

const DOMPurify = createDOMPurify();

export type Message = {
  role: 'assistant' | 'user';
  content: string;
};

export type Action = {
  log: string;
};

function MessageView({
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
      <img
        src={defaultAvatar}
        className="h-12 w-12 flex-none rounded-full border"
      />

      <div className="flex-1 rounded-xl">
        <p className="font-bold">
          {message.role === 'assistant' ? 'RUST-T' : 'You'}
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

function Hello() {
  const [mode, setMode] = useState<'default' | 'knowledge-base'>('default');
  const [input, setInput] = useState('');
  const textarea_ref = useRef<any>();
  const browserview_ref = useRef<any>();
  // const running_action = useSignal<Action>();
  // const latest_AI_message = useSignal<Message>();
  // const main_args = useSignal<string>("");
  // const rect = useSignal<{
  //   width: number;
  //   height: number;
  // }>({
  //   width: 0,
  //   height: 0,
  // });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Let's have an adventure together!`,
    },
  ]);

  useLayoutEffect(() => {
    textarea_ref.current.style.height = 'inherit';
    textarea_ref.current.style.height = `${Math.min(
      textarea_ref.current.scrollHeight,
      360,
    )}px`;
  }, [input]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = browserview_ref.current?.getBoundingClientRect();
      if (!rect) return;
      window.electron.send({
        browserwindow_dimension_update: {
          bound: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
        },
      });
    });

    observer.observe(browserview_ref.current);
    return () =>
      browserview_ref.current && observer.unobserve(browserview_ref.current);
  }, []);

  const submit = async () => {
    setInput('');
    // main_args.value = "";
    const latest_AI_message: Message = {
      role: 'assistant',
      content: '',
    };
    setMessages([
      ...messages,
      {
        role: 'user',
        content: input,
      },
      latest_AI_message,
    ]);

    // const result = await do_extract(text);
    // console.log(result);
    // const resume = z.object({
    //   name: z.string().describe("The person's name"),
    //   age: z.string().describe("The person's age"),
    //   applicant: z.object({
    //     name: z.string().describe("The person's name"),
    //     age: z.string().describe("The person's age"),
    //   }),
    // });

    // const schema = zodToJsonSchema(resume);
    // console.log("schema", schema);
    // return;

    // const stream = await complete(messages.slice(0, 4));
    // const stream = await window.electron.send([1, 2, 3, 4, 5]);
    // console.log('stream', stream);

    // let reply = "";
    // let store_partial_objects = "";
    // for await (const msg of stream) {
    //   console.log("msg", msg);
    //   if (msg.token) {
    //     running_action.value = undefined;
    //     latest_AI_message.value.content += msg.token;
    //     messages.value = [...messages.value];
    //   }

    //   if (msg.reply) {
    //     reply += msg.reply;
    //     const reply_parsed: null | {
    //       content: string;
    //     } = parsePartialJson(reply);
    //     console.log("reply_parsed", reply_parsed);
    //     latest_AI_message.value.content = reply_parsed?.content ?? "";
    //     messages.value = [...messages.value];
    //   }

    //   if (msg.store_partial_objects_part) {
    //     store_partial_objects += msg.store_partial_objects_part;
    //     const store_partial_objects_parsed: null | {
    //       partial_basic_obj: any;
    //       partial_education_obj: any;
    //       partial_work_experience_obj: any;
    //     } = parsePartialJson(store_partial_objects);
    //     console.log(
    //       "store_partial_objects_parsed",
    //       store_partial_objects_parsed,
    //     );
    //   }
    // }

    //   console.log("chunk", chunk);

    //   if (msg.action) {
    //     console.log("ACTION", msg);
    //     running_action.value = msg.action;
    //   }
    // }
  };

  return (
    <div className="flex">
      <div className="border-r border-neutral-100 flex flex-col bg-neutral-50 p-4 flex-none">
        <button>
          <Blocks className="w-6 h-6 text-neutral-600 hover:text-black transition-all" />
        </button>
      </div>

      <div className="flex-1 flex h-screen flex-col text-neutral-950">
        <div className="flex flex-none items-center space-x-2 overflow-hidden border-b border-neutral-50 px-4 py-2">
          <p className="text-sm font-semibold text-neutral-800">
            Unamed Workspace
            {/* <span className="text-neutral-400"> / browser</span> */}
          </p>

          <div className="flex-1 px-2 py-1 rounded bg-neutral-100 text-neutral-600">
            <p>https://reddit.com</p>
          </div>
        </div>

        <div className="flex max-h-full flex-1 overflow-auto ">
          <div
            className={`border-r border-neutral-50 relative flex flex-col overflow-auto  transition-[max-width] duration-300  scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200  scrollbar-thumb-rounded-full ${
              mode === 'default' ? ' w-1/3 max-w-full ' : ' max-w-0 '
            }`}
          >
            <div className="sticky top-0 z-50 flex flex-none items-center bg-gradient-to-b from-white px-2 py-3">
              {/* <div className="flex-1" /> */}
              {/* <div className="flex-1 text-xs text-neutral-500">
                <p>You are working on this workspace together</p>
              </div> */}
              <div className="flex flex-1">
                <div className="flex-1" />
                <button
                  type="submit"
                  className="flex flex-none items-center space-x-1 rounded border border-neutral-300 bg-white px-2 py-1 text-sm shadow hover:bg-neutral-50"
                >
                  <Plus className="h-4 w-4" />
                  <p>New chat</p>
                </button>
              </div>
            </div>

            <div className="flex-1 px-4 pb-4">
              {messages.map((m, i) => (
                <MessageView
                  key={`${m.content}`}
                  message={m}
                  action={
                    // m === latest_AI_message.value
                    //   ? running_action.value
                    //   :
                    undefined
                  }
                />
              ))}
            </div>

            <div className="sticky bottom-0 mx-2 flex-none bg-white bg-gradient-to-t from-white pb-4">
              <div className="flex items-start overflow-hidden rounded border border-neutral-300 shadow">
                <textarea
                  ref={textarea_ref}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  className="w-full resize-none  bg-transparent p-4 text-neutral-950 placeholder:text-neutral-600 focus:outline-none scrollbar-thumb-rounded-full"
                  placeholder="What's interesting?"
                />

                <button
                  type="submit"
                  onClick={submit}
                  disabled={input.length === 0}
                  className="mr-2 mt-2 rounded bg-neutral-300 p-2 transition-all enabled:hover:bg-black enabled:hover:text-white disabled:text-neutral-500 "
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 " ref={browserview_ref}></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
