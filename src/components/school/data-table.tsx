import React, { useState, type JSX } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface Column<T> {
  label: string;
  key: keyof T;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  actions?: (item: T) => JSX.Element;
  onDelete?: (ids: string[]) => void;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends { _id: string }>({
  data,
  columns,
  title,
  onDelete,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: null,
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const itemsPerPage = 10;
  
  // Filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    
    return columns.some((column) => {
      const value = item[column.key];
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data if sort config is set
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key && sortConfig.direction) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue === bValue) {
          return 0;
        }
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle number comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        
        return sortConfig.direction === 'asc' ? 1 : -1;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData:any[] = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Handle pagination
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handle sorting
  const handleSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
    
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Get sort icon based on current sort state
  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-blue-600" />;
    }
    
    return <ArrowDown className="ml-2 h-4 w-4 text-blue-600" />;
  };

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((item) => item._id));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (onDelete && selectedRows.length > 0) {
      onDelete(selectedRows);
      setSelectedRows([]);
    }
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get color for different field types
  const getFieldColor = (key: string, value: any) => {
    const stringValue = String(value).toLowerCase();
    
    // Name field - primary color
    if (key === 'name') {
      return 'text-blue-700 font-semibold';
    }
    
    // Term field - green color
    if (key === 'termName' || key.includes('term')) {
      return 'text-green-700 font-medium';
    }
    
    // Grade field - purple color
    if (key === 'gradeName' || key.includes('grade')) {
      return 'text-purple-700 font-medium';
    }
    
    // Date field - gray color
    if (key === 'createdAt' || key.includes('date')) {
      return 'text-gray-600 text-xs';
    }
    
    // Status-like fields
    if (stringValue.includes('active') || stringValue.includes('enabled')) {
      return 'text-green-600';
    }
    if (stringValue.includes('inactive') || stringValue.includes('disabled')) {
      return 'text-red-600';
    }
    if (stringValue.includes('pending') || stringValue.includes('waiting')) {
      return 'text-yellow-600';
    }
    
    // Default
    return 'text-gray-900';
  };

  // Get badge variant for status-like fields
  const getBadgeVariant = (key: string, value: any) => {
    const stringValue = String(value).toLowerCase();
    
    if (stringValue.includes('active') || stringValue.includes('enabled')) {
      return 'default';
    }
    if (stringValue.includes('inactive') || stringValue.includes('disabled')) {
      return 'destructive';
    }
    if (stringValue.includes('pending') || stringValue.includes('waiting')) {
      return 'secondary';
    }
    
    return 'outline';
  };

  // Render cell content with appropriate styling
  const renderCellContent = (key: string, value: any) => {
    const stringValue = String(value);
    
    // Date formatting
    if (key === 'createdAt' || key.includes('date')) {
      return (
        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
          {formatDate(stringValue)}
        </span>
      );
    }
    
    // Status-like fields with badges
    if (stringValue.toLowerCase().includes('active') || 
        stringValue.toLowerCase().includes('inactive') ||
        stringValue.toLowerCase().includes('pending') ||
        stringValue.toLowerCase().includes('enabled') ||
        stringValue.toLowerCase().includes('disabled')) {
      return (
        <Badge variant={getBadgeVariant(key, value)} className="text-xs">
          {stringValue}
        </Badge>
      );
    }
    
    // Term field with special styling
    if (key === 'termName' || key.includes('term')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {stringValue}
        </span>
      );
    }
    
    // Grade field with special styling
    if (key === 'gradeName' || key.includes('grade')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {stringValue}
        </span>
      );
    }
    
    // Name field with special styling
    if (key === 'name') {
      return (
        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
          {stringValue}
        </span>
      );
    }
    
    // Default rendering
    return (
      <span className={getFieldColor(key, value)}>
        {stringValue}
      </span>
    );
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="text-xs">
                {sortedData.length} {sortedData.length === 1 ? 'item' : 'items'}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view your data with advanced filtering and sorting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all columns..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {onDelete && selectedRows.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedRows.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <TableRow className="hover:bg-blue-50/80">
                {onDelete && (
                  <TableHead className="w-12 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <Checkbox
                      checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead key={col.key as string} className="bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold text-gray-700">
                    <div 
                      className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {getSortIcon(col.key)}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className="bg-gradient-to-r from-blue-50 to-indigo-50 font-semibold text-gray-700">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? 
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item._id}
                    data-state={selectedRows.includes(item._id) ? "selected" : undefined}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      selectedRows.includes(item._id) ? 'bg-blue-50' : ''
                    } ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}
                  >
                    {onDelete && (
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedRows.includes(item._id)}
                          onCheckedChange={() => toggleRowSelection(item._id)}
                          aria-label={`Select row ${item._id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key as string} className="py-3">
                        <div className="flex items-center">
                          {renderCellContent(col.key as string, item[col.key])}
                        </div>
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          {actions(item)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              : 
                <TableRow>
                  <TableCell 
                    colSpan={onDelete ? columns.length + (actions ? 2 : 1) : columns.length + (actions ? 1 : 0)} 
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No results found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
        
        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="text-gray-500 px-2">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}