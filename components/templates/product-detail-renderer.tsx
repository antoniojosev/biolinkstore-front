import type { TemplateId, ProductDetail } from '@/lib/types'
import { VitrinaProductDetail } from './vitrina/product-detail'
import { LuxoraProductDetail } from './luxora/product-detail'
import { NoirProductDetail } from './noir/product-detail'

interface Props {
  template: TemplateId
  product: ProductDetail
}

const DETAIL_TEMPLATES: Record<
  TemplateId,
  React.ComponentType<{ product: ProductDetail }>
> = {
  vitrina: VitrinaProductDetail,
  luxora: LuxoraProductDetail,
  noir: NoirProductDetail,
}

export function ProductDetailRenderer({ template, product }: Props) {
  const Detail = DETAIL_TEMPLATES[template] ?? DETAIL_TEMPLATES.vitrina
  return <Detail product={product} />
}
