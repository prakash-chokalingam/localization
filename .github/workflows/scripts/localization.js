const axios = require('axios');
const fs = require('fs');
const path = require('path');


process.env.CROWDIN_KEY = '0f6c88b33fb60c125d53d5c4dffc0cf1';
process.env.CROWDIN_PROJECT_NAME = 'fd-test';
// process.env.SKIP_DOWNLOAD = false;
process.env.SKIP_CROWDIN_BUILD=true;

class Localization {
  constructor () {
     // check for project keys
    let { CROWDIN_KEY, CROWDIN_PROJECT_NAME } = process.env;
    if (!CROWDIN_KEY || !CROWDIN_PROJECT_NAME) {
      console.error('Config keys missing.')
      process.exit(1);
    }

    this.provider = this.createProviderInstance(CROWDIN_KEY, CROWDIN_PROJECT_NAME);
    this.downloadFiles();
  }

  createProviderInstance(key, project) {
    let provider = axios.create({
      baseURL: `https://api.crowdin.com/api/project/${project}`,
    });
    provider.interceptors.request.use(function (config) {
      config.url = `${config.url}/?key=${key}&json=true`
      return config;
    });
    return provider;
  }

  async downloadFiles() {
    let { SKIP_DOWNLOAD, SKIP_CROWDIN_BUILD } = process.env;

    // TODO: check git msg also
    let skipDownload = SKIP_DOWNLOAD;
    skipDownload && console.log('Download skipped');

    if (!skipDownload) {
      console.log('Downloading files from provider...');
      SKIP_CROWDIN_BUILD && console.log('Provider build skipped.');
      let downloadUrl = (SKIP_CROWDIN_BUILD) ? '/download/all.zip' : '/export';
      try {
        let files = await this.provider.get(downloadUrl);
        let dir = path.resolve('./tmp');
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        fs.writeFileSync(`${dir}/all.zip`, files.data, { encoding: 'ascii'});
        console.log('Created')
      } catch(e) {
        console.log('❌ Downloading files failed');
        console.log(e)
      }
    }
  }
}

// initiate
try {
  new Localization()
} catch(e) {
  console.log(e)
  console.error('Something went wrong');
  process.exit(1);
}
