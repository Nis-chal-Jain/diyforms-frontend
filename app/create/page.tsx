"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  Loader2Icon,
  PlusIcon,
  TrashIcon,
  X,
} from "lucide-react"

import { useAuth } from "@/contexts/auth-provider"
import {
  ApiRequestError,
  createForm,
} from "@/lib/api"
import type { FormSettings, FormQuestion, QuestionType } from "@/types/form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
   AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormQuestionInput = Omit<FormQuestion, "_id">

type PageState = "editing" | "submitting" | "success"

const QUESTION_TYPES: QuestionType[] = [
  "text",
  "textarea",
  "number",
  "radio",
  "checkbox",
  "select",
]

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    text: "Short text",
    textarea: "Long text",
    number: "Number",
    radio: "Radio buttons",
    checkbox: "Checkboxes",
    select: "Dropdown",
  }
  return labels[type]
}

export default function CreateFormPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<FormQuestionInput[]>([
    {
      order: 1,
      type: "text",
      label: "",
      required: false,
    },
  ])
  const [settings, setSettings] = useState<Partial<FormSettings>>({
    status: "draft",
    restricted: false,
  })
  const [restrictedEmails, setRestrictedEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<PageState>("editing")
  const [createdFormSlug, setCreatedFormSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const addQuestion = () => {
    const newOrder = Math.max(...questions.map((q) => q.order), 0) + 1
    setQuestions([
      ...questions,
      {
        order: newOrder,
        type: "text",
        label: "",
        required: false,
      },
    ])
  }

  const updateQuestion = (order: number, updates: Partial<FormQuestionInput>) => {
    setQuestions(
      questions.map((q) => (q.order === order ? { ...q, ...updates } : q))
    )
  }

  const removeQuestion = (order: number) => {
    if (questions.length === 1) return
    setQuestions(questions.filter((q) => q.order !== order))
  }

  const moveQuestion = (order: number, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.order === order)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return
    }

    const newQuestions = [...questions]
    if (direction === "up") {
      [newQuestions[index], newQuestions[index - 1]] = [
        newQuestions[index - 1],
        newQuestions[index],
      ]
    } else {
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ]
    }

    // Re-order
    newQuestions.forEach((q, i) => {
      q.order = i + 1
    })
    setQuestions(newQuestions)
  }

  const addOption = (questionOrder: number) => {
    updateQuestion(questionOrder, {
      options: [
        ...(questions.find((q) => q.order === questionOrder)?.options || []),
        { label: "", value: "" },
      ],
    })
  }

  const removeOption = (questionOrder: number, optionIndex: number) => {
    const question = questions.find((q) => q.order === questionOrder)
    if (!question?.options) return

    updateQuestion(questionOrder, {
      options: question.options.filter((_, i) => i !== optionIndex),
    })
  }

  const updateOption = (
    questionOrder: number,
    optionIndex: number,
    label: string
  ) => {
    const question = questions.find((q) => q.order === questionOrder)
    if (!question?.options) return

    updateQuestion(questionOrder, {
      options: question.options.map((opt, i) =>
        i === optionIndex ? { ...opt, label, value: label } : opt
      ),
    })
  }

  const addRestrictedEmail = () => {
    if (!newEmail.trim()) return
    if (restrictedEmails.includes(newEmail)) return

    setRestrictedEmails([...restrictedEmails, newEmail])
    setNewEmail("")
  }

  const removeRestrictedEmail = (email: string) => {
    setRestrictedEmails(restrictedEmails.filter((e) => e !== email))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (questions.length === 0) {
      newErrors.questions = "At least one question is required"
    }

    for (const question of questions) {
      if (!question.label.trim()) {
        newErrors[`question-${question.order}`] = "Question label is required"
      }

      if (["radio", "checkbox", "select"].includes(question.type)) {
        if (!question.options || question.options.length === 0) {
          newErrors[`options-${question.order}`] =
            `Options are required for ${getQuestionTypeLabel(question.type)}`
        }

        for (const opt of question.options || []) {
          if (!opt.label.trim()) {
            newErrors[`option-label-${question.order}`] =
              "All options must have labels"
          }
        }
      }
    }

    if (
      settings.restricted &&
      settings.status !== "draft" &&
      restrictedEmails.length === 0
    ) {
      newErrors.restricted =
        "Restricted published forms require at least one allowed user"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setState("submitting")
    try {
      const form = await createForm({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map(({ order, type, label, description, placeholder, required, options, validation }) => ({
          order,
          type,
          label: label.trim(),
          description: description?.trim(),
          placeholder: placeholder?.trim(),
          required,
          options,
          validation,
        })),
        settings,
        userarr: restrictedEmails,
      })

      setCreatedFormSlug(form.formSlug)
      setState("success")
    } catch (err) {
      setState("editing")
      setErrors({
        submit: err instanceof ApiRequestError ? err.message : "Failed to create form",
      })
    }
  }

  const copyFormLink = () => {
    if (createdFormSlug) {
      const link = `https://www.diyforms.in/${createdFormSlug}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <h1 className="text-lg font-semibold">Create Form</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={state === "submitting"}
          >
            Cancel
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <AlertDialog
          open={state === "success"}
          onOpenChange={(open) => {
            if (!open) router.push("/")
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Form Created Successfully!</AlertDialogTitle>
              <AlertDialogDescription>
                Your form is ready to be shared. Copy the link below to start collecting responses.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
              <code className="flex-1 text-sm text-muted-foreground">
                https://www.diyforms.in/{createdFormSlug}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyFormLink}
                className="shrink-0"
              >
                {copied ? (
                  <CheckIcon className="size-4 text-green-600" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction
                variant="outline"
                onClick={() => router.push("/")}
              >
                Go to Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>Enter your form title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title *</Label>
              <Input
                id="form-title"
                placeholder="e.g., Customer Feedback Survey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={state !== "editing"}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="form-description">Description</Label>
              <Input
                id="form-description"
                placeholder="Optional description for your form"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={state !== "editing"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure form visibility and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={settings.status === "draft" ? "secondary" : "outline"}
                  className="text-left p-4"
                  onClick={() =>
                    setSettings({ ...settings, status: "draft" })
                  }
                  disabled={state !== "editing"}
                >
                  <span className="font-semibold">Draft</span>
                </Button>
                <Button
                  type="button"
                  variant={settings.status === "published" ? "secondary" : "outline"}
                  className="text-left p-4"
                  onClick={() =>
                    setSettings({ ...settings, status: "published" })
                  }
                  disabled={state !== "editing"}
                >
                  <span className="font-semibold">Published</span>
                </Button>
              </div>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.restricted}
                    onChange={(e) =>
                      setSettings({ ...settings, restricted: e.target.checked })
                    }
                    disabled={state !== "editing"}
                    className="rounded border border-input"
                  />
                  <span className="text-lg font-medium pb-1">Restrict access</span>
                </label>
              </div>
            </div>

            {settings.restricted && (
              <div>
                <Label htmlFor="add-email">Allowed user emails</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="add-email"
                      placeholder="user@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addRestrictedEmail()
                        }
                      }}
                      disabled={state !== "editing"}
                    />
                    <Button
                      onClick={addRestrictedEmail}
                      disabled={state !== "editing" || !newEmail.trim()}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>

                  {restrictedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {restrictedEmails.map((email) => (
                        <div
                          key={email}
                          className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                        >
                          {email}
                          <button
                            onClick={() => removeRestrictedEmail(email)}
                            disabled={state !== "editing"}
                            className="hover:opacity-70"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.restricted && (
                  <p className="mt-1 text-sm text-red-600">{errors.restricted}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add and customize your form questions</CardDescription>
            </div>
            <Button
              onClick={addQuestion}
              disabled={state !== "editing"}
              size="sm"
            >
              <PlusIcon className="mr-2 size-4" />
              Add question
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.questions && (
              <p className="text-sm text-red-600">{errors.questions}</p>
            )}

            {questions.map((question) => (
              <div
                key={question.order}
                className="space-y-4 rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>Question type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        updateQuestion(question.order, {
                          type: value as QuestionType,
                          options: ["radio", "checkbox", "select"].includes(value)
                            ? [{ label: "", value: "" }]
                            : undefined,
                        })
                      }
                      disabled={state !== "editing"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getQuestionTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-1">
                    <Button
                      onClick={() => moveQuestion(question.order, "up")}
                      disabled={
                        state !== "editing" || questions[0].order === question.order
                      }
                      variant="outline"
                      size="sm"
                    >
                      <ChevronUpIcon className="size-4" />
                    </Button>
                    <Button
                      onClick={() => moveQuestion(question.order, "down")}
                      disabled={
                        state !== "editing" ||
                        questions[questions.length - 1].order === question.order
                      }
                      variant="outline"
                      size="sm"
                    >
                      <ChevronDownIcon className="size-4" />
                    </Button>
                    <Button
                      onClick={() => removeQuestion(question.order)}
                      disabled={state !== "editing" || questions.length === 1}
                      variant="destructive"
                      size="sm"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`question-label-${question.order}`}>
                    Question *
                  </Label>
                  <Input
                    id={`question-label-${question.order}`}
                    placeholder="Your question here"
                    value={question.label}
                    onChange={(e) =>
                      updateQuestion(question.order, { label: e.target.value })
                    }
                    disabled={state !== "editing"}
                  />
                  {errors[`question-${question.order}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`question-${question.order}`]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`question-desc-${question.order}`}>
                    Description (optional)
                  </Label>
                  <Input
                    id={`question-desc-${question.order}`}
                    placeholder="Help text for this question"
                    value={question.description || ""}
                    onChange={(e) =>
                      updateQuestion(question.order, { description: e.target.value })
                    }
                    disabled={state !== "editing"}
                  />
                </div>

                {["text", "textarea"].includes(question.type) && (
                  <div>
                    <Label htmlFor={`question-placeholder-${question.order}`}>
                      Placeholder (optional)
                    </Label>
                    <Input
                      id={`question-placeholder-${question.order}`}
                      placeholder="Placeholder text"
                      value={question.placeholder || ""}
                      onChange={(e) =>
                        updateQuestion(question.order, { placeholder: e.target.value })
                      }
                      disabled={state !== "editing"}
                    />
                  </div>
                )}

                {["radio", "checkbox", "select"].includes(question.type) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button
                        onClick={() => addOption(question.order)}
                        disabled={state !== "editing"}
                        size="sm"
                        variant="outline"
                      >
                        <PlusIcon className="mr-1 size-3" />
                        Add option
                      </Button>
                    </div>

                    {errors[`options-${question.order}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`options-${question.order}`]}
                      </p>
                    )}

                    {errors[`option-label-${question.order}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`option-label-${question.order}`]}
                      </p>
                    )}

                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={option.label}
                            onChange={(e) =>
                              updateOption(question.order, idx, e.target.value)
                            }
                            disabled={state !== "editing"}
                          />
                          <Button
                            onClick={() =>
                              removeOption(question.order, idx)
                            }
                            disabled={
                              state !== "editing" ||
                              (question.options?.length || 0) <= 1
                            }
                            variant="destructive"
                            size="sm"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(question.order, { required: e.target.checked })
                    }
                    disabled={state !== "editing"}
                    className="rounded border border-input"
                  />
                  <span className="text-sm font-medium">Required question</span>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            disabled={state !== "editing"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={state !== "editing"}
          >
            {state === "submitting" && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            {state === "success" ? "Form Created!" : "Create Form"}
          </Button>
        </div>
      </main>
    </div>
  )
}
