import { Search, Grid3x3, List, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function TopBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isDark,
  onThemeToggle,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Grid3x3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold">File Explorer</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-muted rounded-[10px] p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={`h-7 px-3 ${
              viewMode === "grid"
                ? "bg-background shadow-sm"
                : "hover:bg-transparent"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={`h-7 px-3 ${
              viewMode === "list"
                ? "bg-background shadow-sm"
                : "hover:bg-transparent"
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="rounded-[10px]"
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
