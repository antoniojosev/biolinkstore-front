import type { TemplateId } from '@/lib/types'
import { VitrinaTemplate } from './vitrina'
import { LuxoraTemplate } from './luxora'
import { NoirTemplate } from './noir'

interface Props {
  template: TemplateId
}

const TEMPLATES: Record<TemplateId, React.ComponentType> = {
  vitrina: VitrinaTemplate,
  luxora: LuxoraTemplate,
  noir: NoirTemplate,
}

export function TemplateRenderer({ template }: Props) {
  const Template = TEMPLATES[template] ?? TEMPLATES.vitrina
  return <Template />
}
