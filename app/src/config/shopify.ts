import stores from './stores';

type ShopifyConfig = {
  stores: {
    [key: string]: {
      text: string;
      value: string;
    };
  };
};

const shopifyConfig: ShopifyConfig = {
  stores,
};

export type ShopifyStore = keyof ShopifyConfig['stores'];

export default shopifyConfig;
