import ChatPanel from '../components/assistant/ChatPanel';
import 'clsx';

export default function AssistantPage() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-5 sm:px-6">
      <ChatPanel />
    </div>
  );
}
