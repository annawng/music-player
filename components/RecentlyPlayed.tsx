import { useEffect, useState } from 'react';

import useToken from '@/hooks/useToken';
import fetchWebApi from '@/utils/fetchWebApi';
import Preview, { CollectionType } from './Preview';
import getArtists from '@/utils/getArtists';
import Row from './Row';
import H2 from './H2';

interface CollectionWithType extends CollectionType {
  type: string;
}

const RecentlyPlayed = () => {
  const token = useToken();
  const [collections, setCollections] = useState<CollectionWithType[]>([]);
  const [uris, setUris] = useState<string[]>();

  useEffect(() => {
    async function getRecentlyPlayed() {
      const res = await fetchWebApi(
        token,
        'me/player/recently-played?limit=50',
        'GET'
      );
      const json = await res.json();
      const withContext = json.items.filter(
        // Filter out artist context for the sake of simplicity
        (item: any) =>
          item.context !== null &&
          (item.context.uri.includes('album') ||
            item.context.uri.includes('playlist'))
      );
      const contexts = withContext.map((item: any) => item.context.uri);
      const uniqueContexts = Array.from(new Set(contexts)).slice(0, 5);
      setUris(uniqueContexts as string[]);
    }

    getRecentlyPlayed();
  }, [token]);

  useEffect(() => {
    function getCollections() {
      setCollections([]);
      uris?.forEach(async (uri: string) => {
        const [_, type, id] = uri.split(':');
        const res = await fetchWebApi(token, `${type}s/${id}`, 'GET');
        const json = await res.json();
        if (type === 'album') {
          const { id, name, artists, images, type } = json;
          const album = {
            id: id,
            name: name,
            by: getArtists(artists),
            image: images[0].url,
            type: type,
          };
          setCollections((collections) => [...collections, album]);
        } else {
          const { id, name, owner, images, type } = json;
          const playlist = {
            id: id,
            name: name,
            by: owner.display_name,
            image: images[0].url,
            type: type,
          };
          setCollections((collections) => [...collections, playlist]);
        }
      });
    }

    if (uris) {
      getCollections();
    }
  }, [token, uris]);

  return (
    <>
      {collections.length > 0 && (
        <section>
          <H2>Jump back in </H2>
          <Row>
            {collections.map(({ type, ...rest }: CollectionWithType, index) => {
              return (
                <li key={index} className='w-[120px] md:w-[160px] lg:w-[200px]'>
                  <Preview collection={rest} type={type} />
                </li>
              );
            })}
          </Row>
        </section>
      )}
    </>
  );
};

export default RecentlyPlayed;
