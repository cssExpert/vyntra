"use client";

import { useState, useEffect } from "react";
import { pageWindow } from "@/modules/store/store.utils";

export interface UsePaginationResult<T> {
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  paginatedRows: T[];
  fromEntry: number;
  toEntry: number;
  pageCount: number;
  paginationWindow: (number | string)[];
  resetPageIndex: () => void;
}

export function useTablePagination<T>(
  data: T[],
  defaultPageSize = 10
): UsePaginationResult<T> {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 0 when data changes
  useEffect(() => {
    setPageIndex(0);
  }, [data.length]);

  const filteredCount = data.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = data.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );
  const paginationWindow = pageWindow(pageIndex, pageCount - 1);

  return {
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    paginatedRows,
    fromEntry,
    toEntry,
    pageCount,
    paginationWindow,
    resetPageIndex: () => setPageIndex(0),
  };
}
