interface SortControlsProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function SortControls({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SortControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between mb-4">
      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border-4 border-wood-brown bg-sand-beige p-2 text-xs text-ocean-dark flex-1"
      >
        <option value="default">Sort: Default</option>
        <option value="name-asc">Sort: Name (A-Z)</option>
        <option value="name-desc">Sort: Name (Z-A)</option>
        <option value="date">Sort: Date Added (Newest)</option>
        <option value="system">Sort: System</option>
      </select>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`btn-retro text-xs px-3 py-2 ${
            viewMode === 'grid' ? 'bg-pirate-gold' : 'bg-wood-brown'
          }`}
          title="Grid View"
        >
          ▦
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`btn-retro text-xs px-3 py-2 ${
            viewMode === 'list' ? 'bg-pirate-gold' : 'bg-wood-brown'
          }`}
          title="List View"
        >
          ☰
        </button>
      </div>
    </div>
  );
}
