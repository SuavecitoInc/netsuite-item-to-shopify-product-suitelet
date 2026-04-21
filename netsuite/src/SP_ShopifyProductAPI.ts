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

export const post: EntryPoints.RESTlet.post = async requestBody => {
  const shopifyStore = {
    RETAIL: {
      text: 'RETAIL',
      value: 'retail',
    },
    WHOLESALE: {
      text: 'WHOLESALE',
      value: 'wholesale',
    },
    MEXICO: {
      text: 'MEXICO',
      value: 'mexico',
    },
    CANADA: {
      text: 'CANADA',
      value: 'canada',
    },
    BARBER_CART: {
      text: 'BARBER CART',
      value: 'barbercart',
    },
    TRES_NOIR: {
      text: 'TRES NOIR',
      value: 'tresnoir',
    },
    GUNTHERS: {
      text: 'GUNTHERS',
      value: 'gunthers',
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
    TN_PRODUCT_TYPE: 'custitem_fa_shpfy_tn_prodtype',
    TN_EVENTS_PRICE: 'custitem_sp_shpfy_tn_events_price',
    TN_DESCRIPTION: 'custitem_fa_shpfy_tn_description',
    TN_TAGS: 'custitem_fa_shpfy_tn_tags',
    GUNTHERS_BRAND: 'custitem_fa_shpfy_gunthers_brand',
    GUNTHERS_PRODUCT_TYPE: 'custitem_fa_shpfy_gunthers_prodtype',
    GUNTHERS_DESCRIPTION: 'custitem_fa_shpfy_gunthers_description',
    GUNTHERS_TAGS: 'custitem_fa_shpfy_gunthers_tags',
    PRODUCT_TYPE: 'custitem_fa_shpfy_prodtype',
    SIZE: 'custitem_sp_size',
    COLOR: 'custitem_sp_color',
  };

  type ItemReturn = ItemResult | null;

  const getItemData = (sku: string): ItemReturn => {
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
        FIELDS.GUNTHERS_BRAND,
        FIELDS.GUNTHERS_PRODUCT_TYPE,
        FIELDS.GUNTHERS_DESCRIPTION,
        FIELDS.GUNTHERS_TAGS,
        FIELDS.TN_PRODUCT_TYPE,
        FIELDS.TN_EVENTS_PRICE,
        FIELDS.TN_DESCRIPTION,
        FIELDS.TN_TAGS,
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
      custitem_fa_shpfy_gunthers_brand: results[0].getValue(
        FIELDS.GUNTHERS_BRAND
      ),
      custitem_fa_shpfy_gunthers_prodtype: results[0].getValue(
        FIELDS.GUNTHERS_PRODUCT_TYPE
      ),
      custitem_fa_shpfy_gunthers_description: results[0].getValue(
        FIELDS.GUNTHERS_DESCRIPTION
      ),
      custitem_fa_shpfy_gunthers_tags: results[0].getValue(
        FIELDS.GUNTHERS_TAGS
      ),
      custitem_fa_shpfy_tn_prodtype: results[0].getValue(
        FIELDS.TN_PRODUCT_TYPE
      ),
      custitem_sp_shpfy_tn_events_price: results[0].getValue(
        FIELDS.TN_EVENTS_PRICE
      ),
      custitem_fa_shpfy_tn_description: results[0].getValue(
        FIELDS.TN_DESCRIPTION
      ),
      custitem_fa_shpfy_tn_tags: results[0].getValue(FIELDS.TN_TAGS),

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
        FIELDS.GUNTHERS_BRAND,
        FIELDS.GUNTHERS_PRODUCT_TYPE,
        FIELDS.GUNTHERS_DESCRIPTION,
        FIELDS.GUNTHERS_TAGS,
        FIELDS.TN_PRODUCT_TYPE,
        FIELDS.TN_EVENTS_PRICE,
        FIELDS.TN_DESCRIPTION,
        FIELDS.TN_TAGS,
        FIELDS.CC_DESCRIPTION,
        FIELDS.CC_PRICE,
        FIELDS.CC_COMPARE_PRICE,
        FIELDS.PRODUCT_TYPE,
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

  const getMissingParentFields = (
    parentID: string,
    productTypeField: string,
    descriptionField: string
  ) => {
    // get variants
    const childItemSearch = search.create({
      type: 'item',
      columns: [productTypeField, descriptionField],
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

    // loop through child items and get missing fields
    let productType: string | null | undefined = null;
    let descriptionHtml: string | null | undefined = null;

    childResults.forEach(item => {
      if (!productType) {
        productType = item.getText(productTypeField) as string;
      }
      if (!descriptionHtml) {
        descriptionHtml = item.getValue(descriptionField) as string;
      }
    });

    return {
      productType,
      descriptionHtml,
    };
  };

  const buildShopifyProduct = (store: string, item: ItemResult) => {
    const fieldId = {
      brand: FIELDS.BRAND,
      productType: FIELDS.PRODUCT_TYPE,
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
    } else if (store === shopifyStore.BARBER_CART.value) {
      fieldId.priceLevel = FIELDS.RETAIL_PRICE; // custitem_fa_shpfy_cc_price
      fieldId.productDescription = FIELDS.CC_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.CC_TAGS;
      fieldId.compareAtPrice = FIELDS.RETAIL_COMPARE_PRICE; // custitem_fa_shpfy_compare_at_price_cc
    } else if (
      store === shopifyStore.CANADA.value ||
      store === shopifyStore.MEXICO.value
    ) {
      // mexico and canada values dont matter as we will manually update them, so use retail for now
      fieldId.priceLevel = FIELDS.RETAIL_PRICE;
      fieldId.productDescription = FIELDS.RETAIL_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.RETAIL_TAGS;
      fieldId.compareAtPrice = FIELDS.RETAIL_COMPARE_PRICE;
    } else if (store === shopifyStore.TRES_NOIR.value) {
      fieldId.productType = FIELDS.TN_PRODUCT_TYPE;
      fieldId.priceLevel = FIELDS.RETAIL_PRICE;
      fieldId.productDescription = FIELDS.TN_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.TN_TAGS;
      fieldId.compareAtPrice = ''; // no compare at price for tn
    } else if (store === shopifyStore.GUNTHERS.value) {
      fieldId.brand = FIELDS.GUNTHERS_BRAND;
      fieldId.productType = FIELDS.GUNTHERS_PRODUCT_TYPE;
      fieldId.priceLevel = FIELDS.RETAIL_PRICE;
      fieldId.productDescription = FIELDS.GUNTHERS_DESCRIPTION;
      fieldId.shopifyTags = FIELDS.GUNTHERS_TAGS;
      fieldId.compareAtPrice = ''; // no compare at price for gunthers
    } else {
      throw new Error('Invalid Store');
    }

    log.debug('is.matrix', item.matrix);
    const isMatrix = item.matrix as boolean;
    log.debug('isMatrix', isMatrix);
    log.debug('type', item.type);

    const parentId = item.internalid as string;
    log.debug('parentId', parentId);

    // load single record
    const itemRecord = record.load({
      type: getRecordType(item.type as string),
      id: parentId,
      isDynamic: false,
    });
    log.debug('itemRecord', itemRecord);
    // create shopify product object
    const tags = (itemRecord.getValue(fieldId.shopifyTags) as string)
      .split(' ')
      .join('')
      .split(',')
      .filter(tag => tag !== '');
    log.debug('tags', tags);

    const productTypeText =
      itemRecord.getText(fieldId.productType) === ''
        ? itemRecord.getText(FIELDS.PRODUCT_TYPE)
        : itemRecord.getText(fieldId.productType);

    const product: ShopifyProduct = {
      vendor: itemRecord.getText(fieldId.brand) as string,
      title: itemRecord.getValue(FIELDS.DISPLAY_NAME) as string,
      productType: productTypeText as string,
      tags,
      descriptionHtml: stripInlineStyles(
        String(itemRecord.getValue(fieldId.productDescription))
      ),
      variants: [],
    };

    log.debug('product', product);

    // check required for all required fields
    const itemErrors = checkRequiredFields(product, isMatrix);
    log.debug('itemErrors', itemErrors);
    // if errors display error and return false
    if (itemErrors.length > 0) {
      return {
        success: false,
        data: null,
        error: 'The following fields need to be set: ' + itemErrors.join(', '),
      };
    }
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
      // check if variants have productType and descriptionHtml set
      let hasMissingParentFields = false;
      if (!product.productType || product.productType === '') {
        hasMissingParentFields = true;
      }

      if (!product.descriptionHtml || product.descriptionHtml === '') {
        hasMissingParentFields = true;
      }

      if (hasMissingParentFields) {
        const missingParentFields = getMissingParentFields(
          parentId,
          FIELDS.PRODUCT_TYPE,
          fieldId.productDescription
        );

        log.debug('missingParentFields', missingParentFields);
        if (missingParentFields.productType) {
          product.productType = missingParentFields.productType as string;
        }

        if (missingParentFields.descriptionHtml) {
          product.descriptionHtml = stripInlineStyles(
            String(missingParentFields.descriptionHtml)
          );
        }
      }
      // check required fields again this time set is matrix to false
      const itemErrors = checkRequiredFields(product, false);
      log.debug('itemErrors', itemErrors);
      // if errors display error and return false
      if (itemErrors.length > 0) {
        return {
          success: false,
          data: null,
          error:
            'The following fields need to be set: ' + itemErrors.join(', '),
        };
      }
    } else {
      // single item
      const priceField = fieldId.priceLevel as keyof ItemResult;
      const defaultVariant: ShopifyProductVariant = {
        optionValues: [
          {
            optionName: 'Title',
            name: 'Default Title',
          },
        ],
        price: item[priceField] as string,
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
  };

  const getRecordType = (itemType: string): record.Type => {
    const typeMap: { [key: string]: record.Type } = {
      Assembly: record.Type.ASSEMBLY_ITEM,
      InvtPart: record.Type.INVENTORY_ITEM,
      Kit: record.Type.KIT_ITEM,
    };
    return typeMap[itemType] || record.Type.INVENTORY_ITEM;
  };

  const createPreviewObject = (store: string, sku: string) => {
    const result = getItemData(sku);
    log.debug('result', result);
    if (result) {
      const response = buildShopifyProduct(store, result);
      if (!response.success) {
        throw new Error(response?.error || 'Error building product preview');
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

  const normalizePostContext = (
    requestBody: string | { [key: string]: unknown }
  ): PostContext => {
    const parsedBody: unknown =
      typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;

    if (
      !parsedBody ||
      typeof parsedBody !== 'object' ||
      !('action' in parsedBody) ||
      !('payload' in parsedBody)
    ) {
      throw new Error('Invalid request body');
    }

    return parsedBody as PostContext;
  };

  try {
    const normalizedContext = normalizePostContext(requestBody);
    log.debug('API CONTEXT', JSON.stringify(normalizedContext, null, 2));
    doValidation(
      [normalizedContext.action, normalizedContext.payload],
      ['action', 'payload'],
      'POST'
    );

    const { action, payload } = normalizedContext;

    if (action === 'GET_PREVIEW') {
      const { shopifyStore, sku } = payload;
      const response = createPreviewObject(shopifyStore, sku);
      log.debug('GET_PREVIEW RESPONSE', JSON.stringify(response, null, 2));
      return {
        success: true,
        data: response,
      };
    }

    if (action === 'CREATE_PRODUCT') {
      const { shopifyStore, product } = payload;
      const response = await createProduct(shopifyStore, product);
      log.debug('CREATE_PRODUCT RESPONSE', JSON.stringify(response, null, 2));

      if (response?.error) {
        throw new Error(response?.error || 'Error creating product');
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
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Something went wrong';
    log.debug('ERROR', errorMessage);
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};
