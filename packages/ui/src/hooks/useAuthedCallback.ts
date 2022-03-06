import { useRari } from '@context/RariContext';

export const useAuthedCallback = (callback: () => any) => {
  const { login, isAuthed } = useRari();

  return () => {
    if (isAuthed) {
      return callback();
    } else {
      return login();
    }
  };
};
