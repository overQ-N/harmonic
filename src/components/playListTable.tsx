import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical, Download, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AudioTrack, KwAudio } from "@/stores/audioStore";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSettingsStore } from "@/stores/settingsStore";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

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

  const { settings } = useSettingsStore();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    track: AudioTrack | null;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);

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
              onClick={e => {
                e.stopPropagation();
                onSelect && onSelect(row.index);
              }}
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

  const handleRowContextMenu = (e: React.MouseEvent, track: AudioTrack) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      track,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const showToast = (message: string) => {
    toast(message);
  };

  const handleDownload = async () => {
    if (!contextMenu?.track) return;
    const track = contextMenu.track;
    if (track.source !== "kw") {
      showToast("只有在线歌曲可以下载");
      closeContextMenu();
      return;
    }
    const kwTrack = track as KwAudio;
    if (!settings.downloadDirectory) {
      showToast("请先设置下载目录");
      closeContextMenu();
      return;
    }

    setDownloading(true);
    try {
      // Fetch audio data
      const response = await fetch(kwTrack.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Determine filename
      const sanitizedName = kwTrack.name.replace(/[<>:"/\\|?*]/g, "_");
      const extension = kwTrack.url.split(".").pop() || "mp3";
      const filename = `${sanitizedName}.${extension}`;
      const filePath = `${settings.downloadDirectory}/${filename}`;

      // Write file using Tauri fs plugin
      await writeFile(filePath, uint8Array);
      showToast(`已下载: ${filename}`);
    } catch (error) {
      console.error("Download failed:", error);
      showToast("下载失败");
    } finally {
      setDownloading(false);
      closeContextMenu();
    }
  };

  const handleAddToPlaylist = () => {
    // TODO: Implement add to playlist
    showToast("添加到歌单功能暂未实现");
    closeContextMenu();
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
              onContextMenu={e => handleRowContextMenu(e, row.original)}
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

      {/* Context Menu Popover */}
      {contextMenu && (
        <div
          className="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
              onClick={handleDownload}
              disabled={downloading || contextMenu.track?.source !== "kw"}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "下载中..." : "下载"}
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
              onClick={handleAddToPlaylist}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加到歌单
            </button>
          </div>
        </div>
      )}

      {/* Toast handled by sonner */}
    </div>
  );
}
