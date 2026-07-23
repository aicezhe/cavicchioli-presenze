// Эмблема платформы NOTA
// variant="full" — полный щит с текстом NOTA (для landing, крупных заголовков)
// variant="compact" — круглая версия (favicon, avatar, маленькие места в UI)
// variant="icon" — только щит с галочкой, без текста (для очень мелких размеров)

type CrestVariant = 'full' | 'compact' | 'icon';

interface PlatformCrestProps {
  variant?: CrestVariant;
  size?: number;
}

export function PlatformCrest({ variant = 'full', size = 60 }: PlatformCrestProps) {
  if (variant === 'compact') {
    return (
      <svg width={size} height={size} viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="66" fill="#1A1817" stroke="#6E859C" strokeWidth="2" />
        <circle cx="70" cy="70" r="56" fill="none" stroke="#6E859C" strokeWidth="0.75" />
        <path
          d="M50 70 L64 84 L92 50"
          stroke="#6E859C"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="70"
          y="112"
          textAnchor="middle"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="9"
          letterSpacing="3"
          fill="#F8F6F2"
        >
          NOTA
        </text>
      </svg>
    );
  }

  if (variant === 'icon') {
    return (
      <svg width={size} height={size * (170 / 150)} viewBox="0 0 150 170">
        <path
          d="M75 4 L138 26 V88 C138 124 112 154 75 168 C38 154 12 124 12 88 V26 Z"
          fill="#1A1817"
          stroke="#6E859C"
          strokeWidth="4"
        />
        <path
          d="M55 82 L70 98 L98 60"
          stroke="#6E859C"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // variant === 'full'
  return (
    <svg width={size} height={size * (170 / 150)} viewBox="0 0 150 170">
      <path
        d="M75 4 L138 26 V88 C138 124 112 154 75 168 C38 154 12 124 12 88 V26 Z"
        fill="#1A1817"
        stroke="#6E859C"
        strokeWidth="2.5"
      />
      <path
        d="M75 12 L130 31 V88 C130 118 108 144 75 157 C42 144 20 118 20 88 V31 Z"
        fill="none"
        stroke="#6E859C"
        strokeWidth="0.75"
        opacity="0.5"
      />
      <path
        d="M55 82 L70 98 L98 60"
        stroke="#6E859C"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="75"
        y="135"
        textAnchor="middle"
        fontFamily="Lora, Georgia, serif"
        fontWeight="700"
        fontSize="15"
        fill="#F8F6F2"
        letterSpacing="1"
      >
        NOTA
      </text>
    </svg>
  );
}
