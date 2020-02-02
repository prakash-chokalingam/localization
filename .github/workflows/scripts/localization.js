const github = require('@actions/github');

const axios = require('axios');
const fs = require('fs');
const path = require('path');

process.env.CROWDIN_KEY = '0f6c88b33fb60c125d53d5c4dffc0cf1';
process.env.CROWDIN_PROJECT_NAME = 'fd-test';
process.env.TOKEN = 'bdd0f1a49708f68d98e28f46a845d01103f9ed82';

// process.env.SKIP_DOWNLOAD = false;
process.env.SKIP_CROWDIN_BUILD=true;

class Localization {
  constructor () {
     // check for project keys
    let { CROWDIN_KEY, CROWDIN_PROJECT_NAME, TOKEN } = process.env;
    if (!CROWDIN_KEY || !CROWDIN_PROJECT_NAME || !TOKEN) {
      console.error('Config keys missing.')
      process.exit(1);
    }
    this.gitContext =  github.context.payload;
    this.gitMessage = github.context.payload.head_commit.message;
    // this.gitMessage = '/';
    this.provider = this.createProviderInstance(CROWDIN_KEY, CROWDIN_PROJECT_NAME);
    this.octokit = new github.GitHub(TOKEN);
    this.downloadFiles();
    this.uploadFiles();
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
    let skipDownload = SKIP_DOWNLOAD | this.gitMessage.includes('--skip-download');
    skipDownload && console.log('Download skipped');

    if (!skipDownload) {
      console.log('Downloading files from provider...');
      SKIP_CROWDIN_BUILD && console.log('Provider build skipped.');
      let downloadUrl = (SKIP_CROWDIN_BUILD) ? '/download/all.zip' : '/export';
      try {
        let files = await this.provider.get(downloadUrl);
        let zipPath = this.createZipFile(files.data);
        let branch = await this.createBranch();
      } catch(e) {
        console.log('❌ Downloading files failed');
        console.log(e)
      }
    }
  }


  async uploadFiles() {
    let { SKIP_UPLOAD } = process.env;
    let skipUpload = SKIP_UPLOAD | this.gitMessage.includes('--skip-upload');
    skipUpload && console.log('Uploading to provider skipped');

    if (!skipUpload) {
      console.log('Uploading files from provider...');
    }
  }

  createZipFile(data) {
    let dir = path.resolve('./tmp');
    let zipPath = `${dir}/all.zip`;
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    fs.writeFileSync(zipPath, data, { encoding: 'ascii'});
    return zipPath;
  }

  async createBranch() {
    let owner = this.gitContext.repository.owner.name;
    let date = new Date();
    let ref = `refs/localization/update_${date.getDate()}-${date.getMonth()-1 || 1}-${date.getFullYear()}_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}_${date.getMilliseconds()}`
    await this.octokit.git.createRef({
      owner,
      repo,
      ref,
      sha: this.gitContext.sha,
    })
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
