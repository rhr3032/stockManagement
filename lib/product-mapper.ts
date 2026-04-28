type ProductWithBackendFields = {
  salePrice: number;
  stockQty: number;
  unit?: string | null;
  [key: string]: unknown;
};

export function mapProductForClient<T extends ProductWithBackendFields>(product: T) {
  return {
    ...product,
    sellPrice: product.salePrice,
    stock: product.stockQty,
    unit: product.unit ?? undefined,
  };
}
