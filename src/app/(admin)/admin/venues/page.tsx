"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { venueConfig } from "@/config";

const { admin, venueTypes } = venueConfig;
const { texts: adminTexts, texts: { tableHeaders, status: statusConfig } } = admin;

interface Venue {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
}

/**
 * 场地管理页面
 * 
 * 开发者 A 负责
 */
export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      // TODO: 调用管理后台 API
      // const res = await fetch("/api/admin/venues");
      // const data = await res.json();
      // setVenues(data.data);
      
      // 临时 mock 数据
      setVenues([
        { id: "1", name: "打位 A01", type: "driving_range", price: 100, status: "active" },
        { id: "2", name: "打位 A02", type: "driving_range", price: 100, status: "active" },
        { id: "3", name: "模拟器 S01", type: "simulator", price: 200, status: "active" },
        { id: "4", name: "VIP房 V01", type: "vip_room", price: 500, status: "maintenance" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = venueTypes.reduce((acc, t) => ({ ...acc, [t.key]: t.label }), {} as Record<string, string>);
  const statusLabels = statusConfig as Record<string, { label: string; color: string }>;

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{adminTexts.pageTitle}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {adminTexts.addButton}
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={adminTexts.searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 场地列表 */}
      <Card>
        <CardHeader>
          <CardTitle>{adminTexts.listTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">{adminTexts.loadingText}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{tableHeaders.name}</th>
                    <th className="pb-3 font-medium">{tableHeaders.type}</th>
                    <th className="pb-3 font-medium">{tableHeaders.price}</th>
                    <th className="pb-3 font-medium">{tableHeaders.status}</th>
                    <th className="pb-3 font-medium">{tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVenues.map((venue) => (
                    <tr key={venue.id} className="text-sm">
                      <td className="py-4 font-medium">{venue.name}</td>
                      <td className="py-4">{typeLabels[venue.type] || venue.type}</td>
                      <td className="py-4">¥{venue.price}/小时</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusLabels[venue.status]?.color || ""
                          }`}
                        >
                          {statusLabels[venue.status]?.label || venue.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
