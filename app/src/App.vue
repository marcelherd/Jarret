<template>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
      <h1 class="display-4">Jarret</h1>
      <p class="lead">Welcome to Jarret, your simple CI/CD server.</p>
    </div>
  </div>
  <div v-if="!initialized" class="container">
    <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
    Fetching data, please be patient...
  </div>
  <div v-if="initialized && repositories.length === 0" class="container">
    <p class="lead">Looks like you have not configured any repositories yet.</p>
    <p class="mb-0">You will need to create a configuration for your repository, such as <mark>/api/taskConfigs/jarret.yaml</mark></p>    
    <pre class="mb-0">
      <code class="language-yaml mb-0">
repository:
  name: 'Jarret'
  uri: 'https://github.com/marcelherd/Jarret.git'
  environments:
    Development:
      node_env: 'development'
    Production:
      node_env: 'production'
  commands:
    - 'npm install'
    - 'npm run lint'
    - 'npm run test'
    - 'npm run gulp'
    - 'rm -Rf .git'
    - 'cp -R . /opt/jarret'
    - 'cd /opt/jarret'
    - 'NODE_ENV=${node_env} npm start'
      </code>
    </pre>
    <p class="lead">Did you already create a configuration?</p>
    <p>You will have to restart Jarret to pick up newly created configurations. Jarret can handle updates to existing configurations on-the-fly.</p>
  </div>
  <div v-if="initialized && repositories.length > 0" class="container">
    <h3 class="mb-4">Create New Deployment</h3>
    <div v-if="flashMessage" class="alert alert-dismissible fade show" role="alert" 
      :class="{ 
        'alert-success': flashMessage.type === 'success', 
        'alert-danger': flashMessage.type === 'error',
        'alert-info': flashMessage.type === 'info' 
      }">
      <span>{{ flashMessage.content }}</span>
      <button @click="onClickCloseFlashMessage" class="close" type="button" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <form @submit.prevent="onSubmitDeployment">
      <div class="form-group row">
        <label for="selectType" class="col-sm-2 col-form-label">Type</label>
        <div class="col-sm-3">
          <select v-model="deploymentType" @change="onChangeType" name="selectType" class="form-control">
            <option value="new">New Release</option>
            <option value="existing">Existing Release</option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="selectRepository" class="col-sm-2 col-form-label">Repository</label>
        <div class="col-sm-3">
          <select v-model="repository" @change="onChangeRepository" name="selectRepository" class="form-control">
            <option v-for="r in repositories" :key="r.id" :value="r">{{ r.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label for="selectSource" class="col-sm-2 col-form-label">
          {{ this.deploymentType === 'new' ? 'Branch' : 'Release' }}
        </label>
        <div class="col-sm-3">
          <select v-model="source" name="selectSource" class="form-control">
            <option v-for="s in sources" :key="s.id" :value="s">{{ s.name }}</option>
          </select>
        </div>
        <i v-if="this.deploymentType === 'new' && forceUpdateBranchesEnabled" 
          @click.once="onClickForceUpdateBranches" 
          class="col-form-label fas fa-sync form-icon-button"></i>
      </div>

      <div v-if="environments.length > 0" class="form-group row">
        <label for="selectEnvironment" class="col-sm-2 col-form-label">Environment</label>
        <div class="col-sm-3">
          <select v-model="environment" name="selectEnvironment" class="form-control">
            <option v-for="e in environments" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
      </div>

      <button v-if="deploymentEnabled" type="submit" class="btn btn-primary">Run Deployment</button>
      <button v-if="!deploymentEnabled" type="button" class="btn btn-primary" disabled>
        <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
        Deployment in progress...
      </button>
    </form>

    <h3 class="mb-4 mt-5">Current Status</h3>
    <table class="table table-bordered table-hover">
      <thead>
        <th>Status</th>
        <th>Environment</th>
        <th>Version</th>
        <th>Branch</th>
        <th>Deployed since</th>
      </thead>
      <tbody>
        <tr v-for="environment in Object.keys(status)" :key="status[environment].id">
          <td :class="{ 'table-success': status[environment].result === 'success', 'table-danger': status[environment].result === 'failure' }">
            {{ status[environment].result === 'success' ? 'Success' : status[environment].result === 'failure' ? 'Failure' : 'Never deployed'}}
          </td>
          <td>{{ environment }}</td>
          <td>{{ status[environment].release ? status[environment].release.name : 'N/A' }}</td>
          <td>{{ status[environment].release ? status[environment].release.branch : 'N/A' }}</td>
          <td>{{ status[environment].finished_at ? formatDate(status[environment].finished_at) : 'N/A' }}</td>  
        </tr>
      </tbody>
    </table>

    <h3 class="mb-4 mt-5">Deployment History</h3>
    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>Status</th>
          <th v-if="environment">Environment</th>
          <th>Version</th>
          <th>Branch</th>
          <th>Started at</th>
          <th>Finished at</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tasks" :key="t.id">
          <td :class="{ 'table-success': t.result === 'success', 'table-danger': t.result === 'failure' }">
            {{ t.result === 'success' ? 'Success' : 'Failure' }}
          </td>
          <td v-if="environment">{{ t.environment }}</td>
          <td>{{ t.release.name }}</td>
          <td>{{ t.release.branch }}</td>
          <td>{{ formatDate(t.started_at) }}</td>
          <td>{{ formatDate(t.finished_at) }}</td>
          <td>
            <!-- TODO: Handle repositories with no environments -->
            <span class="no-wrap" v-if="environment && t.release.name === status[t.environment].release.name">Deployed: <mark>{{ t.environment }}</mark></span>
            <button v-else @click="onClickRollback(t)" class="btn btn-danger btn-block m-0" :class="{ 'disabled': !deploymentEnabled }" type="button">Rollback</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <footer class="footer">
    <div class="container">
      <span class="text-muted float-left">Copyright &copy; 2021 Marcel Herd</span>
      <span class="text-muted float-right">Jarret v0.4.1-alpha</span>
    </div>
  </footer>
</template>

<script>
import RepositoryService from '@/services/RepositoryService.js';

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      initialized: false,
      flashMessage: null,
      forceUpdateBranchesEnabled: true,
      deploymentEnabled: false,
      deploymentType: 'new',
      repository: null,
      repositories: [],
      source: null,
      sources: [],
      status: null,
      tasks: [],
      environment: null,
      environments: []
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      await this.updateRepositories();
      await this.updateSources();
      await this.updateEnvironments();
      await this.updateHistory();
      await this.updateStatus();
      this.deploymentEnabled = true;
      this.initialized = true;
    },
    formatDate(date) {
      const options = {
        day: "2-digit",
        month: "long",
        year: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: "UTC",
      };
      return new Intl.DateTimeFormat('default', options).format(new Date(date));
    },
    onClickCloseFlashMessage() {
      this.flashMessage = null;
    },
    async onClickRollback(task) {
      // TODO: Don't show the button for the current release
      
      if (!this.deploymentEnabled) return;

      this.deploymentEnabled = false;

      await RepositoryService.deploy(this.repository, task.release, this.environment);
      await this.updateHistory();
      await this.updateStatus();

      this.deploymentEnabled = true;

      this.flashMessage = {
        type: 'success',
        content: `Successfully rolled back to ${task.release.name}.`
      };
    },
    async onClickForceUpdateBranches() {
      this.forceUpdateBranchesEnabled = false;

      const response = await RepositoryService.forceUpdateBranches(this.repository);

      if (response.inserted.length > 0) {
        await this.updateSources();

        this.flashMessage = {
          type: 'success',
          content: `Successfully updated branches. Found ${response.inserted.length} new branch(es).`
        };
      } else {
        this.flashMessage = {
          type: 'info',
          content: `No new branches found.`
        };
      }
    },
    onChangeType() {
      this.updateSources();
    },
    onChangeRepository() {
      this.updateSources();
      this.updateEnvironments();
      this.updateHistory();
      this.updateStatus();
    },
    async onSubmitDeployment() {
      if (!this.deploymentEnabled) return;

      this.deploymentEnabled = false;

      let releaseToDeploy = this.source;

      if (this.deploymentType === 'new') {
        const release = await RepositoryService.createRelease(this.repository, this.source);
        releaseToDeploy = release;
      }

      await RepositoryService.deploy(this.repository, releaseToDeploy, this.environment);
      await this.updateHistory();
      await this.updateStatus();

      this.deploymentEnabled = true;

      this.flashMessage = {
        type: 'success',
        content: `Successfully deployed ${this.source.name}.`
      };
    },
    async updateRepositories() {
      this.repositories = await RepositoryService.getRepositories();
      this.repository = this.repositories[0];
    },
    async updateSources() {
      // TODO: These should be separate and 'Existing Release' should not be possible if there are none
      if (this.deploymentType === 'new') {
        this.sources = await RepositoryService.getBranches(this.repository);
      } else {
        this.sources = await RepositoryService.getReleases(this.repository);
      }
      this.source = this.sources[0];
    },
    async updateEnvironments() {
      this.environments = await RepositoryService.getEnvironments(this.repository);
      this.environment = (this.environments && this.environments.length > 0) ? this.environments[0] : null;
    },
    async updateHistory() {
      this.tasks = await RepositoryService.getTasks(this.repository);
    },
    async updateStatus() {
      this.status = await RepositoryService.getDeploymentStatus(this.repository);
    }
  }
}
</script>

<style>
body {
  margin-bottom: 120px;
}

.no-wrap {
  white-space: nowrap;
}

.form-icon-button {
  line-height: 1.5 !important;
  color: #2c3e50;
}

.form-icon-button:hover {
  cursor: pointer;
  color: #1e2b37;
}

.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
}

tbody tr td {
  vertical-align: middle !important;
}
</style>
