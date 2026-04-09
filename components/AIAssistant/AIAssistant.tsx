'use client';

type AIAssistantProps = {
  onFixVoice: () => void;
  onQuickAction: (text: string) => void;
  onPrompt: (text: string) => void;
  response: string;
  loading: boolean;
};

export function AIAssistant({ onFixVoice, onQuickAction, onPrompt, response, loading }: AIAssistantProps) {
  return (
    <aside className="w-[300px] border-l border-slate-800 bg-slate-950/80 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">AI Assistant</p>
      <button className="mb-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-left text-xs text-white" onClick={onFixVoice}>
        🎤 Fix My Voice
      </button>
      <button className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs text-blue-200" onClick={() => onQuickAction('Enhance Mix')}>
        🎚️ Enhance Mix
      </button>
      <button className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs text-blue-200" onClick={() => onQuickAction('Make It Bigger')}>
        🚀 Make It Bigger
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const value = String(fd.get('prompt') ?? '').trim();
          if (!value) return;
          onPrompt(value);
          e.currentTarget.reset();
        }}
      >
        <textarea
          name="prompt"
          rows={3}
          placeholder="Describe what you want"
          className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-slate-200"
        />
        <button className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-slate-200">Send</button>
      </form>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
        {loading ? 'Processing...' : response}
      </div>
    </aside>
  );
}
