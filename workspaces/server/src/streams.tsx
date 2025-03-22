import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import dedent from 'dedent';
import type { FastifyInstance } from 'fastify';
import { DateTime } from 'luxon';

import { getDatabase } from '@wsh-2025/server/src/drizzle/database';

// thumbnail
import { Parser } from 'm3u8-parser';
import {FFmpeg} from '@ffmpeg/ffmpeg';
import { spawn } from 'node:child_process';
import fs from 'fs/promises'
import os from 'os'

const SEQUENCE_DURATION_MS = 2 * 1000;
const SEQUENCE_COUNT_PER_PLAYLIST = 10;

// 競技のため、時刻のみを返す
function getTime(d: Date): number {
  return d.getTime() - DateTime.fromJSDate(d).startOf('day').toMillis();
}

export function registerStreams(app: FastifyInstance): void {
  app.register(fastifyStatic, {
    prefix: '/streams/',
    root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../streams'),
  });

  app.get<{
    Params: { episodeId: string };
  }>('/streams/episode/:episodeId/playlist.m3u8', async (req, reply) => {
    const database = getDatabase();

    const episode = await database.query.episode.findFirst({
      where(episode, { eq }) {
        return eq(episode.id, req.params.episodeId);
      },
      with: {
        stream: true,
      },
    });

    if (episode == null) {
      throw new Error('The episode is not found.');
    }

    const stream = episode.stream;

    const playlist = dedent`
      #EXTM3U
      #EXT-X-TARGETDURATION:3
      #EXT-X-VERSION:3
      #EXT-X-MEDIA-SEQUENCE:1
      ${Array.from({ length: stream.numberOfChunks }, (_, idx) => {
        return dedent`
          #EXTINF:2.000000,
          /streams/${stream.id}/${String(idx).padStart(3, '0')}.ts
        `;
      }).join('\n')}
      #EXT-X-ENDLIST
    `;

    reply.type('application/vnd.apple.mpegurl').send(playlist);
  });

  app.get<{
    Params: { channelId: string };
  }>('/streams/channel/:channelId/playlist.m3u8', async (req, reply) => {
    const database = getDatabase();

    const firstSequence = Math.floor(Date.now() / SEQUENCE_DURATION_MS) - SEQUENCE_COUNT_PER_PLAYLIST;
    const playlistStartAt = new Date(firstSequence * SEQUENCE_DURATION_MS);

    const playlist = [
      dedent`
        #EXTM3U
        #EXT-X-TARGETDURATION:3
        #EXT-X-VERSION:3
        #EXT-X-MEDIA-SEQUENCE:${firstSequence}
        #EXT-X-PROGRAM-DATE-TIME:${playlistStartAt.toISOString()}
      `,
    ];

    for (let idx = 0; idx < SEQUENCE_COUNT_PER_PLAYLIST; idx++) {
      const sequence = firstSequence + idx;
      const sequenceStartAt = new Date(sequence * SEQUENCE_DURATION_MS);

      const program = await database.query.program.findFirst({
        orderBy(program, { asc }) {
          return asc(program.startAt);
        },
        where(program, { and, eq, lt, lte, sql }) {
          // 競技のため、時刻のみで比較する
          return and(
            lte(program.startAt, sql`time(${sequenceStartAt.toISOString()}, '+9 hours')`),
            lt(sql`time(${sequenceStartAt.toISOString()}, '+9 hours')`, program.endAt),
            eq(program.channelId, req.params.channelId),
          );
        },
        with: {
          episode: {
            with: {
              stream: true,
            },
          },
        },
      });

      if (program == null) {
        break;
      }

      const stream = program.episode.stream;
      const sequenceInStream = Math.floor(
        (getTime(sequenceStartAt) - getTime(new Date(program.startAt))) / SEQUENCE_DURATION_MS,
      );
      const chunkIdx = sequenceInStream % stream.numberOfChunks;

      playlist.push(
        dedent`
          ${chunkIdx === 0 ? '#EXT-X-DISCONTINUITY' : ''}
          #EXTINF:2.000000,
          /streams/${stream.id}/${String(chunkIdx).padStart(3, '0')}.ts
          #EXT-X-DATERANGE:${[
            `ID="arema-${sequence}"`,
            `START-DATE="${sequenceStartAt.toISOString()}"`,
            `DURATION=2.0`,
            `X-AREMA-INTERNAL="${randomBytes(3 * 1024 * 1024).toString('base64')}"`,
          ].join(',')}
        `,
      );
    }

    reply.type('application/vnd.apple.mpegurl').send(playlist.join('\n'));
  });
}

export const  createPreview = async ({id, numberOfChunks}: {id: string, numberOfChunks: number}) => {
  // 1. concat 用のファイルリストを作成
  //    FFmpeg の concat demuxer を使うには、ファイルの一覧を text で書く必要がある
  //    "file '/absolute/path/to/000.ts'\nfile '/absolute/path/to/001.ts'..." という形式

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-'));
  const listFilePath = path.join(tmpDir, 'list.txt');
  const segments = [];

  for (let i = 0; i < numberOfChunks; i++) {
    // streams/${id}/${String(i).padStart(3, '0')}.ts
    segments.push(
      `file '${path.resolve(__dirname, '../streams', id, String(i).padStart(3, '0') + '.ts')}'`
    );
  }

  console.log('createPreview:segment', segments)
  await fs.writeFile(listFilePath, segments.join('\n'), 'utf-8');

  // 2. 出力先を決める
  const outputPath = path.join(tmpDir, 'preview.jpg');
  console.log('createPreview:outputPath', outputPath)
  // 3. FFmpeg 実行
  //    concat demuxerで一本化 → fps=1, tile=5x2で10枚のフレームを1枚のJPEGに
  const ffmpegArgs = [
    '-y',
    '-f', 'concat',        // concat demuxer
    '-safe', '0',          // パスにスペースがあってもOK
    '-i', listFilePath,
    '-vf', "fps=1,scale=160:90,tile=5x2",
    '-frames:v', '1',
    outputPath,
  ];

  await new Promise<void>((resolve, reject) => {
    console.log('createPreview:Promise:start')
    const ff = spawn('ffmpeg', ffmpegArgs);
    console.log('createPreview:Promise:ff')
    ff.on('error', reject);
    ff.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code: ${code}`));
    });
  });

  // 4. 生成された preview.jpg を最終的にどこかに保存 or そのまま読み込む
  //    ここではBase64化して返す例としてみます（実際はファイルのままでもOK）
  const buffer = await fs.readFile(outputPath);
  const pathStr = path.join(__dirname, '../../..')
  const linkStr = path.join(pathStr, `public/preview/${id}.jpeg`)
  console.log('pathJoin', pathStr)
  await fs.appendFile(linkStr, buffer)
  const base64 = buffer.toString('base64');
  console.log('base64', base64)
  return `${id}.jpeg`;
}