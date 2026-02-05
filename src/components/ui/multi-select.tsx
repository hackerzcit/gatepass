import * as React from "react"
import { cn } from "@/lib/utils"
import ReactSelect, { Props, components, MultiValue, ActionMeta } from "react-select"
import { Check, ChevronDown, X } from "lucide-react"

export interface Option {
  label: string
  value: string
}

export interface MultiSelectProps extends Omit<Props<Option, true>, "classNames" | "onChange"> {
  options: Option[]
  value?: Option[]
  onChange?: (value: Option[], actionMeta: ActionMeta<Option>) => void
  placeholder?: string
  className?: string
  error?: boolean
}

const MultiSelect = React.forwardRef<any, MultiSelectProps>(
  ({ className, options, value, onChange, placeholder = "Select options...", error, ...props }, ref) => {
    const customStyles = {
      control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: "hsl(var(--background))",
        borderColor: error
          ? "hsl(var(--destructive))"
          : state.isFocused
          ? "hsl(var(--ring))"
          : "hsl(var(--border))",
        borderRadius: "calc(var(--radius) - 2px)",
        boxShadow: state.isFocused ? "0 0 0 calc(var(--ring-offset-width)) hsl(var(--ring))" : "none",
        "&:hover": {
          borderColor: state.isFocused
            ? "hsl(var(--ring))"
            : error
            ? "hsl(var(--destructive))"
            : "hsl(var(--border))",
        },
        padding: "1px",
        minHeight: "36px",
        fontSize: "13px",
      }),
      menu: (provided: any) => ({
        ...provided,
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "calc(var(--radius) - 2px)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        marginTop: "4px",
        zIndex: 50,
      }),
      menuList: (provided: any) => ({
        ...provided,
        padding: "2px",
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused
          ? "hsl(var(--muted) / 0.5)"
          : "transparent",
        color: "hsl(var(--foreground))",
        cursor: "pointer",
        padding: "6px 8px",
        fontSize: "13px",
        "&:active": {
          backgroundColor: "hsl(var(--muted) / 0.7)",
        },
      }),
      multiValue: (provided: any) => ({
        ...provided,
        backgroundColor: "hsl(var(--muted))",
        borderRadius: "calc(var(--radius) - 4px)",
        padding: "0px 1px",
        margin: "2px 4px 2px 0",
      }),
      multiValueLabel: (provided: any) => ({
        ...provided,
        color: "hsl(var(--foreground))",
        fontSize: "13px",
        padding: "1px 4px",
      }),
      multiValueRemove: (provided: any) => ({
        ...provided,
        color: "hsl(var(--foreground))",
        padding: "0 2px",
        "&:hover": {
          backgroundColor: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
        },
        borderRadius: "0 4px 4px 0",
      }),
      input: (provided: any) => ({
        ...provided,
        color: "hsl(var(--foreground))",
        margin: "2px",
        fontSize: "13px",
      }),
      placeholder: (provided: any) => ({
        ...provided,
        color: "hsl(var(--muted-foreground))",
        margin: "2px",
        fontSize: "13px",
      }),
      valueContainer: (provided: any) => ({
        ...provided,
        padding: "2px 4px",
        gap: "2px",
      }),
      clearIndicator: (provided: any) => ({
        ...provided,
        padding: "2px",
        cursor: "pointer",
        color: "hsl(var(--muted-foreground))",
        "&:hover": {
          color: "hsl(var(--foreground))",
        },
      }),
      dropdownIndicator: (provided: any) => ({
        ...provided,
        padding: "2px",
        color: "hsl(var(--muted-foreground))",
        "&:hover": {
          color: "hsl(var(--foreground))",
        },
      }),
    }

    const CustomDropdownIndicator = (props: any) => {
      return (
        <components.DropdownIndicator {...props}>
          <ChevronDown className="h-3.5 w-3.5" />
        </components.DropdownIndicator>
      )
    }

    const CustomOption = (props: any) => {
      return (
        <components.Option {...props}>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 flex items-center justify-center">
              {props.isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </div>
            <span className={cn(
              "text-[13px]",
              props.isSelected && "font-medium"
            )}>
              {props.label}
            </span>
          </div>
        </components.Option>
      )
    }

    const CustomMultiValueRemove = (props: any) => {
      return (
        <components.MultiValueRemove {...props}>
          <X className="h-3 w-3" />
        </components.MultiValueRemove>
      )
    }

    const handleChange = (newValue: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
      onChange?.(Array.from(newValue), actionMeta)
    }

    return (
      <ReactSelect
        ref={ref}
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("w-full", className)}
        classNamePrefix="react-select"
        styles={customStyles}
        components={{
          DropdownIndicator: CustomDropdownIndicator,
          Option: CustomOption,
          MultiValueRemove: CustomMultiValueRemove,
        }}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        {...props}
      />
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
