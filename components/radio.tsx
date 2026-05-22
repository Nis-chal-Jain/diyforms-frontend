import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "./ui/card"

export function RadioGroupFieldset() {
  return (
    <Card className="h-full w-full">
    <FieldSet className="h-full w-full p-5">
      <FieldLegend variant="label" className="mb-0">
        Which chatbot do you prefer?
      </FieldLegend>

      <FieldDescription>
        Select one of the options below to indicate your preferred chatbot.
      </FieldDescription>

      <RadioGroup defaultValue="monthly" className="m-1">
        <Field orientation="horizontal">
          <RadioGroupItem value="monthly" id="plan-monthly" />
          <FieldLabel htmlFor="plan-monthly" className="font-normal">
            ChatGPT
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <RadioGroupItem value="yearly" id="plan-yearly" />
          <FieldLabel htmlFor="plan-yearly" className="font-normal">
            ClaudeAI
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <RadioGroupItem value="lifetime" id="plan-lifetime" />
          <FieldLabel htmlFor="plan-lifetime" className="font-normal">
            Gemini
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <RadioGroupItem value="other" id="plan-other" />
          <FieldLabel htmlFor="plan-other" className="font-normal">
            Other
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
    </Card>
  )
}