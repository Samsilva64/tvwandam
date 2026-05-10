import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  LiveStreamStatus,
  PartnerPackageType,
  PostCategory,
  PrismaClient,
} from "@prisma/client";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL nao definida no ambiente.");
}

const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

const channelUrl = "https://www.youtube.com/channel/UCQQFSDHUUuavl2q9YAXAgBQ";
const embed = (id: string) => `https://www.youtube.com/embed/${id}`;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

async function main() {
  const passwordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@tvwandem.local" },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: "admin@tvwandem.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.scheduleItem.deleteMany({
    where: { id: { in: ["seed-slot-1", "seed-slot-2"] } },
  });
  await prisma.episode.deleteMany({
    where: { id: { in: ["seed-episode-1", "seed-episode-2"] } },
  });
  await prisma.liveStream.deleteMany({
    where: { id: "seed-live-main" },
  });
  await prisma.post.deleteMany({
    where: {
      slug: { in: ["abertura-da-temporada-2026", "entrevista-nk-silva"] },
    },
  });
  await prisma.partner.deleteMany({
    where: { id: "seed-partner-1" },
  });
  await prisma.artist.deleteMany({
    where: { id: "seed-artist-1" },
  });
  await prisma.program.deleteMany({
    where: { id: { in: ["seed-program-lisboa-noite", "seed-program-diaspora"] } },
  });

  const jomav = await prisma.program.upsert({
    where: { id: "tvwandam-program-plataforma-jomav" },
    update: {
      title: "Plataforma JOMAV",
      description: "Shows e concertos filmados para levar a energia dos palcos guineenses a quem acompanha dentro e fora do país.",
      coverImage: thumb("j1c-F2QTFKU"),
      category: "Musica",
    },
    create: {
      id: "tvwandam-program-plataforma-jomav",
      title: "Plataforma JOMAV",
      description: "Shows e concertos filmados para levar a energia dos palcos guineenses a quem acompanha dentro e fora do país.",
      coverImage: thumb("j1c-F2QTFKU"),
      category: "Musica",
    },
  });

  const comunidade = await prisma.program.upsert({
    where: { id: "tvwandam-program-comunidade" },
    update: {
      title: "Ao Serviço da Comunidade",
      description: "Campanhas de saúde, alertas públicos e informação útil para famílias, tabancas, bairros e diáspora.",
      coverImage: thumb("Pk3PLum8cYI"),
      category: "Serviço público",
    },
    create: {
      id: "tvwandam-program-comunidade",
      title: "Ao Serviço da Comunidade",
      description: "Campanhas de saúde, alertas públicos e informação útil para famílias, tabancas, bairros e diáspora.",
      coverImage: thumb("Pk3PLum8cYI"),
      category: "Serviço público",
    },
  });

  const marcas = await prisma.program.upsert({
    where: { id: "tvwandam-program-marcas" },
    update: {
      title: "Marcas na Rua",
      description: "Conteúdos comerciais com linguagem simples, filmados perto das pessoas e adaptados ao dia a dia da Guiné-Bissau.",
      coverImage: thumb("DBnG-42Rafg"),
      category: "Publicidade",
    },
    create: {
      id: "tvwandam-program-marcas",
      title: "Marcas na Rua",
      description: "Conteúdos comerciais com linguagem simples, filmados perto das pessoas e adaptados ao dia a dia da Guiné-Bissau.",
      coverImage: thumb("DBnG-42Rafg"),
      category: "Publicidade",
    },
  });

  const humor = await prisma.program.upsert({
    where: { id: "tvwandam-program-humor" },
    update: {
      title: "Humor di Nossi Terra",
      description: "Sketches e momentos curtos em crioulo, com humor popular e situações reconhecíveis da nossa realidade.",
      coverImage: thumb("RAqL_-xYIws"),
      category: "Humor",
    },
    create: {
      id: "tvwandam-program-humor",
      title: "Humor di Nossi Terra",
      description: "Sketches e momentos curtos em crioulo, com humor popular e situações reconhecíveis da nossa realidade.",
      coverImage: thumb("RAqL_-xYIws"),
      category: "Humor",
    },
  });

  const equipa = await prisma.artist.upsert({
    where: { id: "tvwandam-equipa" },
    update: {
      name: "Equipa TV Wandam",
      bio: "Criadores, operadores de câmera, editores e produtores dedicados a contar a Guiné-Bissau com ritmo, proximidade e orgulho.",
      image: "/brand/tvwandam-logo-transparent.png",
      socialLinks: {
        youtube: channelUrl,
        facebook: "https://www.facebook.com/Tvwandam",
        instagram: "https://www.instagram.com/tvwandam",
        tiktok: "https://www.tiktok.com/@tvwandam",
      },
    },
    create: {
      id: "tvwandam-equipa",
      name: "Equipa TV Wandam",
      bio: "Criadores, operadores de câmera, editores e produtores dedicados a contar a Guiné-Bissau com ritmo, proximidade e orgulho.",
      image: "/brand/tvwandam-logo-transparent.png",
      socialLinks: {
        youtube: channelUrl,
        facebook: "https://www.facebook.com/Tvwandam",
        instagram: "https://www.instagram.com/tvwandam",
        tiktok: "https://www.tiktok.com/@tvwandam",
      },
    },
  });

  const episodes = [
    {
      id: "tvwandam-video-concerto-bliri",
      programId: jomav.id,
      title: "CONCERTO DO BLIRI - PLATAFORMA JOMAV",
      description: "Concerto captado pela TV Wandam na Plataforma JOMAV.",
      videoId: "MllSQBAPkcs",
      duration: "Video",
      views: 18700,
      publishedAt: "2026-04-25T21:34:54.000Z",
    },
    {
      id: "tvwandam-video-show-mcpablo",
      programId: jomav.id,
      title: "SHOW DO @McPablo_Oficial1 - PLATAFORMA JOMAV",
      description: "Show popular com energia de palco e publico guineense.",
      videoId: "j1c-F2QTFKU",
      duration: "Video",
      views: 73081,
      publishedAt: "2025-11-03T17:34:43.000Z",
    },
    {
      id: "tvwandam-video-flav-nais-king",
      programId: jomav.id,
      title: "CONCERTO DO @flavnaiskingofficial - PLATAFORMA JOMAV",
      description: "Musica ao vivo com realizacao e edicao da equipa TV Wandam.",
      videoId: "WDRGIdVq8h4",
      duration: "Video",
      views: 4111,
      publishedAt: "2025-11-19T19:56:11.000Z",
    },
    {
      id: "tvwandam-video-can-maxit",
      programId: marcas.id,
      title: "A CAN 2025 está ainda mais perto de ti!",
      description: "Conteúdo sobre a Max it TV e acesso móvel aos jogos da CAN.",
      videoId: "DBnG-42Rafg",
      duration: "Video",
      views: 188,
      publishedAt: "2026-01-07T19:17:41.000Z",
    },
    {
      id: "tvwandam-video-linha-saude",
      programId: comunidade.id,
      title: "Linha de Saúde 24 Horas",
      description: "Informação de apoio permanente para orientar a população sobre saúde.",
      videoId: "O1P9bfw3rL4",
      duration: "Video",
      views: 141,
      publishedAt: "2025-12-13T17:18:35.000Z",
    },
    {
      id: "tvwandam-video-paludismo",
      programId: comunidade.id,
      title: "Campanha - Quimioprevenção de Paludismo Sazonal 2025",
      description: "Mensagem de prevenção do paludismo para proteger crianças, mulheres grávidas e comunidades.",
      videoId: "Pk3PLum8cYI",
      duration: "Video",
      views: 121,
      publishedAt: "2025-10-31T13:43:30.000Z",
    },
    {
      id: "tvwandam-video-burla",
      programId: comunidade.id,
      title: "Atenção à burla",
      description: "Alerta público para proteger códigos, dinheiro e dados pessoais.",
      videoId: "VmIhd6PhNhw",
      duration: "Video",
      views: 205,
      publishedAt: "2025-11-05T12:12:14.000Z",
    },
    {
      id: "tvwandam-video-humor-frio",
      programId: humor.id,
      title: "Djintis ku ka gosta di laba kurpu na tempo di frio",
      description: "Humor curto em crioulo com situações do quotidiano.",
      videoId: "RAqL_-xYIws",
      duration: "Short",
      views: 1229,
      publishedAt: "2025-12-01T17:02:35.000Z",
    },
  ];

  for (const episode of episodes) {
    await prisma.episode.upsert({
      where: { id: episode.id },
      update: {
        programId: episode.programId,
        title: episode.title,
        description: episode.description,
        videoUrl: embed(episode.videoId),
        thumbnail: thumb(episode.videoId),
        duration: episode.duration,
        views: episode.views,
        publishedAt: new Date(episode.publishedAt),
        artists: { set: [{ id: equipa.id }] },
      },
      create: {
        id: episode.id,
        programId: episode.programId,
        title: episode.title,
        description: episode.description,
        videoUrl: embed(episode.videoId),
        thumbnail: thumb(episode.videoId),
        duration: episode.duration,
        views: episode.views,
        publishedAt: new Date(episode.publishedAt),
        artists: { connect: [{ id: equipa.id }] },
      },
    });
  }

  await prisma.liveStream.upsert({
    where: { id: "tvwandam-live-main" },
    update: {
      title: "TV Wandam - Canal oficial",
      description: "Vídeos e diretos da TV Wandam, ao serviço da comunidade guineense.",
      status: LiveStreamStatus.LIVE,
      embedUrl: embed("MllSQBAPkcs"),
      scheduledAt: null,
    },
    create: {
      id: "tvwandam-live-main",
      title: "TV Wandam - Canal oficial",
      description: "Vídeos e diretos da TV Wandam, ao serviço da comunidade guineense.",
      status: LiveStreamStatus.LIVE,
      embedUrl: embed("MllSQBAPkcs"),
      scheduledAt: null,
    },
  });

  const posts = [
    {
      title: "Concerto do Bliri na Plataforma JOMAV",
      slug: "concerto-do-bliri-plataforma-jomav",
      content:
        "<p>A TV Wandam registou o concerto do Bliri na Plataforma JOMAV, levando a energia do palco para quem acompanha a cultura guineense no país e na diáspora.</p>",
      image: thumb("MllSQBAPkcs"),
      category: PostCategory.MUSICA,
    },
    {
      title: "CAN 2025 mais perto no telemóvel",
      slug: "can-2025-mais-perto-no-telemovel",
      content:
        "<p>A comunicação da Max it TV apresenta uma forma simples de acompanhar a CAN no telemóvel, com passes acessíveis e internet incluída.</p>",
      image: thumb("DBnG-42Rafg"),
      category: PostCategory.EVENTOS,
    },
    {
      title: "Linha de Saúde 24 Horas",
      slug: "linha-de-saude-24-horas",
      content:
        "<p>A Linha de Saúde 24 Horas orienta a população com informação, aconselhamento e encaminhamento em situações de urgência.</p>",
      image: thumb("O1P9bfw3rL4"),
      category: PostCategory.CULTURA,
    },
    {
      title: "Juntos contra o paludismo sazonal",
      slug: "juntos-contra-o-paludismo-sazonal",
      content:
        "<p>A campanha de quimioprevenção reforça a importância de receber as equipas de saúde, cumprir os dias de medicamento e manter as casas sem água parada.</p>",
      image: thumb("Pk3PLum8cYI"),
      category: PostCategory.CULTURA,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  const partners = [
    {
      id: "tvwandam-partner-orange-bissau",
      name: "Orange Bissau",
      logo: thumb("If5g8l8pD4g"),
      website: "https://www.orange-bissau.com",
      packageType: PartnerPackageType.PLATINUM,
    },
    {
      id: "tvwandam-partner-maxit",
      name: "Max it TV",
      logo: thumb("DBnG-42Rafg"),
      website: null,
      packageType: PartnerPackageType.GOLD,
    },
    {
      id: "tvwandam-partner-plataforma-jomav",
      name: "Plataforma JOMAV",
      logo: thumb("MllSQBAPkcs"),
      website: null,
      packageType: PartnerPackageType.LOCAL,
    },
    {
      id: "tvwandam-partner-saude-publica",
      name: "Saúde pública",
      logo: thumb("Pk3PLum8cYI"),
      website: null,
      packageType: PartnerPackageType.LOCAL,
    },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: partner,
      create: partner,
    });
  }

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  const schedule = [
    { id: "tvwandam-slot-1", startTime: "18:00", endTime: "19:00", programId: comunidade.id },
    { id: "tvwandam-slot-2", startTime: "20:00", endTime: "21:30", programId: jomav.id },
    { id: "tvwandam-slot-3", startTime: "21:30", endTime: "22:00", programId: humor.id },
  ];

  for (const slot of schedule) {
    await prisma.scheduleItem.upsert({
      where: { id: slot.id },
      update: { date: today, startTime: slot.startTime, endTime: slot.endTime, programId: slot.programId },
      create: { id: slot.id, date: today, startTime: slot.startTime, endTime: slot.endTime, programId: slot.programId },
    });
  }

  console.log("Seed OK - TV Wandam atualizado. Admin: admin@tvwandem.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
