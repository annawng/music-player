import { useSession } from 'next-auth/react';

const useToken = () => {
  const session: any = useSession();
  return session.data?.accessToken;
};

export default useToken;
