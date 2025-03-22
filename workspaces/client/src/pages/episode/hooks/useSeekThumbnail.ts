import { StandardSchemaV1 } from '@standard-schema/spec';
import * as schema from '@wsh-2025/schema/src/api/schema';
import { use } from 'react';

interface Params {
  episode: StandardSchemaV1.InferOutput<typeof schema.getEpisodeByIdResponse>;
}

async function getSeekThumbnail({ episode }: Params) {

  const data = await fetch(`/api/episodes/${episode.id}/thumbnail`)
  const json = await data.json()
  return json.url
}

const weakMap = new WeakMap<object, Promise<string>>();

// export const useSeekThumbnail = ({ episode }: Params): string => {
//   const promise = weakMap.get(episode) ?? async() => episode.thumbnailUrl ?? getSeekThumbnail({ episode });
//   weakMap.set(episode, promise);
//   return use(promise);
// };
