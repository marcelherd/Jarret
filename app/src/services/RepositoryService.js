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
  }
};
