"use client"

import type { FormQuestion } from "@/types/form"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

export type AnswerValue = string | number | string[] | undefined

type QuestionFieldProps = {
  question: FormQuestion
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  disabled?: boolean
}

export function QuestionField({
  question,
  value,
  onChange,
  disabled,
}: QuestionFieldProps) {
  const id = `q-${question._id}`

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {question.label}
        {question.required && (
          <span className="text-destructive"> *</span>
        )}
      </FieldLabel>
      {question.description && (
        <FieldDescription>{question.description}</FieldDescription>
      )}

      {question.type === "text" && (
        <Input
          id={id}
          type="text"
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          minLength={question.validation?.minLength}
          maxLength={question.validation?.maxLength}
          required={question.required}
        />
      )}

      {question.type === "textarea" && (
        <textarea
          id={id}
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
          rows={4}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      )}

      {question.type === "number" && (
        <Input
          id={id}
          type="number"
          placeholder={question.placeholder}
          value={value === undefined || value === "" ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value
            onChange(raw === "" ? undefined : Number(raw))
          }}
          disabled={disabled}
          min={question.validation?.min}
          max={question.validation?.max}
          required={question.required}
        />
      )}

      {question.type === "select" && (
        <select
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={question.required}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {question.type === "radio" && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={onChange}
          disabled={disabled}
          className="mt-1"
        >
          {question.options?.map((opt) => (
            <Field key={opt.value} orientation="horizontal">
              <RadioGroupItem
                value={opt.value}
                id={`${id}-${opt.value}`}
              />
              <FieldLabel
                htmlFor={`${id}-${opt.value}`}
                className="font-normal"
              >
                {opt.label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      )}

      {question.type === "checkbox" && (
        <div className="mt-1 flex flex-col gap-2">
          {question.options?.map((opt) => {
            const selected = Array.isArray(value) ? value : []
            const checked = selected.includes(opt.value)
            return (
              <Field key={opt.value} orientation="horizontal">
                <input
                  type="checkbox"
                  id={`${id}-${opt.value}`}
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, opt.value])
                    } else {
                      onChange(selected.filter((v) => v !== opt.value))
                    }
                  }}
                  className="size-4 rounded border border-input"
                />
                <FieldLabel
                  htmlFor={`${id}-${opt.value}`}
                  className="font-normal"
                >
                  {opt.label}
                </FieldLabel>
              </Field>
            )
          })}
        </div>
      )}
    </Field>
  )
}
