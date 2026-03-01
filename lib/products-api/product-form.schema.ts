import { z } from 'zod'

export const productAttributeSchema = z.object({
  name: z.string().min(1, 'Nombre del atributo requerido'),
  options: z.array(z.string().min(1)).min(1, 'Agrega al menos una opcion'),
})

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(200, 'Maximo 200 caracteres'),
  description: z.string().max(500, 'Maximo 500 caracteres').optional().or(z.literal('')),
  basePrice: z
    .number({ required_error: 'Precio es requerido', invalid_type_error: 'Ingresa un numero valido' })
    .min(0, 'El precio no puede ser negativo'),
  compareAtPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).optional().nullable(),
  sku: z.string().optional().or(z.literal('')),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  attributes: z.array(productAttributeSchema).default([]),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
