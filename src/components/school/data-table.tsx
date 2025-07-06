import React, { useState, type JSX } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";

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
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    
    return <ArrowDown className="ml-2 h-4 w-4" />;
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
      setSelectedRows(paginatedData.map((item) => item.id));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (onDelete && selectedRows.length > 0) {
      onDelete(selectedRows);
      setSelectedRows([]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center space-x-2">
          {onDelete && selectedRows.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedRows.length})
            </Button>
          )}
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of {title.toLowerCase()}</TableCaption>
          <TableHeader>
            <TableRow>
              {onDelete && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key as string}>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? 
              paginatedData.map((item) => {
                
                  return (
                      <TableRow
                          key={item._id}
                          data-state={selectedRows.includes(item._id) ? "selected" : undefined}
                      >
                          {onDelete && (
                              <TableCell className="w-12">
                                  <Checkbox
                                      checked={selectedRows.includes(item.id)}
                                      onCheckedChange={() => toggleRowSelection(item.id)}
                                      aria-label={`Select row ${item.id}`} />
                              </TableCell>
                          )}
                          {columns.map((col) => (
                              <TableCell key={col.key as string}>
                                  {String(item[col.key])}
                              </TableCell>
                          ))}
                          {actions && <TableCell>{actions(item)}</TableCell>}
                      </TableRow>
                  );
              })
            : 
              <TableRow key="no-results">
                <TableCell colSpan={onDelete ? columns.length + (actions ? 2 : 1) : columns.length + (actions ? 1 : 0)} className="text-center py-6">
                  No results found.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}