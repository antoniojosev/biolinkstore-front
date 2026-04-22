import type { TemplateId } from '@/lib/types'
import { VitrinaTemplate } from './vitrina'
import { LuxoraTemplate } from './luxora'
import { NoirTemplate } from './noir'
import { MenuTemplate } from './menu'
import { EstateTemplate } from './estate'
import { PersonaTemplate } from './persona'
import { RosierTemplate } from './rosier'
import { InmueblesTemplate } from './inmuebles'
import { AtelierTemplate } from './atelier'
import { PosterTemplate } from './poster'

interface Props {
  template: TemplateId
}

const TEMPLATES: Record<TemplateId, React.ComponentType> = {
  vitrina: VitrinaTemplate,
  luxora: LuxoraTemplate,
  noir: NoirTemplate,
  menu: MenuTemplate,
  estate: EstateTemplate,
  persona: PersonaTemplate,
  poster: PosterTemplate,
  atelier: AtelierTemplate,
  inmuebles: InmueblesTemplate,
  rosier: RosierTemplate,
}

export function TemplateRenderer({ template }: Props) {
  const Template = TEMPLATES[template] ?? TEMPLATES.vitrina
  return <Template />
}
