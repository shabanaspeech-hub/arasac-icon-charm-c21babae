import { useState, useEffect, useCallback } from 'react';
import {
  initDefaults,
  getCustomCategories,
  addCustomCategory,
  updateCustomCategory,
  deleteCustomCategory,
  getCustomItems,
  addCustomItem,
  updateCustomItem,
  deleteCustomItem,
  type CustomCategory,
  type CustomItem,
} from '@/lib/customStore';

export function useCustomData() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [items, setItems] = useState<CustomItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [cats, allItems] = await Promise.all([getCustomCategories(), getCustomItems()]);
    setCategories(cats);
    setItems(allItems);
  }, []);

  useEffect(() => {
    initDefaults().then(refresh).finally(() => setLoading(false));
  }, [refresh]);

  const createCategory = useCallback(async (nameEn: string, nameHi: string, emoji: string) => {
    const cat: CustomCategory = {
      id: `cat-${Date.now()}`,
      nameEn: `${emoji} ${nameEn}`,
      nameHi: `${emoji} ${nameHi}`,
      emoji,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    await addCustomCategory(cat);
    await refresh();
    return cat;
  }, [refresh]);

  const renameCategory = useCallback(async (id: string, nameEn: string, nameHi: string) => {
    await updateCustomCategory(id, { nameEn, nameHi });
    await refresh();
  }, [refresh]);

  const removeCategory = useCallback(async (id: string) => {
    await deleteCustomCategory(id);
    await refresh();
  }, [refresh]);

  const createItem = useCallback(async (item: Omit<CustomItem, 'id' | 'createdAt'>) => {
    const newItem: CustomItem = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await addCustomItem(newItem);
    await refresh();
    return newItem;
  }, [refresh]);

  const editItem = useCallback(async (id: string, updates: Partial<CustomItem>) => {
    await updateCustomItem(id, updates);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (id: string) => {
    await deleteCustomItem(id);
    await refresh();
  }, [refresh]);

  const getItemsForCategory = useCallback((categoryId: string) => {
    return items.filter(i => i.categoryId === categoryId);
  }, [items]);

  return {
    categories,
    items,
    loading,
    createCategory,
    renameCategory,
    removeCategory,
    createItem,
    editItem,
    removeItem,
    getItemsForCategory,
    refresh,
  };
}
