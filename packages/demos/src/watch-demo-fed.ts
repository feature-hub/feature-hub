const renderApp = require('./server-side-rendering-federation/integrator.node');
const {startServer} = require('./start-server-fed');

const demoName = 'server-side-rendering-federation';

startServer(renderApp.default, demoName)
  .then(async (server) => {
    const {port} = server.address();

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch((error) => {
    console.error(error);
  });
