<template>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
      <h1 class="display-4">Jarret</h1>
      <p class="lead">Welcome to Jarret, your simple software provisioning server.</p>
    </div>
  </div>
  <div class="container">
    <h3 class="mb-4">Create New Deployment</h3>
    <div v-if="flashMessage" class="alert alert-dismissible fade show" :class="{ 'alert-success': flashMessage.type === 'success', 'alert-danger': flashMessage.type === 'error' }" role="alert">
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
      </div>
      <button v-if="deploymentEnabled" type="submit" class="btn btn-primary">Run Deployment</button>
      <button v-if="!deploymentEnabled" type="button" class="btn btn-primary" disabled>
        <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
        Deployment in progress...
      </button>
    </form>
    <h3 class="mb-4 mt-5">Deployment History</h3>
    <table class="table table-bordered table-hover">
      <thead>
        <tr>
          <th>Status</th>
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
          <td>{{ t.release.name }}</td>
          <td>{{ t.release.branch }}</td>
          <td>{{ formatDate(t.started_at) }}</td>
          <td>{{ formatDate(t.finished_at) }}</td>
          <td>
            <button @click="onClickRollback(t)" class="btn btn-danger btn-block m-0" :class="{ 'disabled': !deploymentEnabled }" type="button">Rollback</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <footer class="footer">
    <div class="container">
      <span class="text-muted float-left">Copyright &copy; 2021 Marcel Herd</span>
      <span class="text-muted float-right">Jarret v0.3.0</span>
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
      flashMessage: null,
      deploymentEnabled: false,
      deploymentType: 'new',
      repository: null,
      repositories: [],
      source: null,
      sources: [],
      tasks: []
    }
  },
  async created() {
    await this.updateRepositories();
    await this.updateSources();
    await this.updateHistory();
    this.deploymentEnabled = true;
  },
  methods: {
    formatDate(date) {
      return new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(date));
    },
    onClickCloseFlashMessage() {
      this.flashMessage = null;
    },
    async onClickRollback(task) {
      if (!this.deploymentEnabled) return;

      this.deploymentEnabled = false;

      await RepositoryService.deploy(this.repository, task.release);
      await this.updateHistory();

      this.deploymentEnabled = true;

      this.flashMessage = {
        type: 'success',
        content: `Successfully rolled back to ${task.release.name}.`
      };
    },
    onChangeType() {
      this.updateSources();
    },
    onChangeRepository() {
      this.updateSources();
      this.updateHistory();
    },
    async onSubmitDeployment() {
      if (!this.deploymentEnabled) return;

      this.deploymentEnabled = false;

      let releaseToDeploy = this.source;

      if (this.deploymentType === 'new') {
        const release = await RepositoryService.createRelease(this.repository, this.source);
        releaseToDeploy = release;
      }

      await RepositoryService.deploy(this.repository, releaseToDeploy);
      await this.updateHistory();

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
      // TODO: Order releases by newest, for branches master should be first
      if (this.deploymentType === 'new') {
        this.sources = await RepositoryService.getBranches(this.repository);
      } else {
        this.sources = await RepositoryService.getReleases(this.repository);
      }
      this.source = this.sources[0];
    },
    async updateHistory() {
      this.tasks = await RepositoryService.getTasks(this.repository);
    }
  }
}
</script>

<style>
body {
  margin-bottom: 120px;
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
