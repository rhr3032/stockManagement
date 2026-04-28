export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 6 characters
  return password && password.length >= 6;
}

export function validateProductForm(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "Product name is required";
  }

  if (typeof data.buyPrice !== "number" || data.buyPrice < 0) {
    errors.buyPrice = "Valid buy price is required";
  }

  if (typeof data.salePrice !== "number" || data.salePrice < 0) {
    errors.salePrice = "Valid sale price is required";
  }

  if (data.categoryId !== undefined && typeof data.categoryId !== "string") {
    errors.categoryId = "Category must be a valid string";
  }

  if (data.unit !== undefined && typeof data.unit !== "string") {
    errors.unit = "Unit must be a valid string";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCustomerForm(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "Customer name is required";
  }

  if (!data.phone || typeof data.phone !== "string" || !data.phone.trim()) {
    errors.phone = "Phone number is required";
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = "Invalid email address";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSupplierForm(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "Supplier name is required";
  }

  if (!data.phone || typeof data.phone !== "string" || !data.phone.trim()) {
    errors.phone = "Phone number is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
