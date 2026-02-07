import * as React from "react";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioTrack } from "@/stores/audioStore";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TrackTableProps {
  tracks: AudioTrack[];
  currentTrack?: AudioTrack | null;
  onSelect?: (index: number) => void;
  className?: string;
}

export default function PlayListTable({
  tracks,
  currentTrack,
  onSelect,
  className,
}: TrackTableProps) {
  // if (!tracks || tracks.length === 0) return null;

  const columns = React.useMemo<ColumnDef<AudioTrack>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
        size: 10,
      },
      {
        accessorKey: "name",
        header: "歌曲",
        minSize: 200,
        maxSize: 320,
      },
      {
        accessorKey: "artist",
        header: "艺术家",
      },
      {
        accessorKey: "album",
        header: "专辑",
      },
      {
        accessorKey: "extension",
        header: "格式",
        cell: info => String(info.getValue()).toUpperCase(),
      },
      {
        id: "size",
        header: "大小",
        cell: ({ row }) =>
          row.original.source === "local"
            ? `${Math.round(row.original.size / 1024 / 1024)} MB`
            : "",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => onSelect && onSelect(row.index)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onSelect]
  );

  const table = useReactTable({ data: tracks, columns, getCoreRowModel: getCoreRowModel() });

  const activeRow = (track: AudioTrack) => {
    switch (currentTrack?.source) {
      case "local":
        if (track.source === "local") return currentTrack.path === track.path;
        break;
      case "kw":
        if (track.source === "kw") return currentTrack.url === track.url;
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("overflow-hidden border rounded-lg border-border", className)}>
      <Table className="w-full text-sm table-fixed">
        <TableHeader className="bg-muted/30 text-muted-foreground">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  style={{ width: `${header.getSize()}px` }}
                  key={header.id}
                  className="p-4 text-left"
                >
                  {header.isPlaceholder ? null : (
                    <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              className={cn("hover:bg-accent/50 transition-colors", {
                "bg-primary/10": activeRow(row.original),
              })}
              onDoubleClick={() => onSelect && onSelect(row.index)}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="p-4 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
