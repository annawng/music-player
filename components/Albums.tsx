'use client';

import { useState, useEffect } from 'react';

import AlbumPreview from './AlbumPreview';
import { CollectionType } from './Preview';
import useToken from '@/hooks/useToken';
import fetchWebApi from '@/utils/fetchWebApi';
import getArtists from '@/utils/getArtists';

const Albums = () => {
  const token = useToken();
  const [albums, setAlbums] = useState<any[] | null>(null);

  useEffect(() => {
    async function getSavedAlbums() {
      const res = await fetchWebApi(token, 'me/albums?limit=50', 'GET');
      const json = await res.json();
      const albums = json.items.map((item: any) => {
        const { artists, id, images, name } = item.album;
        return {
          id,
          name,
          by: getArtists(artists),
          image: images[1].url,
        };
      });
      setAlbums(albums);
    }

    getSavedAlbums();
  }, [token]);

  return (
    <>
      {albums &&
        albums.map((album: CollectionType) => (
          <li key={album.id}>
            <AlbumPreview album={album} />
          </li>
        ))}
    </>
  );
};

export default Albums;
