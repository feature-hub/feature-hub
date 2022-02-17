export const countServiceDefinition = {
  id: 'acme:count-service',

  dependencies: {
    featureServices: {
      's2:serialized-state-manager': '^1.0.0',
    },
  },

  create(env) {
    let count = 0;

    const serializedStateManager =
      env.featureServices['s2:serialized-state-manager'];

    if (typeof window === 'undefined') {
      // on the server
      serializedStateManager.register(() => JSON.stringify({count}));
    } else {
      // on the client
      count = JSON.parse(serializedStateManager.getSerializedState()).count;
    }

    return {
      '1.0.0': () => ({
        featureService: {
          // We assume the setCount method is called by consumers while they are
          // rendered on the server.
          setCount(newCount) {
            count = newCount;
          },

          getCount() {
            return count;
          },
        },
      }),
    };
  },
};
