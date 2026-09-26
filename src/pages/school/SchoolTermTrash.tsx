import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../../lib/axios";
import { toast } from "sonner";
import { getCurrentUser } from "../../utils/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Trash2,
  RotateCcw,
  Search,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { TermType } from "../../types/Term";

export default function SchoolTermTrash() {
  const user = getCurrentUser();
  const [trashedTerms, setTrashedTerms] = useState<TermType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Permanent Delete Dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TermType | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const fetchTrashedTerms = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/terms/trash?school_id=${user?.school_id || ""}`);
      if (Array.isArray(res.data)) {
        setTrashedTerms(res.data);
      } else {
        setTrashedTerms([]);
      }
      setSelectedIds([]);
    } catch (err: any) {
      console.error("Failed to fetch trashed terms:", err);
      toast.error(err.response?.data?.error || "Failed to fetch trashed terms");
      setTrashedTerms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedTerms();
  }, []);

  const filteredTerms = useMemo(() => {
    return trashedTerms.filter((term) => {
      const yearMatch = term.year?.toLowerCase().includes(searchQuery.toLowerCase());
      const deptMatch = term.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return yearMatch || deptMatch;
    });
  }, [trashedTerms, searchQuery]);

  // Single Restore
  const handleRestore = async (term: TermType) => {
    setActionLoading(true);
    try {
      await API.put(`/terms/${term._id}/restore`);
      toast.success(`Term "${term.year}" restored successfully`);
      fetchTrashedTerms();
    } catch (err: any) {
      console.error("Error restoring term:", err);
      toast.error(err.response?.data?.error || "Failed to restore term");
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Restore
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await API.post("/terms/restore", { ids: selectedIds });
      toast.success(`${selectedIds.length} term(s) restored successfully`);
      fetchTrashedTerms();
    } catch (err: any) {
      console.error("Error restoring terms:", err);
      toast.error(err.response?.data?.error || "Failed to restore terms");
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Single Permanent Delete Confirmation
  const promptPermanentDelete = (term: TermType) => {
    setItemToDelete(term);
    setIsBulkDelete(false);
    setConfirmDeleteOpen(true);
  };

  // Trigger Bulk Permanent Delete Confirmation
  const promptBulkPermanentDelete = () => {
    if (selectedIds.length === 0) return;
    setItemToDelete(null);
    setIsBulkDelete(true);
    setConfirmDeleteOpen(true);
  };

  // Trigger Empty Trash
  const promptEmptyTrash = () => {
    if (trashedTerms.length === 0) return;
    setSelectedIds(trashedTerms.map((t) => t._id));
    setItemToDelete(null);
    setIsBulkDelete(true);
    setConfirmDeleteOpen(true);
  };

  // Execute Permanent Delete
  const executePermanentDelete = async () => {
    setActionLoading(true);
    try {
      if (isBulkDelete) {
        const idsToDelete = selectedIds.length > 0 ? selectedIds : trashedTerms.map((t) => t._id);
        await API.post("/terms/delete-permanent", { ids: idsToDelete });
        toast.success(`${idsToDelete.length} term(s) permanently deleted`);
      } else if (itemToDelete?._id) {
        await API.delete(`/terms/${itemToDelete._id}/permanent`);
        toast.success(`Term "${itemToDelete.year}" permanently deleted`);
      }
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
      fetchTrashedTerms();
    } catch (err: any) {
      console.error("Error permanently deleting term:", err);
      toast.error(err.response?.data?.error || "Failed to permanently delete term");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTerms.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTerms.map((t) => t._id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/school/term">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Terms
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trash2 className="h-7 w-7 text-red-500" />
            Term Trash
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage trashed terms. You can restore terms back to active status or delete them permanently.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTrashedTerms}
            disabled={loading || actionLoading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {trashedTerms.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={promptEmptyTrash}
              disabled={actionLoading}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Trashed Items</CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {trashedTerms.length} {trashedTerms.length === 1 ? "Term" : "Terms"} in Trash
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Items in the trash will stay here until restored or permanently removed.
              </CardDescription>
            </div>

            {/* Search and Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by year, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRestore}
                    disabled={actionLoading}
                    className="gap-1.5 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore ({selectedIds.length})
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={promptBulkPermanentDelete}
                    disabled={actionLoading}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Permanently ({selectedIds.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading trashed terms...
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {searchQuery ? "No matching trashed terms" : "Trash is Empty"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {searchQuery
                  ? "No trashed terms match your search filter. Try clearing the search box."
                  : "There are no terms in the trash. All your terms are active."}
              </p>
              {searchQuery ? (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Link to="/school/term">
                  <Button size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Go to Terms
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredTerms.length > 0 && selectedIds.length === filteredTerms.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Year / Term</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Trashed Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTerms.map((term) => {
                    const isSelected = selectedIds.includes(term._id);
                    const deptName = term.department?.name || "No Department";

                    return (
                      <TableRow
                        key={term._id}
                        data-state={isSelected ? "selected" : undefined}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="w-12">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(term._id)}
                            aria-label={`Select term ${term.year}`}
                          />
                        </TableCell>

                        {/* Year */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-700 font-semibold text-xs">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-foreground">
                                {term.year}
                              </span>
                              <div className="text-xs text-muted-foreground font-mono">
                                ID: {term._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Department */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{deptName}</span>
                          </div>
                        </TableCell>

                        {/* Trashed Date */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-red-400" />
                            <span>{formatDate(term.deletedAt || term.createdAt)}</span>
                          </div>
                        </TableCell>

                        {/* Action buttons */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestore(term)}
                              disabled={actionLoading}
                              className="h-8 gap-1.5 text-xs text-emerald-700 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                              title="Restore to active terms"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Restore
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => promptPermanentDelete(term)}
                              disabled={actionLoading}
                              className="h-8 gap-1.5 text-xs text-red-600 bg-red-50/60 border-red-200 hover:bg-red-100 hover:text-red-700"
                              title="Delete permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Permanently
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Permanent Deletion */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg text-red-600">
                  {isBulkDelete ? "Permanently Delete Terms?" : "Permanently Delete Term?"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {isBulkDelete
                    ? `Are you sure you want to permanently delete ${
                        selectedIds.length > 0 ? selectedIds.length : trashedTerms.length
                      } selected term(s)?`
                    : `Are you sure you want to permanently delete term "${itemToDelete?.year}"?`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-md bg-red-50 p-3 text-xs text-red-800 border border-red-200">
            ⚠️ <strong>Warning:</strong> This action cannot be undone. The term record will be permanently wiped from the database.
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executePermanentDelete}
              disabled={actionLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {actionLoading ? "Deleting..." : "Yes, Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}