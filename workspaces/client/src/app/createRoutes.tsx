import { RouteObject } from 'react-router';
import { Document, prefetch } from '@wsh-2025/client/src/app/Document';
import { createStore } from '@wsh-2025/client/src/app/createStore';

export function createRoutes(store: ReturnType<typeof createStore>): RouteObject[] {
  return [
    {
      children: [
        {
          index: true,
          lazy: () =>
            import('@wsh-2025/client/src/pages/home/components/HomePage').then(
              ({ HomePage, prefetch }) => ({
                Component: HomePage,
                loader: () => prefetch(store),
              })
            ),
        },
        {
          path: '/episodes/:episodeId',
          lazy: () =>
            import('@wsh-2025/client/src/pages/episode/components/EpisodePage').then(
              ({ EpisodePage, prefetch }) => ({
                Component: EpisodePage,
                loader: ({ params }) => prefetch(store, params),
              })
            ),
        },
        {
          path: '/programs/:programId',
          lazy: () =>
            import('@wsh-2025/client/src/pages/program/components/ProgramPage').then(
              ({ ProgramPage, prefetch }) => ({
                Component: ProgramPage,
                loader: ({ params }) => prefetch(store, params),
              })
            ),
        },
        {
          path: '/series/:seriesId',
          lazy: () =>
            import('@wsh-2025/client/src/pages/series/components/SeriesPage').then(
              ({ SeriesPage, prefetch }) => ({
                Component: SeriesPage,
                loader: ({ params }) => prefetch(store, params),
              })
            ),
        },
        {
          path: '/timetable',
          lazy: () =>
            import('@wsh-2025/client/src/pages/timetable/components/TimetablePage').then(
              ({  TimetablePage, prefetch }) => ({
                Component: TimetablePage,
                loader: () => prefetch(store),
              })
            ),
        },
        {
          path: '*',
          lazy: () =>
            import('@wsh-2025/client/src/pages/not_found/components/NotFoundPage').then(
              ({ NotFoundPage, prefetch }) => ({
                Component: NotFoundPage,
                loader: () => prefetch(store),
              })
            ),
        },
      ],
      path: '/',
      Component: Document,
      loader: () => prefetch(store),
    },
  ];
}
