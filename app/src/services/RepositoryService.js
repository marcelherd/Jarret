import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "development" ? "//localhost:4434" : "";

export default {
  async getRepositories() {
    const response = await axios.get(`${BASE_URL}/api/v1/repository`);
    return response.data;
  },
  async getDeploymentStatus(repository) {
    if (!repository) return {};

    const response = await axios.get(
      `${BASE_URL}/api/v1/repository/${repository.id}/deploymentStatus`
    );
    return response.data;
  },
  async getBranches(repository) {
    if (!repository) return [];

    const response = await axios.get(
      `${BASE_URL}/api/v1/repository/${repository.id}/branches`
    );
    return response.data;
  },
  async getReleases(repository) {
    if (!repository) return [];

    const response = await axios.get(
      `${BASE_URL}/api/v1/repository/${repository.id}/releases`
    );
    return response.data;
  },
  async getTasks(repository) {
    if (!repository) return [];

    const response = await axios.get(
      `${BASE_URL}/api/v1/repository/${repository.id}/tasks`
    );
    return response.data;
  },
  async getEnvironments(repository) {
    if (!repository) return [];

    const response = await axios.get(
      `${BASE_URL}/api/v1/repository/${repository.id}/environments`
    );
    return response.data;
  },
  async createRelease(repository, branch) {
    // http:/api/v1/repository/2/releases
    const response = await axios.post(
      `${BASE_URL}/api/v1/repository/${repository.id}/releases`,
      {
        branch: branch.name
      }
    );

    return response.data;
  },
  async deploy(repository, release, environment) {
    const options = environment ? { environment } : {};
    const response = await axios.post(
      `${BASE_URL}/api/v1/repository/${repository.id}/releases/${release.id}/deploy`,
      options
    );

    return response.data;
  },
  async forceUpdateBranches(repository) {
    if (!repository) return [];

    const response = await axios.put(
      `${BASE_URL}/api/v1/repository/${repository.id}/branches`
    );
    return response.data;
  }
};
