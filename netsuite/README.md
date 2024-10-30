# NetSuite SuiteLet

> SuiteScript 2.1

The SuiteLet (SP_ShopifyProductSuiteLet) injects the React Bundle via an inline html field. The React bundle's file cabinet url will need to be set on the script deployment (`custscript_sp_shopify_product_bundle_url`).

The React front end uses a RESTLet as its API (SP_ShopifyProductAPI). The server endpoint will need to be added via the script paramater `custscript_sp_shopify_product_endpoint`.

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
