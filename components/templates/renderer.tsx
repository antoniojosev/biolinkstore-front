import type { TemplateId } from '@/lib/types'
import { VitrinaTemplate } from './vitrina'
import { LuxoraTemplate } from './luxora'
import { NoirTemplate } from './noir'
import { MenuTemplate } from './menu'
import { InmueblesTemplate } from './inmuebles'
import { ServiciosTemplate } from './servicios'

interface Props {
  template: TemplateId
}

const TEMPLATES: Record<TemplateId, React.ComponentType> = {
  vitrina: VitrinaTemplate,
  luxora: LuxoraTemplate,
  noir: NoirTemplate,
  menu: MenuTemplate,
  inmuebles: InmueblesTemplate,
  servicios: ServiciosTemplate,
}

export function TemplateRenderer({ template }: Props) {
  const Template = TEMPLATES[template] ?? TEMPLATES.vitrina
  return <Template />
}
