import seedData from './seed.json';

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  pricing_category: string;
  image_filename: string;
  company_id: number;
  company_name: string;
  area_id: number;
  area_name: string;
  type: string;
  is_available: number;
  cultural_benefits?: string;
  size_quantity?: string;
  awards?: string;
};

export type Company = {
  id: number;
  name: string;
  category: string;
  contact_email: string;
};

export type Area = {
  id: number;
  name: string;
};

export type Vote = {
  id: number;
  resident_id: number;
  product_id: number;
  vote_value: 'yes' | 'no';
};

const typedSeedData = seedData as {
  products?: Record<string, unknown>[];
  companies?: Record<string, unknown>[];
  areas?: Record<string, unknown>[];
  votes?: Record<string, unknown>[];
};

const rawProducts = typedSeedData.products || [];
const rawCompanies = typedSeedData.companies || [];
const rawAreas = typedSeedData.areas || [];
const rawVotes = typedSeedData.votes || [];

/**
 * Normalises image filenames from the seed data (which uses spaces and
 * mixed casing from the original PHP/MySQL database) to match the actual
 * files on disk (lowercase, hyphenated).
 */
function normaliseImageFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\s*\((\d+)\)/g, '-$1')   // " (1)" → "-1"
    .replace(/\s+/g, '-');              // spaces → hyphens
}

export function getCompanies(): Company[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawCompanies.map((c: any) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    contact_email: c.contact_email
  }));
}

export function getAreas(): Area[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawAreas.map((a: any) => ({
    id: a.id,
    name: a.name
  }));
}

export function getProducts(): Product[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawProducts.map((p: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const company: any = rawCompanies.find((c: any) => c.id === p.company_id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const area: any = rawAreas.find((a: any) => a.id === p.area_id);
    
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: parseFloat(p.price),
      pricing_category: p.pricing_category,
      image_filename: normaliseImageFilename(p.image_filename),
      company_id: p.company_id,
      company_name: company ? company.name : 'Unknown Company',
      area_id: p.area_id,
      area_name: area ? area.name : 'Unknown Area',
      type: p.type || 'product',
      is_available: p.is_available,
      cultural_benefits: p.cultural_benefits || '',
      size_quantity: p.size_quantity || '',
      awards: p.awards || ''
    };
  });
}

export function getProductById(id: number): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function getVoteCounts(productId: number): { yes: number; no: number } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const votes = rawVotes.filter((v: any) => v.product_id === productId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yes = votes.filter((v: any) => v.vote_value === 'yes').length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const no = votes.filter((v: any) => v.vote_value === 'no').length;
  return { yes, no };
}

export function getCategories(): string[] {
  const products = getProducts();
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}
