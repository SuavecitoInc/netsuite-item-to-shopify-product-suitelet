/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

import * as log from 'N/log';
import * as error from 'N/error';
import * as record from 'N/record';

import type {
  ShopifyProductVariant,
  ShopifyProduct,
} from './SP_ShopifyProductTypes';

export function doValidation(
  args: unknown[],
  argNames: string[],
  methodName: 'POST' | 'GET'
) {
  for (let i = 0; i < args.length; i++)
    if (!args[i] && args[i] !== 0)
      throw error.create({
        name: 'MISSING_REQ_ARG',
        message:
          'Missing a required argument: [' +
          argNames[i] +
          '] for method: ' +
          methodName,
      });
}

export function sortVariants(variants: ShopifyProductVariant[]) {
  // order variants if sizing is used ex: apparel
  const sizing = variants.find(
    ({ optionValues }) =>
      optionValues[0].name === 'S' || optionValues[0].name === 'YS'
  );
  const sizing1 = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
    '2xl': 6,
    '3xl': 7,
    '4xl': 8,
    '5xl': 9,
    yxs: 1,
    ys: 2,
    ym: 3,
    yl: 4,
    yxl: 5,
    y2xl: 6,
    y3xl: 7,
    y4xl: 8,
    y5xl: 9,
  };
  const sizing2 = {
    s: 1,
    m: 2,
    l: 3,
    xl: 4,
    '2xl': 5,
    '3xl': 6,
    '4xl': 7,
    '5xl': 8,
  };
  if (sizing) {
    let sizeOrder = {};
    // check for x-small
    const xs = variants.find(
      ({ optionValues }) =>
        optionValues[0].name === 'XS' || optionValues[0].name === 'YXS'
    );
    if (xs) {
      sizeOrder = sizing1;
    } else {
      sizeOrder = sizing2;
    }
    variants.sort((a, b) =>
      sizeOrder[a.optionValues[0].name.toLowerCase()] >
      sizeOrder[b.optionValues[0].name.toLowerCase()]
        ? 1
        : -1
    );
  }

  return variants;
}

export function convertWeightUnit(w: record.FieldValue) {
  log.debug('weight unit', w);
  if (w === 'lb') {
    return 'POUNDS';
  } else if (w === 'oz') {
    return 'OUNCES';
  } else if (w === 'kg') {
    return 'KILOGRAMS';
  } else if (w === 'g') {
    return 'GRAMS';
  } else {
    return null;
  }
}

export function stripInlineStyles(html: string) {
  const styles = /style=('|")([ -0-9a-zA-Z:]*[ 0-9a-zA-Z;]*)*\1/g;
  const ids = /id=('|")([ -0-9a-zA-Z:]*[ 0-9a-zA-Z;]*)*\1/g;
  const classes = /class=('|")([ -0-9a-zA-Z:]*[ 0-9a-zA-Z;]*)*\1/g;
  const dir = /dir=('|")([ -0-9a-zA-Z:]*[ 0-9a-zA-Z;]*)*\1/g;
  const role = /role=('|")([ -0-9a-zA-Z:]*[ 0-9a-zA-Z;]*)*\1/g;
  return html
    .replace(styles, '')
    .replace(ids, '')
    .replace(classes, '')
    .replace(dir, '')
    .replace(role, '');
}

export function checkRequiredFields(itemObj: ShopifyProduct) {
  const itemObjKeys = Object.keys(itemObj);
  const itemObjErrors = [];
  const exclude = ['tags', 'descriptionHtml'];
  itemObjKeys.forEach(key => {
    if (!exclude.includes(key)) {
      if (itemObj[key] === '' || (key === 'weight' && itemObj[key] === 0)) {
        itemObjErrors.push(key);
      }
    }
  });

  return itemObjErrors;
}
