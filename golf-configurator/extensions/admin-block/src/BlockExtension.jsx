import {
  reactExtension,
  AdminBlock,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Badge,
} from '@shopify/ui-extensions-react/admin';
import { useState, useEffect, useCallback } from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  // const {i18n, data} = useApi(TARGET);

  // State management
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [cartTransformId, setCartTransformId] = useState(null);
  const [functionId, setFunctionId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Check for existing cart transform and get function ID
  const checkCartTransformStatus = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      // First, get the Shopify Function ID
      const functionsResponse = await fetch('shopify:admin/api/2024-10/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              shopifyFunctions(first: 10) {
                nodes {
                  id
                  title
                  apiType
                }
              }
            }
          `,
        }),
      });

      const functionsData = await functionsResponse.json();
      console.log('Functions response:', functionsData);

      // Find the cart transform function
      const cartTransformFunction = functionsData.data?.shopifyFunctions?.nodes?.find(
        fn => fn.apiType === 'cart_transform'
      );

      if (cartTransformFunction) {
        setFunctionId(cartTransformFunction.id);
        console.log('Found cart transform function:', cartTransformFunction);
      } else {
        console.log('No cart transform function found');
      }

      // Check for existing cart transforms
      const transformsResponse = await fetch('shopify:admin/api/2024-10/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              cartTransforms(first: 10) {
                nodes {
                  id
                  functionId
                }
              }
            }
          `,
        }),
      });

      const transformsData = await transformsResponse.json();
      console.log('Cart transforms response:', transformsData);

      // Check if our function has an active transform
      if (cartTransformFunction && transformsData.data?.cartTransforms?.nodes) {
        const activeTransform = transformsData.data.cartTransforms.nodes.find(
          transform => transform.functionId === cartTransformFunction.id
        );

        if (activeTransform) {
          setCartTransformId(activeTransform.id);
          console.log('Found active cart transform:', activeTransform);
        }
      }
    } catch (err) {
      console.error('Error checking cart transform status:', err);
      setError('Failed to check cart transform status');
    } finally {
      setChecking(false);
    }
  }, []);

  // Enable cart transform
  const enableCartTransform = useCallback(async () => {
    if (!functionId) {
      setError('No cart transform function found. Please deploy the cart transformer extension first.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('shopify:admin/api/2024-10/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CartTransformCreate($functionId: String!) {
              cartTransformCreate(functionId: $functionId) {
                cartTransform {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            functionId: functionId,
          },
        }),
      });

      const data = await response.json();
      console.log('Enable response:', data);

      if (data.data?.cartTransformCreate?.userErrors?.length > 0) {
        const errors = data.data.cartTransformCreate.userErrors;
        setError(errors.map(e => e.message).join(', '));
      } else if (data.data?.cartTransformCreate?.cartTransform?.id) {
        setCartTransformId(data.data.cartTransformCreate.cartTransform.id);
        setMessage('Cart transform enabled successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else if (data.errors) {
        setError(data.errors[0]?.message || 'Failed to enable cart transform');
      }
    } catch (err) {
      console.error('Error enabling cart transform:', err);
      setError('Failed to enable cart transform');
    } finally {
      setLoading(false);
    }
  }, [functionId]);

  // Disable cart transform
  const disableCartTransform = useCallback(async () => {
    if (!cartTransformId) {
      setError('No active cart transform to disable');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('shopify:admin/api/2024-10/graphql.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CartTransformDelete($id: ID!) {
              cartTransformDelete(id: $id) {
                deletedId
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            id: cartTransformId,
          },
        }),
      });

      const data = await response.json();
      console.log('Disable response:', data);

      if (data.data?.cartTransformDelete?.userErrors?.length > 0) {
        const errors = data.data.cartTransformDelete.userErrors;
        setError(errors.map(e => e.message).join(', '));
      } else if (data.data?.cartTransformDelete?.deletedId) {
        setCartTransformId(null);
        setMessage('Cart transform disabled successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else if (data.errors) {
        setError(data.errors[0]?.message || 'Failed to disable cart transform');
      }
    } catch (err) {
      console.error('Error disabling cart transform:', err);
      setError('Failed to disable cart transform');
    } finally {
      setLoading(false);
    }
  }, [cartTransformId]);

  // Check status on mount
  useEffect(() => {
    checkCartTransformStatus();
  }, [checkCartTransformStatus]);

  return (
    <AdminBlock title="Golf Configurator Cart Transform">
      <BlockStack gap="loose">
        <Text>Manage the cart transform function for the golf configurator bundles.</Text>

        <InlineStack gap="loose" align="start">
          <Badge tone={cartTransformId ? 'success' : 'neutral'}>
            {checking ? 'Checking...' : cartTransformId ? 'Active' : 'Inactive'}
          </Badge>
          {functionId && !checking && (
            <Text size="small" tone="subdued">
              Function ID: {functionId.split('/').pop()}
            </Text>
          )}
        </InlineStack>

        {error && (
          <Badge tone="critical">
            {error}
          </Badge>
        )}

        {message && (
          <Badge tone="success">
            {message}
          </Badge>
        )}

        <InlineStack gap="loose">
          {!cartTransformId ? (
            <Button
              variant="primary"
              onClick={enableCartTransform}
              disabled={loading || checking || !functionId}
              loading={loading}
            >
              Enable Cart Transform
            </Button>
          ) : (
            <Button
              variant="primary"
              tone="critical"
              onClick={disableCartTransform}
              disabled={loading || checking}
              loading={loading}
            >
              Disable Cart Transform
            </Button>
          )}

          <Button
            onClick={checkCartTransformStatus}
            disabled={loading || checking}
            loading={checking}
          >
            Refresh Status
          </Button>
        </InlineStack>

        {!functionId && !checking && (
          <BlockStack gap="tight">
            <Text tone="critical" fontWeight="bold">
              No cart transform function found
            </Text>
            <Text size="small">
              Please ensure the cart transformer extension is deployed. Run:
            </Text>
            <Text size="small" fontWeight="monospace">
              cd golf-configurator && npm run deploy
            </Text>
          </BlockStack>
        )}
      </BlockStack>
    </AdminBlock>
  );
}