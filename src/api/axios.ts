import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/v1/",
  // baseURL: "http://192.168.1.190:5000/v1/",
  timeout: 1000,
  withCredentials: true,
});

// Add a response interceptor
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.error(error.response.status, error.message);

    switch (error.response.status) {
    }

    return Promise.reject(error);
  },
);

export default instance;
