import React, { useCallback, useState } from 'react';
import Loading from './components/Loading';
import CodeSnippet from './components/CodeSnippet';
import Config from './config/shopify';
import { fetchAPI } from './lib/utils';
import type { GetPreviewResponse, CreateProductResponse } from './lib/types';

import './App.css';

type View = 'fetch' | 'preview' | 'created' | 'error';
type Product = {
  url: string;
  legacyResourceId: string;
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState<View>('fetch');
  const [shopifyStore, setShopifyStore] = useState(Config.stores.RETAIL.value);
  const [sku, setSku] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [product, setProduct] = useState<null | Product>(null);

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
      setCurrentView('preview');
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

      const response = await fetchAPI<CreateProductResponse>('CREATE_PRODUCT', {
        shopifyStore,
        product: preview,
      });

      console.log('RESPONSE', response);

      if (!response.success) {
        throw new Error(response.error);
      }

      // TODO: Show success message or some sort of feedback
      setProduct(response.data.product);
      setIsLoading(false);
      setCurrentView('created');
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setError(err.message);
      setCurrentView('created');
    }
  }, [shopifyStore, preview]);

  const handleReset = () => {
    setCurrentView('fetch');
    setSku('');
    setPreview(null);
    setProduct(null);
    setError(null);
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {currentView === 'fetch' && (
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
                  {Object.values(Config.stores).map(store => (
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
                type="button"
                onClick={getPreview}
                disabled={sku === ''}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
              >
                Search
              </button>
            </div>
          )}

          {currentView === 'preview' && preview && (
            <div className="max-w-full">
              <h3 className="font-bold uppercase">Preview Product</h3>
              <div className="mb-5">
                <CodeSnippet snippet={preview} />
              </div>
              <button
                type="button"
                onClick={createProduct}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
              >
                Create Product
              </button>
            </div>
          )}

          {currentView === 'created' && (
            <div className="max-w-sm">
              {product && (
                <div className="mb-5">
                  <h3 className="font-bold uppercase">Product Created</h3>
                  <div
                    className="mb-4 flex items-center rounded-lg bg-green-50 p-4 text-sm text-green-800"
                    role="alert"
                  >
                    <svg
                      className="me-3 inline h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                      <span className="font-medium">Success!</span> Product
                      created successfully, view product{' '}
                      <a
                        href={product?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        here
                      </a>
                      .
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-5">
                  <h3 className="font-bold uppercase">
                    Error Creating Product
                  </h3>
                  <div
                    className="mb-4 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-800"
                    role="alert"
                  >
                    <svg
                      className="me-3 inline h-4 w-4 flex-shrink-0"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div>
                      <span className="font-medium">Error!</span> {error} <br />
                      Please try again.
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
