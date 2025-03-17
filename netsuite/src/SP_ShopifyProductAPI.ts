/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

import { EntryPoints } from 'N/types';
import * as log from 'N/log';
import * as crypto from 'N/crypto';
import * as encode from 'N/encode';
import * as record from 'N/record';
import * as search from 'N/search';
import * as https from 'N/https';
import * as runtime from 'N/runtime';

import {
  doValidation,
  sortVariants,
  convertWeightUnit,
  stripInlineStyles,
  checkRequiredFields,
} from './lib/SP_ShopifyProductUtils';
import type {
  CreatedProductResponse,
  ItemResult,
  ShopifyProduct,
  ShopifyProductVariant,
} from './lib/SP_ShopifyProductTypes';

type Action = 'GET_PREVIEW' | 'CREATE_PRODUCT';
type PostContext = {
  action: Action;
  payload: {
    shopifyStore: string;
    sku: string;
    product: ShopifyProduct;
  };
};

export const post: EntryPoints.RESTlet.post = async (context: PostContext) => {
  const shopifyStore = {
    RETAIL: {
      text: 'RETAIL',
      value: 'retail',
    },
    WHOLESALE: {
      text: 'WHOLESALE',
      value: 'wholesale',
    },
    PROFESSIONAL: {
      text: 'PROFESSIONAL',
      value: 'professional',
    },
    WAREHOUSE: {
      text: 'WAREHOUSE',
      value: 'warehouse',
    },
    BARBER_CART: {
      text: 'BARBER CART',
      value: 'barbercart',
    },
  };

  const FIELDS = {
    INTERNAL_ID: 'internalid',
    TYPE: 'type',
    DISPLAY_NAME: 'displayname',
    NAME: 'name',
    ITEM_ID: 'itemid',
    MATRIX: 'matrix',
    UPC_CODE: 'upccode',
    WEIGHT: 'weight',
    WEIGHT_UNIT: 'weightunit',
    BRAND: 'custitem_sp_brand',
    RETAIL_PRICE: 'baseprice',
    RETAIL_COMPARE_PRICE: 'custitem_fa_shpfy_compare_at_price',
    RETAIL_DESCRIPTION: 'custitem_fa_shpfy_prod_description',
    RETAIL_TAGS: 'custitem_fa_shpfy_tags',
    WHOLESALE_PRICE: 'price2',
    WHOLESALE_COMPARE_PRICE: 'custitem_fa_shpfy_compare_at_price_ws',
    WHOLESALE_DESCRIPTION: 'custitem_fa_shpfy_prod_description_ws',
    WHOLESALE_TAGS: 'custitem_fa_shpfy_tags_ws',
    CC_PRICE: 'custitem_fa_shpfy_price_cc',
    CC_COMPARE_PRICE: 'custitem_fa_shpfy_compare_at_price_cc',
    CC_DESCRIPTION: 'custitem_fa_shpfy_prod_description_cc',
    CC_TAGS: 'custitem_fa_shpfy_tags_cc',
    PRO_PRICE: 'custitem_fa_shpfy_professional_price',
    PRO_COMPARE_PRICE: 'custitem_fa_shpfy_compare_at_price_pro',
    PRO_DESCRIPTION: 'custitem_fa_shpfy_prod_description_pro',
    PRO_TAGS: 'custitem_fa_shpfy_tags_pro',
    WAREHOUSE_PRICE: 'custitem_fa_shpfy_warehouse_price',
    WAREHOUSE_COMPARE_PRICE: 'custitem_fa_shpfy_compare_at_price_wh',
    WAREHOUSE_DESCRIPTION: 'custitem_fa_shpfy_prod_description_wh',
    WAREHOUSE_TAGS: 'custitem_fa_shpfy_tags_wh',
    PRODUCT_TYPE: 'custitem_fa_shpfy_prodtype',
    SIZE: 'custitem_sp_size',
    COLOR: 'custitem_sp_color',
  };

  const recordType = {
    Assembly: record.Type.ASSEMBLY_ITEM,
    InvtPart: record.Type.INVENTORY_ITEM,
    Kit: record.Type.KIT_ITEM,
  };

  const getItemData = (sku: string): ItemResult => {
    // item search
    const itemSearch = search.create({
      type: 'item',
      columns: [
        FIELDS.INTERNAL_ID,
        FIELDS.TYPE,
        FIELDS.DISPLAY_NAME,
        FIELDS.NAME,
        FIELDS.ITEM_ID,
        FIELDS.MATRIX,
        FIELDS.UPC_CODE,
        FIELDS.WEIGHT,
        FIELDS.WEIGHT_UNIT,
        FIELDS.RETAIL_PRICE,
        FIELDS.WHOLESALE_PRICE,
        FIELDS.RETAIL_DESCRIPTION,
        FIELDS.BRAND,
        FIELDS.WAREHOUSE_PRICE,
        FIELDS.WAREHOUSE_DESCRIPTION,
        FIELDS.PRO_PRICE,
        FIELDS.PRO_DESCRIPTION,
        FIELDS.CC_DESCRIPTION,
        FIELDS.CC_PRICE,
        FIELDS.CC_COMPARE_PRICE,
        FIELDS.CC_TAGS,
      ],
    });

    itemSearch.filters = [
      search.createFilter({
        name: 'name',
        operator: search.Operator.IS,
        values: sku,
      }),
      search.createFilter({
        name: 'isinactive',
        operator: search.Operator.IS,
        values: false,
      }),
    ];

    const resultSet = itemSearch.run();
    const results = resultSet.getRange({
      start: 0,
      end: 1,
    });

    if (results.length === 0) {
      return null;
    }

    return {
      internalid: results[0].getValue(FIELDS.INTERNAL_ID),
      type: results[0].getValue(FIELDS.TYPE),
      displayname: results[0].getValue(FIELDS.DISPLAY_NAME),
      name: results[0].getValue(FIELDS.NAME),
      itemid: results[0].getValue(FIELDS.ITEM_ID),
      matrix: results[0].getValue(FIELDS.MATRIX),
      upccode: results[0].getValue(FIELDS.UPC_CODE),
      weight: results[0].getValue(FIELDS.WEIGHT),
      weightunit: results[0].getText(FIELDS.WEIGHT_UNIT),
      baseprice: results[0].getValue(FIELDS.RETAIL_PRICE),
      price2: results[0].getValue(FIELDS.WHOLESALE_PRICE),
      description: results[0].getValue(FIELDS.RETAIL_DESCRIPTION),
      custitem_sp_brand: results[0].getValue(FIELDS.BRAND),
      custitem_fa_shpfy_warehouse_price: results[0].getValue(
        FIELDS.WAREHOUSE_PRICE
      ),
      custitem_fa_shpfy_prod_description_wh: results[0].getValue(
        FIELDS.WAREHOUSE_DESCRIPTION
      ),
      custitem_fa_shpfy_professional_price: results[0].getValue(
        FIELDS.PRO_PRICE
      ),
      custitem_fa_shpfy_prod_description_pro: results[0].getValue(
        FIELDS.PRO_DESCRIPTION
      ),
      custitem_fa_shpfy_prod_description_cc: results[0].getValue(
        FIELDS.CC_DESCRIPTION
      ),
      custitem_fa_shpfy_price_cc: results[0].getValue(FIELDS.CC_PRICE),
      custitem_fa_shpfy_compare_at_price_cc: results[0].getValue(
        FIELDS.CC_COMPARE_PRICE
      ),
      custitem_fa_shpfy_tags_cc: results[0].getValue(FIELDS.CC_TAGS),
    };
  };

  const createVariants = (
    parentID: string,
    priceLevel: string,
    compareAtPrice: string
  ) => {
    // get variants
    const childItemSearch = search.create({
      type: 'item',
      columns: [
        FIELDS.INTERNAL_ID,
        FIELDS.DISPLAY_NAME,
        FIELDS.NAME,
        FIELDS.ITEM_ID,
        FIELDS.MATRIX,
        FIELDS.UPC_CODE,
        FIELDS.WEIGHT,
        FIELDS.WEIGHT_UNIT,
        FIELDS.RETAIL_PRICE,
        FIELDS.WHOLESALE_PRICE,
        FIELDS.RETAIL_DESCRIPTION,
        FIELDS.SIZE,
        FIELDS.COLOR,
        FIELDS.RETAIL_COMPARE_PRICE,
        FIELDS.WHOLESALE_COMPARE_PRICE,
        FIELDS.WAREHOUSE_PRICE,
        FIELDS.WAREHOUSE_COMPARE_PRICE,
        FIELDS.WAREHOUSE_DESCRIPTION,
        FIELDS.PRO_PRICE,
        FIELDS.PRO_DESCRIPTION,
        FIELDS.CC_DESCRIPTION,
        FIELDS.CC_PRICE,
        FIELDS.CC_COMPARE_PRICE,
      ],
    });

    childItemSearch.filters = [
      search.createFilter({
        name: 'parent',
        operator: search.Operator.IS,
        values: parentID,
      }),
      search.createFilter({
        name: 'isinactive',
        operator: search.Operator.IS,
        values: ['F'],
      }),
    ];

    const childResultSet = childItemSearch.run();
    const childResults = childResultSet.getRange({
      start: 0,
      end: 25,
    });

    // loop through child items and create variant object(s)
    const variants: ShopifyProductVariant[] = [];
    let optionName = '';

    childResults.forEach((item, index) => {
      let sku = item.getValue(FIELDS.ITEM_ID);
      sku = String(sku).split(' : ');
      const color = item.getText(FIELDS.COLOR);
      const size = item.getText(FIELDS.SIZE);

      let optionValue = '';
      if (size != '') {
        optionValue = size;
        optionName = 'Size';
      } else if (color != '') {
        optionValue = color;
        optionName = 'Color';
      } else {
        optionValue = 'Option ' + index;
        optionName = 'Options';
      }

      const variant: ShopifyProductVariant = {
        barcode: item.getValue(FIELDS.UPC_CODE) as string,
        optionValues: [
          {
            optionName,
            name: optionValue,
          },
        ],
        price: item.getValue(priceLevel) as string,
        inventoryItem: {
          sku: sku[1],
          measurement: {
            weight: {
              value: Number(item.getValue(FIELDS.WEIGHT)),
              unit: convertWeightUnit(item.getText(FIELDS.WEIGHT_UNIT)),
            },
          },
        },
      };

      if (item.getValue(compareAtPrice)) {
        variant.compareAtPrice = item.getValue(compareAtPrice).toString();
      }

      variants.push(variant);
    });

    return sortVariants(variants);
  };

  const buildShopifyProduct = (store: string, item: ItemResult) => {
    const fieldId = {
      priceLevel: '',
      productDescription: '',
      shopifyTags: '',
      compareAtPrice: '',
    };

    if (store == shopifyStore.RETAIL.value) {
      fieldId.priceLevel = FIELDS.RETAIL_PRICE;
      fieldId.productDescription = FIELDS.RETAIL_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.RETAIL_TAGS;
      fieldId.compareAtPrice = FIELDS.RETAIL_COMPARE_PRICE;
    } else if (store === shopifyStore.WHOLESALE.value) {
      fieldId.priceLevel = FIELDS.WHOLESALE_PRICE;
      fieldId.productDescription = FIELDS.WHOLESALE_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.WHOLESALE_TAGS;
      fieldId.compareAtPrice = FIELDS.WHOLESALE_COMPARE_PRICE;
    } else if (store === shopifyStore.WAREHOUSE.value) {
      fieldId.priceLevel = FIELDS.WAREHOUSE_PRICE;
      fieldId.productDescription = FIELDS.WAREHOUSE_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.WAREHOUSE_TAGS;
      fieldId.compareAtPrice = FIELDS.WAREHOUSE_COMPARE_PRICE;
    } else if (store === shopifyStore.PROFESSIONAL.value) {
      fieldId.priceLevel = FIELDS.PRO_PRICE;
      fieldId.productDescription = FIELDS.PRO_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.PRO_TAGS;
      fieldId.compareAtPrice = FIELDS.PRO_COMPARE_PRICE;
    } else if (store === shopifyStore.BARBER_CART.value) {
      fieldId.priceLevel = FIELDS.RETAIL_PRICE; // custitem_fa_shpfy_cc_price
      fieldId.productDescription = FIELDS.CC_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.CC_TAGS;
      fieldId.compareAtPrice = FIELDS.RETAIL_COMPARE_PRICE; // custitem_fa_shpfy_compare_at_price_cc
    } else {
      throw new Error('Invalid Store');
    }

    log.debug('is.matrix', item.matrix);
    const isMatrix = item.matrix;
    log.debug('isMatrix', isMatrix);
    log.debug('type', item.type);

    const parentId = item.internalid as string;
    log.debug('parentId', parentId);

    // load single record
    const itemRecord = record.load({
      type: recordType[item.type as string],
      id: parentId,
      isDynamic: false,
    });
    // create shopify product object
    const tags = (itemRecord.getValue(fieldId.shopifyTags) as string)
      .split(' ')
      .join('')
      .split(',')
      .filter(tag => tag !== '');
    const product: ShopifyProduct = {
      vendor: itemRecord.getText(FIELDS.BRAND) as string,
      title: itemRecord.getValue(FIELDS.DISPLAY_NAME) as string,
      productType: itemRecord.getText(FIELDS.PRODUCT_TYPE) as string,
      tags,
      descriptionHtml: stripInlineStyles(
        String(itemRecord.getValue(fieldId.productDescription))
      ),
      variants: [],
    };

    // check required for all required fields
    const itemErrors = checkRequiredFields(product);
    // if errors display error and return false
    if (itemErrors.length > 0) {
      return {
        success: false,
        data: null,
        error: 'The following fields need to be set: ' + itemErrors.join(', '),
      };
    } else {
      // check if item is matrix,
      // if matrix get subitems and create variants array on item obj
      if (isMatrix) {
        log.debug('isMatrix', isMatrix);
        const variants = createVariants(
          parentId,
          fieldId.priceLevel,
          fieldId.compareAtPrice
        );
        product.variants = variants;
      } else {
        // single item
        const defaultVariant: ShopifyProductVariant = {
          optionValues: [
            {
              optionName: 'Title',
              name: 'Default Title',
            },
          ],
          price: item[fieldId.priceLevel] as string,
          inventoryItem: {
            sku: item.itemid as string,
            measurement: {
              weight: {
                value: Number(item.weight),
                unit: convertWeightUnit(item.weightunit),
              },
            },
          },
          barcode: item.upccode as string,
        };

        if (itemRecord.getValue(fieldId.compareAtPrice)) {
          defaultVariant.compareAtPrice = itemRecord.getValue(
            fieldId.compareAtPrice
          ) as string;
        }

        log.debug('createDefaultVariant', defaultVariant);

        product.variants = [defaultVariant];
      }

      return {
        success: true,
        data: product,
        error: null,
      };
    }
  };

  const createPreviewObject = (store: string, sku: string) => {
    const result = getItemData(sku);
    log.debug('result', result);
    if (result) {
      const response = buildShopifyProduct(store, result);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }
  };

  const createProduct = async (
    shopifyStore: string,
    product: ShopifyProduct
  ) => {
    const endpoint = runtime.getCurrentScript().getParameter({
      name: 'custscript_sp_shopify_product_endpoint',
    }) as string;
    const apiKeyId = runtime.getCurrentScript().getParameter({
      name: 'custscript_sp_shopify_product_secret_id',
    }) as string;

    // create hmac
    const secretKey = crypto.createSecretKey({
      guid: apiKeyId,
      encoding: crypto.Encoding.UTF_8,
    });

    const body = {
      shopifyStore,
      product,
    };

    const hmac = crypto.createHmac({
      algorithm: crypto.HashAlg.SHA256,
      key: secretKey,
    });

    hmac.update({
      input: JSON.stringify(body),
      inputEncoding: encode.Encoding.UTF_8,
    });

    const digest = hmac.digest({
      outputEncoding: encode.Encoding.BASE_64,
    });

    const headerObj = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-ShopifyProduct-Hmac-Sha256': digest,
    };

    const response = await https.post.promise({
      url: endpoint,
      body: JSON.stringify(body),
      headers: headerObj,
    });

    log.debug({
      title: 'Response from Server',
      details: response.body,
    });

    const jsonResponse = JSON.parse(response.body) as CreatedProductResponse;

    return jsonResponse;
  };

  log.debug('API CONTEXT', JSON.stringify(context, null, 2));
  doValidation(
    [context.action, context.payload],
    ['action', 'payload'],
    'POST'
  );

  const { action, payload } = context;

  try {
    if (action === 'GET_PREVIEW') {
      const { shopifyStore, sku } = payload;
      const response = createPreviewObject(shopifyStore, sku);
      return {
        success: true,
        data: response,
      };
    }

    if (action === 'CREATE_PRODUCT') {
      const { shopifyStore, product } = payload;
      const response = await createProduct(shopifyStore, product);

      if (response?.error) {
        throw new Error(response.error);
      }

      return {
        success: true,
        data: response,
      };
    }

    return {
      success: false,
      data: null,
      error: 'Invalid action',
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: err.message || 'Something went wrong',
    };
  }
};
