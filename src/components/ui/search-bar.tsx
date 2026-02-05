"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearchChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState<string>("");

  //when there is no input in the search bar, make it setSearchValue("")
  useEffect(() => {
    if (searchValue === "") {
      onSearchChange("");
    }
  }, [searchValue]);

  const handleSearch = () => {
    // Always trigger search, even with empty value
    onSearchChange(searchValue);
  };

  const handleReset = () => {
    setSearchValue("");
    onSearchChange("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className} w-full`}>
      <div className="flex items-center flex-1 border rounded-lg relative">
        <Search className="text-gray-700 ml-3 h-4 w-4" />
        <Input
          value={searchValue}
          className="border-none focus-visible:ring-transparent focus-visible:ring-offset-0 pr-8"
          placeholder={placeholder}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {searchValue && (
          <button
            onClick={handleReset}
            className="absolute right-2 hover:opacity-75 p-1"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
      <Button
        variant="outline"
        size="default"
        onClick={handleSearch}
        className="shrink-0"
      >
        Search
      </Button>
    </div>
  );
}