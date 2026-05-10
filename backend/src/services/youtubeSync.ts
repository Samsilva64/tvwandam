import { prisma } from "../prisma";

type ListResponse<T> = {
  nextPageToken?: string;
  items: T[];
};

type ChannelItem = {
  contentDetails: { relatedPlaylists: { uploads: string } };
};

type PlaylistItem = {
  snippet: {
    description?: string;
    publishedAt: string;
    resourceId: { videoId: string };
    thumbnails?: Record<string, { url: string }>;
  };
};

type Playlist = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails?: Record<string, { url: string }>;
  };
};

type Video = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    publishedAt: string;
    thumbnails?: Record<string, { url: string }>;
  };
  contentDetails: { duration: string };
  statistics?: { viewCount?: string };
};

const podcastRegex = /podcast|podcasts|pecaste|pecastes/i;
const eventRegex = /evento|event|festival|carnaval|can 20|tour|cerimonia|cerimónia|celebra|ao vivo|live/i;

const apiKey = process.env.YOUTUBE_API_KEY;
const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "UCQQFSDHUUuavl2q9YAXAgBQ";

if (!apiKey) {
  throw new Error("Defina YOUTUBE_API_KEY no backend/.env para sincronizar conteúdos do YouTube.");
}

const youtube = async <T>(path: string, params: Record<string, string>) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data as T;
};

