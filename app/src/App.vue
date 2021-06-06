<template>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
      <h1 class="display-4">Jarret</h1>
      <p class="lead">Welcome to Jarret.</p>
    </div>
  </div>
  <div class="container">
    <h3 class="mb-4">Create New Deployment</h3>
    <form>
      <div class="form-group row">
        <label for="selectType" class="col-sm-2 col-form-label">Type</label>
        <div class="col-sm-3">
          <select name="selectType" class="form-control">
            <option>New Release</option>
            <option>Existing Release</option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="selectRepository" class="col-sm-2 col-form-label">Repository</label>
        <div class="col-sm-3">
          <select name="selectRepository" class="form-control">
          </select>
        </div>
      </div>
      <div class="form-group row">
        <label for="selectSource" class="col-sm-2 col-form-label">Branch</label>
        <div class="col-sm-3">
          <select name="selectSource" class="form-control">
          </select>
        </div>
      </div>
      <button type="submit" class="btn btn-primary disabled">Run Deployment</button>
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
export default {
  name: 'App',
  components: {
  },
  data() {
    return {
    }
  },
  methods: {
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
</style>
