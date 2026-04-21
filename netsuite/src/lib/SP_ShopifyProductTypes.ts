/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import * as record from 'N/record';

export type ItemResult = {
  internalid: record.FieldValue;
  type: record.FieldValue;
  displayname: record.FieldValue;
  name: record.FieldValue;
  itemid: record.FieldValue;
  matrix: record.FieldValue;
  upccode: record.FieldValue;
  weight: record.FieldValue;
  weightunit: record.FieldValue;
  baseprice: record.FieldValue;
  price2: record.FieldValue;
  description: record.FieldValue;
  custitem_sp_brand: record.FieldValue;
  custitem_fa_shpfy_gunthers_prodtype: record.FieldValue;
  custitem_fa_shpfy_gunthers_description: record.FieldValue;
  custitem_fa_shpfy_gunthers_tags: record.FieldValue;
  custitem_sp_shpfy_tn_events_price: record.FieldValue;
  custitem_fa_shpfy_tn_description: record.FieldValue;
  custitem_fa_shpfy_tn_tags: record.FieldValue;
  custitem_fa_shpfy_prod_description_cc: record.FieldValue;
  custitem_fa_shpfy_price_cc: record.FieldValue;
  custitem_fa_shpfy_compare_at_price_cc: record.FieldValue;
  custitem_fa_shpfy_tags_cc: record.FieldValue;
  custitem_fa_shpfy_tn_prodtype: record.FieldValue;
};

export type ChildItemResult = {
  internalid: record.FieldValue;
  displayname: record.FieldValue;
  name: record.FieldValue;
  itemid: record.FieldValue;
  matrix: record.FieldValue;
  upccode: record.FieldValue;
  weight: record.FieldValue;
  weightunit: record.FieldValue;
  baseprice: record.FieldValue;
  price2: record.FieldValue;
  description: record.FieldValue;
  custitem_sp_size: record.FieldValue;
  custitem_sp_color: record.FieldValue;
  custitem_fa_shpfy_compare_at_price: record.FieldValue;
  custitem_fa_shpfy_compare_at_price_ws: record.FieldValue;
  custitem_fa_shpfy_warehouse_price: record.FieldValue;
  custitem_fa_shpfy_compare_at_price_wh: record.FieldValue;
  custitem_fa_shpfy_prod_description_wh: record.FieldValue;
  custitem_sp_shpfy_tn_events_price: record.FieldValue;
  custitem_fa_shpfy_tn_description: record.FieldValue;
  custitem_fa_shpfy_prod_description_cc: record.FieldValue;
  custitem_fa_shpfy_price_cc: record.FieldValue;
  custitem_fa_shpfy_compare_at_price_cc: record.FieldValue;
  custitem_fa_shpfy_tn_prodtype: record.FieldValue;
};

export type ShopifyProduct = {
  vendor: string;
  title: string;
  productType: string;
  tags: string[];
  descriptionHtml: string;
  variants: ShopifyProductVariant[];
};

export type ShopifyProductVariant = {
  optionValues: {
    optionName: string;
    name: string;
  }[];
  price: string;
  compareAtPrice?: string;
  inventoryItem: {
    sku: string;
    measurement: {
      weight: {
        value: number;
        unit: string | null;
      };
    };
  };
  barcode: string;
};

export type CreatedProductResponse = {
  product: {
    url: string;
    legacyResourceId: string;
  } | null;
  error?: string;
};
