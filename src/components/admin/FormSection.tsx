import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="space-y-1 p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-neutral-900">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">{children}</CardContent>
    </Card>
  )
}
