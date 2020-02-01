const axios = require('axios');
console.log(axios)

(async () => {
  try {
    // check for project keys
    let { CROWDIN_KEY,  CROWDIN_PROJECT_NAME } = process.env;
    if (!CROWDIN_KEY || !CROWDIN_PROJECT_NAME) {
      console.error('Config keys missing.')
      process.exit(1);
    }

    // create crowdin axios instance
    const crowdin = axios.create({
      baseURL: `https://api.crowdin.com/api/project/${process.env.CROWDIN_PROJECT_NAME}`,
    });
    crowdin.interceptors.request.use(function (config) {
      config.url = `${config.url}/?key=${process.env.CROWDIN_KEY}&json=true`
      return config;
    });

    // download proccess
    // TODO: check git msg also
    if (!process.env.SKIP_DOWNLOAD) {
      const zip = await crowdin.get('info');
      console.log(zip.data)
    }

  } catch(e) {
    console.log(e)
  }
})()
