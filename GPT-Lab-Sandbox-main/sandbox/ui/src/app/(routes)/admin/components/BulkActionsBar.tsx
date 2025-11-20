'use client';

import React from 'react';
import { Button } from '@/components/Button';
import { 
  CheckCircle, 
  UserX, 
  Edit, 
  Trash2, 
  Mail, 
  Download,
  MoreHorizontal,
  X
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkApprove?: () => void;
  onBulkReject?: () => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  onBulkEmail?: () => void;
  onBulkExport?: () => void;
  className?: string;
}

export default function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkApprove,
  onBulkReject,
  onBulkEdit,
  onBulkDelete,
  onBulkEmail,
  onBulkExport,
  className = ''
}: BulkActionsBarProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  if (!hasSelection) {
    return null;
  }

  return (
    <div className={`bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Selection Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={isAllSelected ? onDeselectAll : onSelectAll}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <span className="text-sm font-medium text-text-primary">
              {selectedCount} of {totalCount} users selected
            </span>
          </div>
          
          {!isAllSelected && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSelectAll}
              className="text-text-secondary hover:text-text-primary"
            >
              Select All
            </Button>
          )}
          
          {hasSelection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDeselectAll}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Selection
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {onBulkApprove && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onBulkApprove}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve ({selectedCount})
            </Button>
          )}
          
          {onBulkReject && (
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onBulkReject}
            >
              <UserX className="w-4 h-4 mr-1" />
              Reject ({selectedCount})
            </Button>
          )}
          
          {onBulkEdit && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onBulkEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          
          {onBulkEmail && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onBulkEmail}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          )}
          
          {onBulkExport && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onBulkExport}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
          
          {onBulkDelete && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-400 border-red-400 hover:bg-red-400/10"
              onClick={onBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      {hasSelection && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>• {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected</span>
            <span>• Bulk operations available</span>
            <span>• Click actions above to proceed</span>
          </div>
        </div>
      )}
    </div>
  );
}
