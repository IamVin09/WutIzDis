'use client'

type Props = { onClose: () => void }

export function HowToPlayModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-4">How to Play 🤔</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-900/50 rounded-xl p-4">
            <h3 className="font-bold text-indigo-300 mb-2">🗣️ Clue-Giver</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Describe the target word</li>
              <li>Do NOT say the taboo words</li>
              <li>You have 2 minutes per turn</li>
              <li>Skip words you&apos;re stuck on</li>
            </ul>
          </div>
          <div className="bg-green-900/50 rounded-xl p-4">
            <h3 className="font-bold text-green-300 mb-2">💬 Guessers</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Type your guess in the box</li>
              <li>Press Enter to submit</li>
              <li>First correct answer wins the point</li>
              <li>Guessing is not case-sensitive</li>
              <li>Watch the activity feed!</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm text-gray-300">
            Every player takes a turn as the Clue-Giver. After all turns, the player with the most points wins!
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-3 text-sm text-center text-gray-400">
          Example card: <span className="text-white font-bold">ELEPHANT</span> — taboo words:{' '}
          <span className="text-red-400">Trunk, Tusk, Africa, Big, Peanuts</span>
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
