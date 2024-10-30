# NetSuite SuiteLet

> SuiteScript 2.1

## Setup

The SuiteLet (SP_ShopifyProductSuiteLet) injects the React Bundle via an inline html field. The React bundle's file cabinet url will need to be set on the script deployment (`custscript_sp_shopify_product_bundle_url`).

The React front end uses a RESTLet as its API (SP_ShopifyProductAPI). This RESTLet takes 2 params. The server endpoint `custscript_sp_shopify_product_endpoint` and secret key `custscript_sp_shopify_product_secret_id`.

<table>
  <thead>
    <tr>
      <th>Script</th>
      <th>Type</th>
      <th>Params</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>SP_ShopifyProductSuiteLet</td>
      <td>SuiteLet</td>
      <td>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>custscript_sp_shopify_product_bundle_url</td>
              <td>The React Bundle's URL</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td>SP_ShopifyProductAPI</td>
      <td>RESTLet</td>
      <td>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>custscript_sp_shopify_product_endpoint</td>
              <td>Server Endpoint</td>
            </tr>
            <tr>
              <td>custscript_sp_shopify_product_secret_id</td>
              <td>The API Secret's ID</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

## Usage

Actions:

- GET_PREVIEW

  - Payload
    ```javascript
    {
      "action": "GET_PREVIEW",
      "payload": {
        "shopifyStore": "retail",
        "sku": "P001NN"
      }
    }
    ```
  - Response
    ```javascript
    {
      "success": true,
      "data": {
        "vendor": "Suavecito",
        "title": "Original Hold Pomade",
        "productType": "Men's Grooming",
        "tags": [
          "Pomades",
          "Suavecito"
        ],
        "descriptionHtml": "<p>Some HTML description</p>",
        "variants": [
          {
            "optionValues": [
              {
                "optionName": "Default",
                "name": "Default"
              }
            ],
            "price": "14.99",
            "inventoryItem": {
              "sku": "P001NN",
              "measurement": {
                "weight": {
                  "value": 0.353,
                  "unit": "POUNDS",
                }
              }
            }
            "barcode": "859896004001"
          }
        ]
      }
    }
    ```

- CREATE_PRODUCT

  - Payload

    ```javascript
    {
      "action": "GET_PREVIEW",
      "payload": {
        "shopifyStore": "retail",
        "sku": "P001NN"
      }
    }
    ```

  - Response

    ```javascript
    {
      "success": true,
      "data": {
        "product": {
          "url": 'https://admin.shopify.com/store/some-store/products/123456789'
          "legacyResourceId": "123456789"
        },
        "error": null
      }
    }
    ```
