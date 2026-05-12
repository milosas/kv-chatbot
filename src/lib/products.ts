import productsData from '../../data/products.json';

export type Product = {
  id: string;
  name: string;
  category: 'kondicionierius' | 'silumos_siurblys';
  subcategory: string;
  kw_cooling?: number;
  kw_heating: number;
  energy_class_cool?: string;
  energy_class_heat: string;
  price_eur: number;
  for_area_m2: string;
  features: string[];
  refrigerant: string;
  is_multi_split?: boolean;
  url: string;
};

export function loadProducts(): Product[] {
  return productsData as Product[];
}

export function formatProductsForPrompt(products: Product[]): string {
  return products
    .map((p) => {
      const cool = p.kw_cooling ? `${p.kw_cooling}kW vėsinimo, ` : '';
      const features = p.features.slice(0, 3).join(', ');
      return `- [${p.id}] ${p.name} — ${cool}${p.kw_heating}kW šildymo · plotui ${p.for_area_m2} m² · ${p.price_eur} € · ${features}`;
    })
    .join('\n');
}
