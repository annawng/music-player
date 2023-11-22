'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import useToken from '@/hooks/useToken';
import fetchWebApi from '@/utils/fetchWebApi';
import Track, { TrackType } from '@/components/Track';
import getArtists from '@/utils/getArtists';

interface CollectionInfo {
  name: string;
  image: string;
  owner: string;
}

const Collection = ({
  id,
  isPlaylist,
}: {
  id: string;
  isPlaylist: boolean; // otherwise is an album
}) => {
  const token = useToken();
  const [tracks, setTracks] = useState<TrackType[]>();
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo>();

  useEffect(() => {
    async function getPlaylist() {
      const json = await fetchWebApi(
        token,
        `v1/${isPlaylist ? 'playlists' : 'albums'}/${id}`,
        'GET'
      );

      if (isPlaylist) {
        const { name, images, owner } = json;
        setCollectionInfo({
          name,
          image: images[0].url,
          owner: owner.display_name,
        });
      } else {
        const { name, images, artists } = json;
        setCollectionInfo({
          name,
          image: images[0].url,
          owner: getArtists(artists),
        });
      }

      const songs = json.tracks.items.map((item: any) => {
        if (isPlaylist) {
          const { album, artists, duration_ms, id, name } = item.track;
          return {
            album: album.name,
            image: album.images[1].url,
            artist: getArtists(artists),
            duration_ms,
            id,
            name,
          };
        } else {
          const { artists, duration_ms, id, name } = item;
          return {
            artist: getArtists(artists),
            duration_ms,
            id,
            name,
          };
        }
      });

      setTracks(songs);
    }

    getPlaylist();
  }, [token, id, isPlaylist]);

  return (
    <>
      {collectionInfo && (
        <div>
          <div className='flex items-end gap-8 mb-16'>
            <Image
              src={collectionInfo.image}
              alt=''
              width={240}
              height={240}
              className='aspect-square object-cover'
            />
            <div className='flex flex-col gap-2'>
              <p className='text-neutral-400 uppercase text-sm'>
                {isPlaylist ? 'Playlist' : 'Album'}
              </p>
              <h1 className='font-bold text-5xl leading-snug'>
                {collectionInfo.name}
              </h1>
              <p className='font-medium'>{collectionInfo.owner}</p>
            </div>
          </div>
          <div className='flex flex-col'>
            {tracks &&
              tracks.map((track: TrackType, index: number) => (
                <Track key={track.id} track={track} index={index + 1} />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Collection;
