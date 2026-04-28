"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { useApi } from "@/hooks/useApi";
import { formatDateTime } from "@/lib/utils";
import { Category } from "@/types";

type CategoryWithCount = Category & {
  _count?: {
    products: number;
  };
};

export function CategoriesScreen() {
  const { get, post, loading } = useApi();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    const result = await get<CategoryWithCount[]>("/api/category/list");
    return result?.data ?? [];
  }, [get]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await fetchCategories();
      if (active) {
        setCategories(data);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    const result = await post<CategoryWithCount>("/api/category/create", {
      name: name.trim(),
    });

    if (!result?.data) {
      alert("Failed to create category");
      return;
    }

    setName("");
    const data = await fetchCategories();
    setCategories(data);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Category Management"
        description="Create and review product categories."
      />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Add Category</h3>
          <form className="grid gap-3" onSubmit={handleCreate}>
            <Input
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beverages"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!name.trim() || loading}>
                Add Category
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Category name"
            />
          </div>

          <div className="mb-3 flex items-center justify-between text-sm">
            <p>
              Total Categories: <strong>{categories.length}</strong>
            </p>
            <p>
              Filtered: <strong>{filtered.length}</strong>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-right">Products</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr key={category.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-2">{category.name}</td>
                    <td className="px-3 py-2 text-right">{category._count?.products ?? 0}</td>
                    <td className="px-3 py-2">{formatDateTime(category.updatedAt)}</td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={3}>
                      No categories found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
