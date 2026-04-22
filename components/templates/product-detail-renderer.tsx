import type { TemplateId, ProductDetail } from '@/lib/types'
import { VitrinaProductDetail } from './vitrina/product-detail'
import { LuxoraProductDetail } from './luxora/product-detail'
import { NoirProductDetail } from './noir/product-detail'
import { MenuProductDetail } from './menu/product-detail'
import { EstateProductDetail } from './estate/product-detail'
import { PersonaProductDetail } from './persona/product-detail'
import { RosierProductDetail } from './rosier/product-detail'
import { InmueblesProductDetail } from './inmuebles/product-detail'
import { PosterProductDetail } from './poster/product-detail'

interface Props {
  template: TemplateId
  product: ProductDetail
}

// Fallback a Vitrina hasta que se implemente: atelier
const DETAIL_TEMPLATES: Record<
  TemplateId,
  React.ComponentType<{ product: ProductDetail }>
> = {
  vitrina: VitrinaProductDetail,
  luxora: LuxoraProductDetail,
  noir: NoirProductDetail,
  menu: MenuProductDetail,
  estate: EstateProductDetail,
  persona: PersonaProductDetail,
  poster: PosterProductDetail,
  atelier: VitrinaProductDetail,
  inmuebles: InmueblesProductDetail,
  rosier: RosierProductDetail,
}

export function ProductDetailRenderer({ template, product }: Props) {
  const Detail = DETAIL_TEMPLATES[template] ?? DETAIL_TEMPLATES.vitrina
  return <Detail product={product} />
}
