// Shared types for opportunity filtering across matrix and table views

export type MatrixViewMode = 'opportunities-only' | 'combined' | 'consolidations-only';
export type TableViewMode = 'opportunities-only' | 'consolidations-only';

// Display labels for matrix filter dropdown
export const MATRIX_VIEW_OPTIONS: { value: MatrixViewMode; label: string }[] = [
  { value: 'opportunities-only', label: 'Opportunities Only' },
  { value: 'combined', label: 'Opportunities + Consolidations' },
  { value: 'consolidations-only', label: 'Consolidations Only' },
];

// Display labels for table filter dropdown
export const TABLE_VIEW_OPTIONS: { value: TableViewMode; label: string }[] = [
  { value: 'opportunities-only', label: 'Opportunities Only' },
  { value: 'consolidations-only', label: 'Consolidations Only' },
];
