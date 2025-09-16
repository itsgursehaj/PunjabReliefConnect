
"use client";

import { districts } from "@/types";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";

interface DashboardFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export default function DashboardFilters({
    searchTerm,
    setSearchTerm,
    selectedDistrict,
    setSelectedDistrict,
    sortBy,
    setSortBy
}: DashboardFiltersProps) {
    return (
        <Card className="w-full mt-4">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-1/3">
                    <Input
                        placeholder="Search by Village Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-1/3">
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by District" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Districts</SelectItem>
                            {districts.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full sm:w-1/3">
                     <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Sort by Newest</SelectItem>
                            <SelectItem value="oldest">Sort by Oldest</SelectItem>
                            <SelectItem value="volunteers">Sort by Volunteers</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