const allPages = async <T>(path: string, params: Record<string, string>) => {
  const items: T[] = [];
  let pageToken: string | undefined;
  do {
    const data = await youtube<ListResponse<T>>(path, {
      ...params,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return items;
};

const bestThumb = (thumbnails?: Record<string, { url: string }>, fallbackId?: string) =>
  thumbnails?.maxres?.url ??
  thumbnails?.standard?.url ??
  thumbnails?.high?.url ??
  thumbnails?.medium?.url ??
  thumbnails?.default?.url ??
  (fallbackId ? `https://i.ytimg.com/vi/${fallbackId}/hqdefault.jpg` : "/brand/tvwandam-logo-transparent.png");

const embed = (id: string) => `https://www.youtube.com/embed/${id}`;

const parseDurationSeconds = (duration: string) => {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const [, h = "0", m = "0", s = "0"] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

const formatDuration = (duration: string) => {
  const seconds = parseDurationSeconds(duration);
  if (!seconds) return "Video";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}min`;
  if (m) return `${m}min ${s}s`;
  return `${s}s`;
};

const safeDescription = (text?: string) => {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > 240 ? `${clean.slice(0, 237)}...` : clean || "Conteúdo oficial da TV Wandam.";
};

const chunk = <T>(arr: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
};

const programData = (title: string, category: string, coverImage: string, description?: string) => ({
  title,
  category,
  coverImage,
  description: safeDescription(description),
});

async function createProgramIfMissing(
  id: string,
  data: ReturnType<typeof programData>,
  refreshNonManual: boolean,
) {
  const existing = await prisma.program.findUnique({ where: { id } });
  if (existing) {
    if (refreshNonManual && !existing.isManuallyEdited) {
      return prisma.program.update({ where: { id }, data });
    }
    return existing;
  }
  return prisma.program.create({ data: { id, ...data, isManuallyEdited: false } });
}

async function createEpisodeIfMissing(programId: string, video: Video, idPrefix: string, refreshNonManual: boolean) {
  const id = `${idPrefix}-${video.id}`;
  const payload = {
    programId,
    title: video.snippet.title,
    description: safeDescription(video.snippet.description),
    videoUrl: embed(video.id),
    thumbnail: bestThumb(video.snippet.thumbnails, video.id),
    duration: formatDuration(video.contentDetails.duration),
    views: Number(video.statistics?.viewCount ?? 0),
    publishedAt: new Date(video.snippet.publishedAt),
  };
  const exists = await prisma.episode.findUnique({ where: { id } });
  if (exists) {
    if (refreshNonManual && !exists.isManuallyEdited) {
      await prisma.episode.update({ where: { id }, data: payload });
    }
    return;
  }
  await prisma.episode.create({ data: { id, ...payload, isManuallyEdited: false } });
}

async function getUploadsPlaylistId() {
  const data = await youtube<ListResponse<ChannelItem>>("channels", { part: "contentDetails", id: channelId });
  const uploads = data.items[0]?.contentDetails.relatedPlaylists.uploads;
  if (!uploads) throw new Error(`Canal YouTube nao encontrado: ${channelId}`);
  return uploads;
}

async function getPlaylistItems(playlistId: string) {
  return allPages<PlaylistItem>("playlistItems", { part: "snippet", playlistId });
}

async function getVideos(ids: string[]) {
  const videos: Video[] = [];
  for (const idsChunk of chunk(ids, 50)) {
    const data = await youtube<ListResponse<Video>>("videos", {
      part: "snippet,contentDetails,statistics",
      id: idsChunk.join(","),
    });
    videos.push(...data.items);
  }
  return videos;
}

export async function syncYoutubeChannel(options?: { refreshNonManual?: boolean }) {
  const refreshNonManual = options?.refreshNonManual ?? false;
  await prisma.program.deleteMany({
    where: { id: "youtube-musicas", isManuallyEdited: false },
  });
  const uploadsPlaylistId = await getUploadsPlaylistId();
  const uploadItems = await getPlaylistItems(uploadsPlaylistId);
  const uploadVideoIds = [...new Set(uploadItems.map((item) => item.snippet.resourceId.videoId).filter(Boolean))];
  const uploadVideos = await getVideos(uploadVideoIds);

  const uploadsProgram = await createProgramIfMissing(
    "youtube-videos-all",
    programData(
      "Playlist Todos os vídeos",
      "YouTube",
      bestThumb(uploadVideos[0]?.snippet.thumbnails, uploadVideos[0]?.id),
      "Todos os conteúdos publicados no canal oficial da TV Wandam.",
    ),
    refreshNonManual,
  );
  const shortsProgram = await createProgramIfMissing(
    "youtube-shorts",
    programData(
      "Playlist Shorts",
      "Playlists",
      bestThumb(
        uploadVideos.find((video) => parseDurationSeconds(video.contentDetails.duration) <= 61)?.snippet.thumbnails,
        uploadVideos[0]?.id,
      ),
      "Vídeos curtos publicados pela TV Wandam.",
    ),
    refreshNonManual,
  );
  const podcastProgram = await createProgramIfMissing(
    "youtube-podcasts",
    programData(
      "Playlist Podcasts",
      "Playlists",
      bestThumb(
        uploadVideos.find((video) => podcastRegex.test(`${video.snippet.title} ${video.snippet.description ?? ""}`))
          ?.snippet.thumbnails,
        uploadVideos[0]?.id,
      ),
      "Conversas, entrevistas e formatos longos da TV Wandam.",
    ),
    refreshNonManual,
  );
  const eventsProgram = await createProgramIfMissing(
    "youtube-eventos",
    programData(
      "Playlist Eventos",
      "Eventos",
      bestThumb(
        uploadVideos.find((video) => eventRegex.test(`${video.snippet.title} ${video.snippet.description ?? ""}`))
          ?.snippet.thumbnails,
        uploadVideos[0]?.id,
      ),
      "Cobertura de eventos, festivais e momentos especiais.",
    ),
    refreshNonManual,
  );

  for (const video of uploadVideos) {
    const videoText = `${video.snippet.title} ${video.snippet.description ?? ""}`;
    await createEpisodeIfMissing(uploadsProgram.id, video, "youtube-video", refreshNonManual);
    if (parseDurationSeconds(video.contentDetails.duration) <= 61) {
      await createEpisodeIfMissing(shortsProgram.id, video, "youtube-short", refreshNonManual);
    }
    if (podcastRegex.test(videoText)) {
      await createEpisodeIfMissing(podcastProgram.id, video, "youtube-podcast", refreshNonManual);
    }
    if (eventRegex.test(videoText)) {
      await createEpisodeIfMissing(eventsProgram.id, video, "youtube-event", refreshNonManual);
    }
  }

  const playlists = await allPages<Playlist>("playlists", { part: "snippet,contentDetails", channelId });
  for (const playlist of playlists) {
    const items = await getPlaylistItems(playlist.id);
    const ids = [...new Set(items.map((item) => item.snippet.resourceId.videoId).filter(Boolean))];
    if (!ids.length) continue;
    const videos = await getVideos(ids);
    const playlistText = `${playlist.snippet.title} ${playlist.snippet.description ?? ""}`;
    const program = await createProgramIfMissing(
      `youtube-playlist-${playlist.id}`,
      programData(
        playlist.snippet.title,
        "Playlists",
        bestThumb(playlist.snippet.thumbnails, videos[0]?.id),
        playlist.snippet.description || `Playlist oficial da TV Wandam com ${videos.length} conteúdos.`,
      ),
      refreshNonManual,
    );
    for (const video of videos) {
      await createEpisodeIfMissing(program.id, video, `youtube-playlist-${playlist.id}`, refreshNonManual);

      // Playlist oficial também alimenta coleções temáticas.
      if (eventRegex.test(playlistText)) {
        await createEpisodeIfMissing(eventsProgram.id, video, "youtube-event", refreshNonManual);
      }
    }
  }

  return {
    videos: uploadVideos.length,
    playlists: playlists.length,
    refreshNonManual,
  };
}
