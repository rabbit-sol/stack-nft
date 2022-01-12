import { PublicKey } from '@solana/web3.js';

export const DEFAULTS = {
  CLUSTER: 'devnet',
  //todo these need to be PER cluster
  GEM_BANK_PROG_ID: new PublicKey(
    '8gkZXmGivdzjxrLadXkLD8EhR9dPGH7rri9jC2ZKNQtU'
  ),
  GEM_FARM_PROG_ID: new PublicKey(
    'Hzuc9yjE5XBigryWTpKBCeervTbKVJnMDtmsXVNdd3tc'
  ),
};
