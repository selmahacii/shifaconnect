'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PatientSearchResult {
  id: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
}

interface PatientSearchProps {
  onSearch: (query: string) => void;
  onSelect?: (patient: PatientSearchResult) => void;
  results?: PatientSearchResult[];
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showResults?: boolean;
  inline?: boolean;
}

export function PatientSearch({
  onSearch,
  onSelect,
  results = [],
  isLoading = false,
  placeholder = 'Rechercher un patient (nom, téléphone, N° dossier)...',
  className,
  debounceMs = 300,
  showResults = true,
  inline = false,
}: PatientSearchProps) {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const debouncedSearch = React.useCallback(
    (searchQuery: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    debouncedSearch(value);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle result selection
  const handleSelect = (patient: PatientSearchResult) => {
    onSelect?.(patient);
    setQuery(`${patient.firstName} ${patient.lastName}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {(query || isLoading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Effacer</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-4 py-2 text-left hover:bg-muted transition-colors',
                      'flex items-center justify-between gap-2'
                    )}
                    onClick={() => handleSelect(patient)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        N° {patient.fileNumber}
                        {patient.phone && ` • ${patient.phone}`}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full shrink-0',
                      patient.gender === 'MALE' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-pink-100 text-pink-700'
                    )}>
                      {patient.gender === 'MALE' ? 'M' : 'F'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <p className="text-sm">Aucun patient trouvé</p>
              <p className="text-xs mt-1">Essayez avec d'autres termes de recherche</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default PatientSearch;
