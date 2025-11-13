module.exports = (router) => {
  // =================================== Analytics Endpoints =====================================================================

  // Endpoint to create a new booking (Use Case 8: View Business Analysis)
  router.get("/analytics", (req, res) => {
    return res.status(200).json({
        message: "Analytics endpoint is up",
    });
  });

  // =================================== End of Analytics Endpoints =================================================================
};
