import { Button } from "#library/button/button"
import { Input } from "#library/input/input"
import { cn } from "#utils/cn"
import {
	forwardRef,
	type ComponentProps,
	type ComponentRef,
	type ForwardRefExoticComponent,
} from "react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

export type PhoneInputProps = Omit<
	ComponentProps<"input">,
	"onChange" | "value" | "ref"
> &
	Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
		onChange?: (value: RPNInput.Value) => void
	}

const PhoneInput: ForwardRefExoticComponent<PhoneInputProps> = forwardRef<
	ComponentRef<typeof RPNInput.default>,
	PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
	return (
		<RPNInput.default
			ref={ref}
			className={cn("flex", className)}
			// flagComponent={FlagComponent}
			countrySelectComponent={CountrySelect}
			inputComponent={InputComponent}
			smartCaret={false}
			value={value || ""}
			country="US"
			defaultCountry="US"
			/**
			 * Handles the onChange event.
			 *
			 * react-phone-number-input might trigger the onChange event as undefined
			 * when a valid phone number is not entered. To prevent this,
			 * the value is coerced to an empty string.
			 *
			 * @param {E164Number | undefined} value - The entered value
			 */
			onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
			{...props}
		/>
	)
})
PhoneInput.displayName = "PhoneInput"

const InputComponent = forwardRef<HTMLInputElement, ComponentProps<"input">>(
	({ className, ...props }, ref) => (
		<Input
			className={cn("rounded-e-lg rounded-s-none", className)}
			placeholder="(123) 456-7890"
			{...props}
			ref={ref}
		/>
	),
)
InputComponent.displayName = "InputComponent"

const CountrySelect = () => {
	return (
		<Button
			type="button"
			variant="outline"
			aria-disabled="true"
			className="pointer-events-none cursor-default flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 hover:bg-background"
		>
			<FlagComponent country="US" countryName="United States" />
		</Button>
	)
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
	const Flag = flags[country]

	return (
		<span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
			{Flag && <Flag title={countryName} />}
		</span>
	)
}

export { PhoneInput }
