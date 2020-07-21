const fs = require("fs-extra");

module.exports = {
  get: async () => ({
    status: 200,
    data: {
      name: "Paul Popat",
      people: { names: ["Some guy", "Some other guy"] },
      show: true,
      get_name: () => "Test Name",
    },
  }),
  post: async (query, body) => {
    return {
      status: 200,
      data: {
        name: "Paul Popat",
        people: { names: ["Some guy", "Some other guy"] },
        show: true,
        get_name: () => "Test Name",
      },
    };
  },
};
