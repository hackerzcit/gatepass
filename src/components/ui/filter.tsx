"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface AppliedFilter {
  key: string;
  value: string;
  label: string;
  filterLabel: string;
}

interface FilterComponentProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: AppliedFilter[]) => void;
  appliedFilters?: AppliedFilter[];
}

export function FilterComponent({
  filters,
  onFiltersChange,
  appliedFilters = [],
}: FilterComponentProps) {
  const [open, setOpen] = useState(false);

  const handleFilterSelect = (filterKey: string, filterLabel: string, optionValue: string, optionLabel: string) => {
    // If "All" is selected, remove the filter for this category
    if (optionValue === "all") {
      const updatedFilters = appliedFilters.filter(filter => filter.key !== filterKey);
      onFiltersChange(updatedFilters);
      return;
    }

    const newFilter: AppliedFilter = {
      key: filterKey,
      value: optionValue,
      label: optionLabel,
      filterLabel: filterLabel,
    };

    // Remove existing filter with the same key and add the new one
    const updatedFilters = appliedFilters.filter(filter => filter.key !== filterKey);
    updatedFilters.push(newFilter);

    onFiltersChange(updatedFilters);
  };

  const handleClearAllFilters = () => {
    onFiltersChange([]);
  };

  const hasActiveFilters = appliedFilters.length > 0;

  const getSelectedValue = (filterKey: string) => {
    const appliedFilter = appliedFilters.find(f => f.key === filterKey);
    return appliedFilter ? appliedFilter.value : "all";
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[95vw] sm:w-[500px] lg:w-[600px] p-4 sm:p-6" align="start" side="bottom">
          <DropdownMenuLabel className="text-sm font-medium">
            Filter Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mb-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filters.map((filter) => {
              const selectedValue = getSelectedValue(filter.key);
              const allOptions = [{ value: "all", label: "All" }, ...filter.options];

              return (
                <div key={filter.key} className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">{filter.label}</h4>
                  <div className="space-y-2">
                    {allOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer py-1"
                      >
                        <div className="relative">
                          <input
                            type="radio"
                            name={filter.key}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={() => handleFilterSelect(filter.key, filter.label, option.value, option.label)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-colors",
                              selectedValue === option.value
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}
                          >
                            {selectedValue === option.value && (
                              <div className="w-2 h-2 bg-primary-foreground rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-foreground">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator className="my-4" />
              <Button
                onClick={handleClearAllFilters}
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
