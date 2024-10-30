import React, { useCallback, useState } from 'react';
import Loading from './components/Loading';
import CodeSnippet from './components/CodeSnippet';
import { STORES } from './lib/const';
import { fetchAPI } from './lib/utils';
import type { GetPreviewResponse } from './lib/types';

import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [shopifyStore, setShopifyStore] = useState(STORES.RETAIL.value);
  const [sku, setSku] = useState('');
  const [preview, setPreview] = useState<any>(null);

  const getPreview = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetchAPI<GetPreviewResponse>('GET_PREVIEW', {
        shopifyStore,
        sku,
      });

      console.log('RESPONSE', response);

      if (!response.success) {
        throw new Error(response.error);
      }

      const snippet = response.data;
      snippet.descriptionHtml =
        snippet.descriptionHtml.substring(0, 120) + '...';

      setPreview(snippet);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setIsLoading(false);
    }
  }, [shopifyStore, sku]);

  const createProduct = useCallback(async () => {
    try {
      setIsLoading(true);

      console.log('SENDING STORE', shopifyStore);
      console.log('SENDING PREVIEW', preview);

      const response = await fetchAPI<GetPreviewResponse>('CREATE_PRODUCT', {
        shopifyStore,
        product: preview,
      });

      console.log('RESPONSE', response);

      if (!response.success) {
        throw new Error(response.error);
      }

      // TODO: Show success message or some sort of feedback

      setIsLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setIsLoading(false);
    }
  }, [shopifyStore, preview]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {!preview && (
            <div className="max-w-sm">
              <h3 className="font-bold uppercase">Fetch Product</h3>
              <div className="mb-5">
                <label
                  htmlFor="stores"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Select an option
                </label>
                <select
                  id="stores"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  onChange={e => setShopifyStore(e.target.value)}
                >
                  {Object.values(STORES).map(store => (
                    <option key={store.value} value={store.value}>
                      {store.text}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-5">
                <label
                  htmlFor="sku"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="sku"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                onClick={getPreview}
                disabled={sku === ''}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
              >
                Search
              </button>
            </div>
          )}

          {preview && (
            <div className="max-w-full">
              <h3 className="font-bold uppercase">Preview Product</h3>
              <div className="mb-5">
                <CodeSnippet snippet={preview} />
              </div>
              <button
                type="submit"
                onClick={createProduct}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
              >
                Create Product
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
