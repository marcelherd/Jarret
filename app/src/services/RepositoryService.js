import axios from "axios";

export default {
  async getRepositories() {
    const response = await axios.get("//localhost:3000/api/v1/repository");
    return response.data;
  },
  async getBranches(repository) {
    const response = await axios.get(
      `//localhost:3000/api/v1/repository/${repository.id}/branches`
    );
    return response.data;
  },
  async getReleases(repository) {
    const response = await axios.get(
      `//localhost:3000/api/v1/repository/${repository.id}/releases`
    );
    return response.data;
  },
  async getTasks(repository) {
    const response = await axios.get(
      `//localhost:3000/api/v1/repository/${repository.id}/tasks`
    );
    return response.data;
  },
  async getEnvironments(repository) {
    const response = await axios.get(
      `//localhost:3000/api/v1/repository/${repository.id}/environments`
    );
    return response.data;
  },
  async createRelease(repository, branch) {
    // http://localhost:3000/api/v1/repository/2/releases
    const response = await axios.post(
      `//localhost:3000/api/v1/repository/${repository.id}/releases`,
      {
        branch: branch.name
      }
    );

    return response.data;
  },
  async deploy(repository, release, environment) {
    const options = environment ? { environment } : {};
    const response = await axios.post(
      `http://localhost:3000/api/v1/repository/${repository.id}/releases/${release.id}/deploy`,
      options
    );

    return response.data;
  },
  async forceUpdateBranches(repository) {
    const response = await axios.put(
      `http://localhost:3000/api/v1/repository/${repository.id}/branches`
    );
    return response.data;
  }
};
