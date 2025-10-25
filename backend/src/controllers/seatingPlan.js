const {
  findSeatingPlanByPK,
  findSeatingPlanByTableNum,
  findSeatingPlanByRestaurantID,
  createSeatingPlan,
  updateSeatingPlanByPK,
  deleteSeatingPlanByPK,
} = require("../models/seatingPlan");

module.exports.createSeatingPlan = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });
    const { pax, tableType, tableNum } = req.body;
    const seatingInfo = { pax, tableType, tableNum };
    await createSeatingPlan(seatingInfo, restaurantID);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByTableNum = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    const tableNum = parseInt(req.params.tableNum);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByTableNum(tableNum, restaurantID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByRestaurantID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByRestaurantID(restaurantID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const results = await findSeatingPlanByPK(seatingID);

    return res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
  }
};

module.exports.updateSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const { pax, tableNum, tableType, isAvail } = req.body;

    if (pax || tableNum || tableType || isAvail) {
      const formattedData = {
        pax: pax,
        table_type: tableType,
        table_number: tableNum,
        is_available: isAvail,
      };

      await updateSeatingPlanByPK(seatingID, formattedData);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteSeatingPlanByPK = async (req, res) => {
  try {
    const seatingID = parseInt(req.params.seatingID);
    if (isNaN(seatingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteSeatingPlanByPK(seatingID);
  } catch (err) {
    console.log(err);
  }
};
