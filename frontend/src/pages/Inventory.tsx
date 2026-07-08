import { useEffect, useState } from "react";
import type { InventoryItemDto } from "@mafioo/shared";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../design-system/DataTable";

export function InventoryPage() {
  const { refresh } = useAuth();
  const [items, setItems] = useState<InventoryItemDto[] | null>(null);

  async function load() {
    const data = await api.get<{ items: InventoryItemDto[] }>("/inventory");
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  async function sell(id: string) {
    await api.post(`/inventory/${id}/sell`);
    await load();
    await refresh();
  }

  if (!items) return <p>Loading inventory...</p>;

  return (
    <div>
      <h2>Inventory</h2>
      <DataTable
        rows={items}
        rowKey={(i) => i.id}
        emptyMessage="Your inventory is empty."
        columns={[
          { key: "name", header: "Item", render: (i) => i.name },
          { key: "category", header: "Category", render: (i) => i.category },
          { key: "quantity", header: "Qty", render: (i) => i.quantity },
          { key: "slot", header: "Equipped", render: (i) => i.equippedSlot ?? "-" },
          { key: "sell", header: "Sell for", render: (i) => `$${i.sellCash}` },
          {
            key: "actions",
            header: "",
            render: (i) => (
              <button className="button button--secondary" onClick={() => sell(i.id)}>
                Sell one
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
