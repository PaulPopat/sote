module.exports = {
  get: async () => {
    return {
      status: 200,
      data: {
        name: "Paul Popat",
        people: { names: ["Some guy", "Some other guy"] },
        show: true,
        get_name: () => "Test Name"
      },
    };
  },
};
