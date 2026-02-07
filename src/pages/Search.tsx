import PlayListTable from "@/components/playListTable";
import { Input } from "@/components/ui/input";
import { getSongs, KWSong } from "@/lib/kwHttp";
import { AudioTrack, useAudioStore } from "@/stores/audioStore";
import React, { useState } from "react";

const Search = () => {
  const { setCurrentTrack } = useAudioStore();
  const [keyword, setKeyword] = useState(""); // 搜索关键字
  const [tracks, setTracks] = useState<AudioTrack[]>([]);

  const onSearch: React.KeyboardEventHandler = async e => {
    if (e.key !== "Enter") return;
    try {
      const resp = await getSongs({ name: keyword });
      if (resp.code === 200)
        setTracks(
          resp.data.map(item => ({
            source: "kw",
            cover: item.pic,
            ...item,
          }))
        );
    } catch (error) {
      console.log(error, "===");
    } finally {
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(tracks[index]);
  };

  return (
    <div>
      <Input
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="Search for something..."
        onKeyDown={onSearch}
      />
      <PlayListTable tracks={tracks} onSelect={selectTrack} className="mt-5" />
    </div>
  );
};

export default Search;
