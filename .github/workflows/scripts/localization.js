const axios = require('axios');

class Localization {
  constructor () {
     // check for project keys
    let { CROWDIN_KEY,  CROWDIN_PROJECT_NAME } = process.env;
    if (!CROWDIN_KEY || !CROWDIN_PROJECT_NAME) {
      console.error('Config keys missing.')
      process.exit(1);
    }

    this.crowdinProjectName = CROWDIN_PROJECT_NAME;
    this.crowdinKey = CROWDIN_KEY;
    this.provider = this.createProviderInstance();

    this.downloadFiles();
  }

  createProviderInstance() {
    let provider = axios.create({
      baseURL: `https://api.crowdin.com/api/project/${CROWDIN_PROJECT_NAME}`,
    });
    provider.interceptors.request.use(function (config) {
      config.url = `${config.url}/?key=${CROWDIN_KEY}&json=true`
      return config;
    });
    return provider;
  }

  async downloadFiles() {
     // TODO: check git msg also
    if (!process.env.SKIP_DOWNLOAD) {
      const zip = await crowdin.get('info');
      console.log(zip.data)
    }
  }
}

// (async () => {
//   try {
//     // check for project keys
//     let { CROWDIN_KEY,  CROWDIN_PROJECT_NAME } = process.env;
//     if (!CROWDIN_KEY || !CROWDIN_PROJECT_NAME) {
//       console.error('Config keys missing.')
//       process.exit(1);
//     }

//     // create crowdin axios instance


//     // download proccess
//     // TODO: check git msg also
//     if (!process.env.SKIP_DOWNLOAD) {
//       const zip = await crowdin.get('info');
//       console.log(zip.data)
//     }

//   } catch(e) {
//     console.error('Something went wrong');
//     process.exit(1);
//   }
// })()

// initiate
try {
  new Localization()
} catch(e) {
  console.error('Something went wrong');
  process.exit(1);
}
