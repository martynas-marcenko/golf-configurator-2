import { forwardRef, useState, useRef, useEffect } from "preact/compat";
import { cn } from "../../lib/utils";
import { ChevronDown, Check } from "lucide-react";

const SelectRoot = ({ value, onValueChange, children, ...props }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  const handleValueChange = (newValue) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(!open);
    }
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {children({ 
        value, 
        open, 
        setOpen, 
        onValueChange: handleValueChange,
        onKeyDown: handleKeyDown 
      })}
    </div>
  );
};

const SelectTrigger = forwardRef(({ className, children, value, open, setOpen, onKeyDown, ...props }, ref) => (
  <button
    type="button"
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    className={cn(
      "flex h-12 w-full items-center justify-between rounded-lg border-2 border-border bg-card px-4 py-2 text-base font-medium",
      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "hover:border-muted-foreground hover:bg-muted transition-all duration-200",
      "disabled:cursor-not-allowed disabled:opacity-50",
      open && "border-black bg-black/10 text-black",
      className
    )}
    onClick={() => setOpen(!open)}
    onKeyDown={onKeyDown}
    ref={ref}
    {...props}
  >
    <div className="flex-1 text-left">{children}</div>
    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", open && "rotate-180")} />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, value }) => (
  <span className={value ? "text-foreground" : "text-muted-foreground"}>
    {value || placeholder}
  </span>
);

const SelectContent = forwardRef(({ className, children, open, ...props }, ref) => {
  if (!open) return null;

  return (
    <div
      role="listbox"
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto",
        "bg-white border-2 border-border rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = forwardRef(({ className, children, value, selected, onValueChange, ...props }, ref) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    className={cn(
      "relative flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm",
      "hover:bg-muted focus:bg-muted focus:outline-none",
      "first:rounded-t-lg last:rounded-b-lg",
      "transition-colors duration-200",
      selected && "bg-black/5 text-black font-medium",
      className
    )}
    onClick={() => onValueChange(value)}
    ref={ref}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {selected && (
      <Check className="ml-2 h-4 w-4" />
    )}
  </button>
));
SelectItem.displayName = "SelectItem";

// Simplified API for easier usage
const Select = ({ value, onValueChange, placeholder, options = [], className, children }) => {
  return (
    <SelectRoot value={value} onValueChange={onValueChange}>
      {({ value: currentValue, open, setOpen, onValueChange: handleChange, onKeyDown }) => (
        <>
          <SelectTrigger
            value={currentValue}
            open={open}
            setOpen={setOpen}
            onKeyDown={onKeyDown}
            className={className}
          >
            <SelectValue placeholder={placeholder} value={currentValue} />
          </SelectTrigger>
          <SelectContent open={open}>
            {children || options.map((option) => (
              <SelectItem
                key={typeof option === 'string' ? option : option.value}
                value={typeof option === 'string' ? option : option.value}
                selected={currentValue === (typeof option === 'string' ? option : option.value)}
                onValueChange={handleChange}
              >
                {typeof option === 'string' ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </>
      )}
    </SelectRoot>
  );
};

export { Select, SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem };