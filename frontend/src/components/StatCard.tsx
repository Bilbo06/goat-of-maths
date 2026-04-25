import type { ThemeDef } from '../types';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color: 'red' | 'blue' | 'yellow' | 'orange';
  darkMode: boolean;
  theme: ThemeDef;
}

export default function StatCard({ icon, label, value, max, unit, darkMode, theme }: StatCardProps) {
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`${cardBg} rounded-lg shadow-lg p-3 border-2 border-amber-900 text-center`}>
      <div className="text-2xl">{icon}</div>
      <div className={`text-xs font-bold ${textClass}`}>{label}</div>
      <div className={`text-xl font-bold`} style={{ color: theme.primary }}>
        {value}{unit && ` ${unit}`}
      </div>
      {max && (
        <div className="mt-1 h-2 bg-gray-300 rounded-full overflow-hidden border border-black">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
          />
        </div>
      )}
    </div>
  );
}
