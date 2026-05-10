export type Program = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  createdAt: string;
  _count?: { episodes: number };
  episodes?: Episode[];
};

export type Episode = {
  id: string;
  programId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  views: number;
  publishedAt: string;
  program?: { id: string; title: string; category: string };
  artists?: Artist[];
};

export type EpisodeWatchContext = {
  atual: Episode;
  anterior: Episode | null;
  proximo: Episode | null;
  aSeguir: Episode[];
};

export type LiveStream = {
  id: string;
  title: string;
  description: string | null;
  status: "LIVE" | "OFFLINE" | "SCHEDULED";
  embedUrl: string;
  scheduledAt: string | null;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  category: string;
  slug: string;
  createdAt: string;
};

export type Artist = {
  id: string;
  name: string;
  bio: string;
  image: string;
  socialLinks: Record<string, string>;
  episodes?: Episode[];
};

export type Partner = {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  packageType: string;
};

export type ScheduleItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  programId: string;
  program: Program;
};

export type AudienceStats = {
  liveViewers: number;
  trend: "up" | "down";
  updatedAt: string;
};
