'use client'

const AVATARS = ['🦊', '🐻', '🐼', '🦁', '🐯', '🐨', '🐸', '🐙', '🦋', '🦄', '🐬', '🦉', '🐧', '🦝', '🐺', '🦖', '🐓']

type Props = {
  selected: string
  onSelect: (avatar: string) => void
}

export function AvatarGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className={`text-2xl rounded-lg p-2 transition-all ${
            selected === emoji
              ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
