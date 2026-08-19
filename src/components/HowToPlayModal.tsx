'use client'

type Props = { onClose: () => void }

export function HowToPlayModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-4">How to Play 🤔</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-indigo-900/50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-300 mb-2">🗣️ Clue-Giver</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Describe the target word to your team</li>
              <li>Do NOT say any of the taboo words</li>
              <li>You have 2 minutes per turn</li>
              <li>Skip words you&apos;re stuck on (no penalty)</li>
              <li>Earn <span className="text-green-400 font-bold">+1 pt</span> for every correct guess</li>
              <li>Say a taboo word = <span className="text-red-400 font-bold">−1 pt</span> and the word is skipped automatically</li>
            </ul>
          </div>
          <div className="bg-green-900/50 rounded-xl p-4">
            <h3 className="font-bold text-green-300 mb-2">💬 Guessers</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Type your guess in the box</li>
              <li>Press Enter or tap &quot;Go!&quot; to submit</li>
              <li>Guessing is not case-sensitive</li>
              <li>First correct answer earns <span className="text-green-400 font-bold">+1 pt</span> — and so does the clue-giver!</li>
              <li>Wrong guesses have no penalty — keep trying!</li>
              <li>Watch the activity feed for clues from teammates</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">Scoring</p>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="text-gray-400">Event</div>
            <div className="text-indigo-300">Giver</div>
            <div className="text-green-300">Guesser</div>
            <div className="text-gray-300">Correct guess</div>
            <div className="text-green-400 font-bold">+1</div>
            <div className="text-green-400 font-bold">+1</div>
            <div className="text-gray-300">Skip</div>
            <div className="text-gray-500">0</div>
            <div className="text-gray-500">—</div>
            <div className="text-gray-300">Taboo word said</div>
            <div className="text-red-400 font-bold">−1</div>
            <div className="text-gray-500">—</div>
          </div>
        </div>

        <div className="bg-amber-900/40 border border-amber-600 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-200">
            🎤 <span className="font-bold">Clue-givers:</span> allow microphone access when your browser asks for it (Chrome or Edge recommended). The game automatically listens for taboo words — if you say one, you&apos;ll be penalised and the word will be skipped instantly.
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-gray-300">
            Every player takes one turn as the Clue-Giver. After all turns are done, the player with the most points wins!
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-3 text-sm text-center text-gray-400">
          Example card: <span className="text-white font-bold">ELEPHANT</span> — taboo words:{' '}
          <span className="text-red-400">Trunk, Tusk, Africa, Big</span>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-bold transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
